import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async/fixed';
import crypto from 'crypto'; // Для генерации уникального идентификатора
import logger from '../logger.js'; // Импорт логгера
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
    logger.info(`Interval for machine ${machineId} stopped.`);
  }
}


// Основная функция для проверки состояния дверцы машины
async function processWashing(washing_id) {
  logger.info(`Processing washing with ID: ${washing_id}`);
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
  logger.info(`Checking door status for washing ${washing_id}, machine ${machine_id}, check #${i + 1}`);
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
      logger.info(`Door is closed for washing ${machine_id}. Stopping interval for machine ${machine_id}.`);
      stopInterval(parseInt(machine_id));

      await washingService.updateWashing(washing_id, {
        state: "AVAILABLE",
        end_timer_val: json.output.timer,
        is_door_open: 0,
      });

      await firebaseService.writeData({ machine_status: 0 }, machine_id);
      await firebaseService.writeCheckData({ isChecking: 0 }, machine_id);
    }
    else {
    logger.warn(`Door is not closed for washing ${washing_id}, machine ${machine_id}.`);
    }
  }
}


// Функция для проверки состояния машины перед оплатой
async function check(query) {
  logger.info(`Checking machine status for account ${query.account} before payment.`);
  const washing = await washingService.readLastByMachineID(query.account);
  const firebaseState = await firebaseService.readData(query.account);

  const now = new Date().getTime();
  if (now / 1000 - firebaseState.output.timer > 10) {
    logger.warn(`Machine ${query.account} is not ready.`);
    console.log("machine not ready1");
    return {
      txn_id: query.txn_id,
      result: 6,
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
    logger.info(`Machine ${query.account} is ready (SAMSUNG).`);
    priceList = [priceList[6]];
    // console.log(priceList);
    if (firebaseState.output.isDoorOpen == 1) {
      logger.warn(`Machine ${query.account} is busy (door is closed).`);
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
    logger.info(`Machine ${query.account} is ready (TCL).`);
    console.log("machine ready TCL");
    if (washing.length > 1) {
      logger.warn(`Machine ${query.account} is busy (door is open).`);
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
  logger.info(`Machine ${query.account} passed all checks.`);
  return response;
}

// Обработка платежа за стирку
async function pay(query) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    logger.info(`Starting payment process for transaction ID: ${query.txn_id}`); // Логируем начало процесса
    const machine_id = parseInt(query.account);
    const lastState = await washingService.readLastWashingStateByMachineID(machine_id);

    if (lastState[0] === machine_id) {
      logger.warn(`Machine ${machine_id} is busy for transaction ${query.txn_id}`);
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

    // Получаем washing_id
    const newWashing = await washingService.createWashing(washing);
    const washing_id = newWashing.insertId; // Используем insertId

    if (!washing_id) {
      logger.error(`Failed to create washing record for transaction ${query.txn_id}`);
      throw new Error("Не удалось создать запись стирки (washing_id не найден)");
    }

    const payment = {
      txn_id: query.txn_id,
      prv_txn_id: prvTxnId,
      sum: mode_price,
      status: "PAID",
    };

    // Получаем payment_id
    const newPayment = await paymentService.createPayment(payment);
    const payment_id = newPayment.insertId; // Используем insertId

    if (!payment_id) {
      logger.error(`Failed to create payment record for transaction ${query.txn_id}`);
      throw new Error("Не удалось создать запись платежа (payment_id не найден)");
    }

    const transaction = {
      transaction_date: now,
      washing_id,
      payment_id,
    };

    // Создаем транзакцию
    await transactionService.createTransaction(transaction);
    await connection.commit();


    logger.info(`Payment for transaction ${query.txn_id} was successful`);

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
    logger.error(`Payment for transaction ${query.txn_id} failed: ${err.message}`, err);
    throw err;
  } finally {
    connection.release();
  }
}


// Функция для запуска машины после успешного платежа
async function startMachine(machine_id, mode_id, washing_id) {
  logger.info(`Starting machine ${machine_id} for washing ${washing_id}.`);
  if (machine_id >= 1000) {
    await firebaseService.writeData({ machine_status: 1 }, machine_id);

    setTimeout(async () => {
      const machineState = await firebaseService.readData(machine_id);
      if (machineState.machine_status === 1) {
        await firebaseService.writeStartStopData({ machine_status: 1 }, machine_id);

        // Проверка состояния машины через 1 минуту
        setTimeout(async () => {
          const updatedState = await firebaseService.readData(machine_id);

          if (updatedState.output.isDoorOpen === 1) {
            logger.info(`Door is closed. Continuing operation for machine ${machine_id}.`);
            await firebaseService.writeStartStopData({ machine_status: 1 }, machine_id);
            await resetMachine(machine_id);
          } else {
            logger.warn(`Door is open. Proceeding with reset after all operations.`);
            await resetMachine(machine_id);
          }
        }, 60 * 1000); // Задержка в 1 минуту

        // Вторая проверка состояния машины через 2 минуты
        setTimeout(async () => {
          const updatedState = await firebaseService.readData(machine_id);
          if (updatedState.output.isDoorOpen === 1) {
            logger.info(`Final check passed. Machine ${machine_id} operating normally.`);
            await firebaseService.writeStartStopData({ machine_status: 1 }, machine_id);
          } else {
            logger.warn(`Final check failed. Resetting machine ${machine_id}.`);
            await resetMachine(machine_id);
          }
        }, 2 * 60 * 1000); // Задержка в 2 минуты

        // Третья проверка состояния машины через 3 минуты
        setTimeout(async () => {
          const finalState = await firebaseService.readData(machine_id);
          if (finalState.output.isDoorOpen !== 1) {
            logger.error(`Final state check failed. Machine ${machine_id} reset.`);
            await resetMachine(machine_id);
          }
        }, 3 * 60 * 1000); // Задержка в 3 минуты
      }
    }, 60 * 1000); // Задержка в 1 минуту
  } else {
    await firebaseService.writeData({ machine_status: 1 }, machine_id);
    await firebaseService.writeStartStopData({ machine_status: 1, mode: mode_id }, machine_id);

    const intervalId = setIntervalAsync(async () => {
      await processWashing(washing_id);
    }, checkIntervalTimeMin * 60 * 1000);

    intervalMap.set(machine_id, intervalId);

    // Добавляем задержку перед сбросом (2-3 секунды)
    setTimeout(async () => {
      await resetMachine(machine_id);
    }, 3000);  // Задержка в 3 секунды

    // Перевод состояния из ACTIVE в AVAILABLE через 15 минут
    setTimeout(async () => {
      await washingService.updateWashing(washing_id, {
        state: "AVAILABLE",
        end_timer_val: null,
        is_door_open: 0,
      });
      logger.info(`Machine ${machine_id} has been set to AVAILABLE after 15 minutes.`);
    }, 15 * 60 * 1000); // 15 минут задержка
  }
}



async function resetMachine(machine_id) {
  logger.warn(`Resetting machine ${machine_id} after all operations with delay.`);
  
  // Задержка перед сбросом (2-3 секунды)
  setTimeout(async () => {
      // Сбрасываем статус машины и режим
      await firebaseService.writeData({ machine_status: -1 }, machine_id);
      await firebaseService.writeStartStopData({ machine_status: -1, mode: -1 }, machine_id);  // Сбрасываем и статус, и режим
      logger.info(`Machine ${machine_id} has been reset with mode reset.`);
  }, 2000);  // Задержка 2 секунды
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
    logger.error(`Error processing payment request: ${err.message}`, err);
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
    logger.error(`Failed to retrieve price for service ${req.query.service_id}: ${err.message}`, err);
  } finally {
    res.json(json);
  }
};
