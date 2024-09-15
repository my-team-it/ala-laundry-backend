import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async/fixed';
import crypto from 'crypto'; // Для генерации уникального идентификатора

import { pool } from '../db.js'; // Импорт пула соединений из вашего модуля базы данных

import modeService from "../services/modeService.js";
import washingService from "../services/washingService.js";
import paymentService from "../services/paymentService.js";
import transactionService from "../services/transactionService.js";
import firebaseService from "../services/firebaseService.js";

import { BIN } from "../config.js";

// Используем Map для хранения интервалов
const intervalMap = new Map();
const checkIntervalTimeMin = 1

// Функция для генерации уникальных ID транзакций
function generateId() {
  return crypto.randomBytes(16).toString('hex');
}


// Остановка интервала для конкретной машины
async function stopInterval(machineId) {
  if (intervalMap.has(machineId)) {
    await clearIntervalAsync(intervalMap.get(machineId));
    intervalMap.delete(machineId);
  }
}


// Основная функция для проверки состояния дверцы машины
async function processWashing(washing_id) {
  const [washing] = await washingService.readWashing(washing_id);
  await firebaseService.writeCheckData({ isChecking: 1 }, washing.machine_id);
  const numCheck = 3
  
  if (washing.state === "ACTIVE") {
    for (let i = 0; i < numCheck; i++) {
      setTimeout(
        checkDoorStatus,
        (i + 1) * 15 * 1000,
        i,
        washing_id,
        washing.machine_id,
        numCheck
      );
    }
  }
}

async function checkDoorStatus(i, washing_id, machine_id, numCheck) {
  const json = await firebaseService.readData(machine_id);
  const key = `is_door_open_${i + 1}`; // Correctly form the key name
  const value = json.output.isDoorOpen;
  
  // Ensure you're passing an object with dynamically set property names
  let updateObj = {};
  updateObj[[key]] = value; // Set the dynamic key-value pair
  
  await washingService.updateIsDoorOpenByID(washing_id, updateObj); // Pass the correct object
  
  // Если это последний чек, проверяем статус дверцы
  if (i === numCheck - 1) {
    const isDoorOpenList = await washingService.readIsDoorOpenStatesByID(washing_id);
    const isDoorClosedOnAllChecks = Object.values(isDoorOpenList).every(status => !status);

    if (isDoorClosedOnAllChecks) {
      stopInterval(parseInt(machine_id));

      await washingService.updateWashing(washing_id, {
        state: "AVAILABLE",
        end_timer_val: json.output.timer,
        is_door_open: 0,
      });

      await firebaseService.writeData({ machine_status: 0 }, machine_id);
      await firebaseService.writeCheckData({ isChecking: 0 }, machine_id);
    }
  }
}


// Функция для проверки состояния машины перед оплатой
async function check(query) {
  const washing = await washingService.readLastByMachineID(query.account);
  const firebaseState = await firebaseService.readData(query.account);

  const now = new Date().getTime();
  if (now / 1000 - firebaseState.output.timer > 10) {
    console.log("machine not ready1");
    return {
      txn_id: query.txn_id,
      result: 5,
      bin: BIN,
      comment: "Machine is not ready",
    };
  }

  const listOfModeNames = await modeService.readNames();
  let priceList = listOfModeNames.map((key, index) => ({
    name: key.name,
    id: index + 1,
  }));

  if (query.account >= 1000) {
    console.log("machine ready SAMSUNG");
    priceList = [priceList[6]];
    // console.log(priceList);
    if (firebaseState.output.isDoorOpen == 1) {
      console.log("machine not ready5");
      return {
        txn_id: query.txn_id,
        result: 6,
        bin: BIN,
        comment: "The machine is busy",
      };
    }
  } else {
    priceList = priceList.slice(0,6)
    console.log("machine ready TCL");
    if (washing.length > 1) {
      if (washing[washing.length - 1].is_door_open == 1) {
        console.log("machine not ready2");
        return {
          txn_id: query.txn_id,
          result: 6,
          bin: BIN,
          comment: "The machine is busy",
        };
      }
    }
  }



  const response = {
    txn_id: query.txn_id,
    result: 0,
    fields: {
      services: priceList,
    },
    bin: BIN,
    comment: "Item found",
  };
  console.log("Item found");
  return response;
}

