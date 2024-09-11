import modeService from "../services/modeService.js";
import washingService from "../services/washingService.js";
import paymentService from "../services/paymentService.js";
import transactionService from "../services/transactionService.js";
import firebaseService from "../services/firebaseService.js";

import { BIN } from "../config.js";

const intervalIDs = [];
const CHECK_INTERVAL_TIME_MIN = 1;
const MAX_MACHINE_START_ATTEMPTS = 6;
const DELAY_START = 30000; // 30 секунд для машин Samsung
const DOOR_CHECK_DELAY = 17000; // 17 секунд для машин TCL

// Функция для остановки всех таймеров для конкретной машины
function stopInterval(machineId) {
  if (intervalIDs[machineId]) {
    while (intervalIDs[machineId].length) {
      clearInterval(intervalIDs[machineId].pop());
    }
  }
}

// Генерация уникального идентификатора транзакции
function generateId() {
  let prvTxnId;
  do {
    prvTxnId = Math.floor(Math.random() * Math.pow(10, 19));
  } while (!paymentService.readPrvTxnId(prvTxnId));
  return prvTxnId;
}

// Основная функция оплаты и запуска стирки
async function pay(query) {
  const machine_id = parseInt(query.account);
  
  // 1. Проверяем, занята ли машина
  const lastState = await washingService.readLastWashingStateByMachineID(machine_id);
  
  if (lastState[0]?.state === "ACTIVE") {
    return {
      txn_id: query.txn_id,
      result: 6,
      bin: BIN,
      comment: "The machine is busy",
    };
  }

  // 2. Генерируем уникальный идентификатор транзакции и получаем цену режима
  const prvTxnId = generateId();
  const mode_id = parseInt(query.service_id);
  const mode_price = (await modeService.readPrice(mode_id))[0].price;

  // 3. Проверяем правильность суммы
  if (parseInt(query.sum) !== mode_price) {
    return {
      txn_id: query.txn_id,
      result: 5,
      bin: BIN,
      comment: "Incorrect price",
    };
  }

  // 4. Создаем запись о новой стирке
  const now = new Date();
  const washing = {
    start_time: now,
    is_door_open: 1, // Предполагаем, что дверь открыта перед запуском
    state: "ACTIVE",
    mode_id,
    machine_id,
  };
  const newWashing = await washingService.createWashing(washing);
  const washing_id = newWashing[0].insertId;

  // 5. Создаем запись об оплате
  const payment = {
    txn_id: query.txn_id,
    prv_txn_id: prvTxnId,
    sum: mode_price,
    status: "PAID",
  };
  const newPayment = await paymentService.createPayment(payment);
  const payment_id = newPayment[0].insertId;

  // 6. Создаем запись транзакции
  const transaction = {
    transaction_date: now,
    washing_id,
    payment_id,
  };
  const newTransaction = await transactionService.createTransaction(transaction);
  const transaction_id = newTransaction[0].insertId;

  // 7. Определяем логику запуска стирки в зависимости от машины
  if (machine_id >= 1000) {
    // Машины Samsung
    await startMachineSamsung(machine_id, mode_id, washing_id);
  } else {
    // Машины TCL
    await startMachineTCL(machine_id, mode_id, washing_id, transaction_id);
  }

  return {
    txn_id: query.txn_id,
    prv_txn_id: prvTxnId,
    result: 0,
    sum: parseInt(query.sum),
    bin: BIN,
    comment: "Pay item found",
  };
}

// Функция запуска машин Samsung
async function startMachineSamsung(machine_id, mode_id, washing_id) {
  try {
    await firebaseService.writeData({ machine_status: 1 }, machine_id);

    let attempts = 0;
    const machineCheckInterval = setInterval(async () => {
      const machineState = await firebaseService.readData(machine_id);
      
      if (machineState.machine_status === 1 && machineState.output.isDoorOpen === 0) {
        clearInterval(machineCheckInterval);
        await firebaseService.writeStartStopData({ machine_status: 1, mode: mode_id }, machine_id);
      } else if (attempts >= MAX_MACHINE_START_ATTEMPTS) {
        clearInterval(machineCheckInterval);
        await firebaseService.writeData({ machine_status: -1 }, machine_id);
      }

      attempts++;
    }, 5000); // Интервалы проверок каждые 5 секунд
  } catch (error) {
    console.log("Ошибка запуска машины Samsung:", error.message);
    throw new Error("Machine start failed");
  }
}

// Функция запуска машин TCL
async function startMachineTCL(machine_id, mode_id, washing_id, transaction_id) {
  try {
    await firebaseService.writeData({ machine_status: 1 }, machine_id);
    await firebaseService.writeStartStopData({ machine_status: 1, mode: mode_id }, machine_id);

    setTimeout(async () => {
      const machineState = await firebaseService.readData(machine_id);
      
      if (machineState.output.isDoorOpen === 0) {
        await washingService.updateWashing(washing_id, { state: "AVAILABLE", is_door_open: 0 });
      } else {
        await firebaseService.writeData({ machine_status: -1 }, machine_id);
        await firebaseService.writeStartStopData({ machine_status: -1 }, machine_id);
      }
    }, DOOR_CHECK_DELAY);

    // Устанавливаем периодическую проверку состояния для стирки
    if (!intervalIDs[machine_id]) {
      intervalIDs[machine_id] = [];
    }

    intervalIDs[machine_id].push(
      setInterval(processWashing, CHECK_INTERVAL_TIME_MIN * 60 * 1000, washing_id, transaction_id)
    );
  } catch (error) {
    console.log("Ошибка запуска машины TCL:", error.message);
    throw new Error("Machine start failed");
  }
}

// Функция обработки процесса стирки (может быть вызвана по таймеру)
async function processWashing(washing_id) {
  const washing = await washingService.readWashing(washing_id);
  if (washing.state === "ACTIVE") {
    await checkDoorStatus(washing_id, washing.machine_id);
  }
}

// Функция проверки состояния дверцы машины
async function checkDoorStatus(washing_id, machine_id) {
  const machineState = await firebaseService.readData(machine_id);

  // Обновляем статус двери в базе данных
  await washingService.updateIsDoorOpenByID(washing_id, {
    is_door_open: machineState.output.isDoorOpen
  });

  if (machineState.output.isDoorOpen === 0) {
    await washingService.updateWashing(washing_id, { state: "AVAILABLE", is_door_open: 0 });
    stopInterval(machine_id); // Останавливаем интервалы, если дверь закрыта
    await firebaseService.writeData({ machine_status: 0 }, machine_id);
  }
}

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