// Обработка платежа за стирку
async function pay(query) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const machine_id = parseInt(query.account);
    const lastState = await washingService.readLastWashingStateByMachineID(machine_id);

    if (lastState[0] === machine_id) {
      return {
        txn_id: query.txn_id,
        result: 6,
        bin: BIN,
        comment: "The machine is busy",
      };
    }

    const prvTxnId = generateId();
    const mode_id = parseInt(query.service_id);
    const mode_price = (await modeService.readPrice(mode_id))[0].price;

    if (parseInt(query.sum) !== mode_price) {
      return {
        txn_id: query.txn_id,
        result: 5,
        bin: BIN,
        comment: "Incorrect price",
      };
    }

    const now = new Date();
    const washing = {
      start_time: now,
      is_door_open: 1,
      state: "ACTIVE",
      mode_id,
      machine_id,
    };

    const newWashing = await washingService.createWashing(washing);
    const washing_id = newWashing.insertId;

    const payment = {
      txn_id: query.txn_id,
      prv_txn_id: prvTxnId,
      sum: mode_price,
      status: "PAID",
    };

    const newPayment = await paymentService.createPayment(payment);
    const payment_id = newPayment.insertId;

    const transaction = {
      transaction_date: now,
      washing_id,
      payment_id,
    };

    await transactionService.createTransaction(transaction);

    await connection.commit();

    await startMachine(machine_id, mode_id, washing_id);
    return {
      txn_id: query.txn_id,
      prv_txn_id: prvTxnId,
      result: 0,
      sum: parseInt(query.sum),
      bin: BIN,
      comment: "Pay item found",
    };
  } catch (err) {
    await connection.rollback();
    console.error("Ошибка при обработке платежа:", err);
    throw err;
  } finally {
    connection.release();
  }
}

// Функция для запуска машины после успешного платежа
async function startMachine(machine_id, mode_id, washing_id) {
  if (machine_id >= 1000) {
    await firebaseService.writeData({ machine_status: 1 }, machine_id);

    setTimeout(async () => {
      const machineState = await firebaseService.readData(machine_id);
      if (machineState.machine_status === 1) {
        await firebaseService.writeStartStopData({ machine_status: 1 }, machine_id);

        setTimeout(async () => {
          const updatedState = await firebaseService.readData(machine_id);

          if (updatedState.output.isDoorOpen === 0) {
            await firebaseService.writeStartStopData({ machine_status: 0 }, machine_id);
          } else {
            await resetMachine(machine_id);
          }
        }, 15000);

        setTimeout(async () => {
          const updatedState = await firebaseService.readData(machine_id);
          if (updatedState.output.isDoorOpen === 0) {
            await firebaseService.writeStartStopData({ machine_status: 1 }, machine_id);
          } else {
            await resetMachine(machine_id);
          }
        }, 30000);

        setTimeout(async () => {
          const finalState = await firebaseService.readData(machine_id);
          if (finalState.output.isDoorOpen !== 0) {
            await resetMachine(machine_id);
          }
        }, 45000);
      }
    }, 30000);
  } else {
    await firebaseService.writeData({ machine_status: 1 }, machine_id);
    await firebaseService.writeStartStopData({ machine_status: 1, mode: mode_id }, machine_id);

    const intervalId = setIntervalAsync(async () => {
      await processWashing(washing_id);
    }, checkIntervalTimeMin * 60 * 1000);

    intervalMap.set(machine_id, intervalId);
  }
}

// Функция сброса состояния машины
async function resetMachine(machine_id) {
  await firebaseService.writeData({ machine_status: -1 }, machine_id);
  await firebaseService.writeStartStopData({ machine_status: -1 }, machine_id);
}


// Экспорт контроллеров для работы с платежами
export const paymentProcess = async (req, res) => {
  let json;
  try {
    switch (req.query.command) {
      case "check":
        json = await check(req.query);
        break;
      case "pay":
        json = await pay(req.query);
        break;
      default:
        json = {
          txn_id: req.query.txn_id,
          result: 1,
          comment: "Command not found",
        };
    }
  } catch (err) {
    json = {
      txn_id: req.query.txn_id,
      result: 1,
      comment: "Error during processing",
      desc: err.message,
    };
  } finally {
    res.json(json);
  }
};

// Контроллер для получения цены услуги
export const getPrice = async (req, res) => {
  let json;
  try {
    const result = await modeService.readPrice(req.query.service_id);
    json = { sum: result[0].price, bin: BIN };
  } catch (err) {
    json = { result: 1, comment: "Service not found" };
  } finally {
    res.json(json);
  }
};