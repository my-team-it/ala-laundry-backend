import modeService from "../services/modeService.js";
import washingService from "../services/washingService.js";
import paymentService from "../services/paymentService.js";
import transactionService from "../services/transactionService.js";
import firebaseService from "../services/firebaseService.js";

import { BIN } from "../config.js";

const intervalIDs = [];

const checkIntervalTimeMin = 1

function stopInterval(machineId) {
  console.log(`Stopping intervals for machine ${machineId}`);
  while (intervalIDs[machineId].length) {
    clearInterval(intervalIDs[machineId].pop());
  }
}

async function processWashing(washing_id) {
  const [washing] = await washingService.readWashing(washing_id);
  console.log(`Processing washing ${washing_id} for machine ${washing.machine_id}`);
  await firebaseService.writeCheckData({ isChecking: 1 }, washing.machine_id);
  
  const numCheck = 3;
  if (washing.state === "ACTIVE") {
    for (let i = 0; i < numCheck; i++) {
      console.log(`Scheduling door check ${i + 1} for washing ${washing_id}`);
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
  console.log(`Starting door status check ${i + 1} for washing ID ${washing_id} and machine ID ${machine_id}`);
  
  try {
    const json = await firebaseService.readData(machine_id);
    console.log(`Firebase data for machine ${machine_id} received:`, json);

    const key = `is_door_open_${i + 1}`; 
    const value = json.output.isDoorOpen;
    console.log(`Door status at check ${i + 1} for machine ${machine_id} is: ${value}`);

    let updateObj = {};
    updateObj[[key]] = value; 
    console.log(`Updating washing service with door status:`, updateObj);

    await washingService.updateIsDoorOpenByID(washing_id, updateObj); 
    console.log(`Door status for washing ID ${washing_id} updated successfully in washing service.`);

    if (i === numCheck - 1) {
      console.log(`Reached final door check (${numCheck} checks) for washing ID ${washing_id}. Checking if door is closed on all checks.`);
      
      const isDoorOpenList = await washingService.readIsDoorOpenStatesByID(washing_id);
      console.log(`Door status list for washing ID ${washing_id}:`, isDoorOpenList);

      const isDoorClosedOnAllChecks = Object.values(isDoorOpenList).every(status => !status);
      console.log(`Is door closed on all checks? ${isDoorClosedOnAllChecks}`);

      if (isDoorClosedOnAllChecks) {
        console.log(`Door closed on all checks for machine ${machine_id}. Stopping intervals and marking washing as AVAILABLE.`);
        
        stopInterval(parseInt(machine_id));

        await washingService.updateWashing(washing_id, {
          state: "AVAILABLE",
          end_timer_val: json.output.timer,
          is_door_open: 0,
        });
        console.log(`Washing ID ${washing_id} marked as AVAILABLE, door status updated.`);

        await firebaseService.writeData({ machine_status: 0 }, machine_id);
        console.log(`Machine ${machine_id} status updated to 0 (OFF) in Firebase.`);

        await firebaseService.writeCheckData({ isChecking: 0 }, machine_id);
        console.log(`isChecking flag updated to 0 for machine ${machine_id} in Firebase.`);
      }
    }
  } catch (error) {
    console.error(`Error during door status check ${i + 1} for washing ID ${washing_id} and machine ID ${machine_id}:`, error);
  }
}



function generateId() {
  let prvTxnId;
  let isUnique = false;
  let attemptCount = 0; // счетчик попыток

  console.log("Starting transaction ID generation.");

  do {
    prvTxnId = Math.floor(Math.random() * Math.pow(10, 19));
    attemptCount++;
    console.log(`Generated transaction ID: ${prvTxnId}, attempt: ${attemptCount}`);

    // Проверяем, существует ли такой ID в базе данных
    isUnique = paymentService.readPrvTxnId(prvTxnId);
    console.log(`Is transaction ID ${prvTxnId} unique? ${isUnique ? "Yes" : "No"}`);

  } while (!isUnique);

  console.log(`Unique transaction ID ${prvTxnId} generated after ${attemptCount} attempts.`);
  return prvTxnId;
}


async function check(query) {
  console.log("Start processing 'check' command.");
  console.log(`Received account ID: ${query.account}, transaction ID: ${query.txn_id}`);

  // Получаем последнюю стирку по ID машины
  const washing = await washingService.readLastByMachineID(query.account);
  console.log(`Last washing state for machine ${query.account}:`, washing);

  // Получаем текущее состояние машины из Firebase
  const firebaseState = await firebaseService.readData(query.account);
  console.log(`Firebase state for machine ${query.account}:`, firebaseState);

  const now = new Date().getTime();
  
  // Проверка времени работы машины
  if (now / 1000 - firebaseState.output.timer > 10) {
    console.log("Machine is not ready due to timer check.");
    return {
      txn_id: query.txn_id,
      result: 5,
      bin: BIN,
      comment: "Machine is not ready",
    };
  }

  // Получаем список режимов стирки
  const listOfModeNames = await modeService.readNames();
  let priceList = listOfModeNames.map((key, index) => ({
    name: key.name,
    id: index + 1,
  }));
  console.log("Available modes:", priceList);

  // Если это машина с ID >= 1000 (например, SAMSUNG)
  if (query.account >= 1000) {
    console.log("Detected SAMSUNG machine.");
    priceList = [priceList[6]]; // Специальное правило для SAMSUNG
    console.log("Selected mode for SAMSUNG:", priceList[0]);

    if (firebaseState.output.isDoorOpen == 1) {
      console.log("Machine is busy, door is open.");
      return {
        txn_id: query.txn_id,
        result: 6,
        bin: BIN,
        comment: "The machine is busy",
      };
    }
  } else {
    // Для других машин (например, TCL)
    priceList = priceList.slice(0, 6);
    console.log("Detected TCL machine, available modes:", priceList);

    // Проверяем состояние последней стирки
    if (washing.length > 1 && washing[washing.length - 1].is_door_open == 1) {
      console.log("Machine is busy, door is open during last washing.");
      return {
        txn_id: query.txn_id,
        result: 6,
        bin: BIN,
        comment: "The machine is busy",
      };
    }
  }

  // Формируем ответ для клиента
  const response = {
    txn_id: query.txn_id,
    result: 0,
    fields: {
      services: priceList,
    },
    bin: BIN,
    comment: "Item found",
  };
  console.log("Item found, sending response:", response);
  
  return response;
}


async function pay(query) {
  console.log("Processing payment for account:", query.account);

  const machine_id = parseInt(query.account);
  const lastState = await washingService.readLastWashingStateByMachineID(machine_id);

  // Проверяем, не занята ли машина
  if (lastState[0] === machine_id) {
    console.log("Machine is busy, payment aborted.");
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

  // Проверяем корректность суммы
  if (parseInt(query.sum) !== mode_price) {
    console.log("Incorrect price, payment aborted.");
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

  // Создаем запись стирки
  const newWashing = await washingService.createWashing(washing);
  const washing_id = newWashing[0].insertId;

  // Создаем запись платежа
  const payment = {
    txn_id: query.txn_id,
    prv_txn_id: prvTxnId,
    sum: mode_price,
    status: "PAID",
  };
  const newPayment = await paymentService.createPayment(payment);
  const payment_id = newPayment[0].insertId;

  // Создаем запись транзакции
  const transaction = {
    transaction_date: now,
    washing_id,
    payment_id,
  };
  await transactionService.createTransaction(transaction);

  // Обработка в зависимости от типа машины
  if (machine_id >= 1000) {
    console.log("Processing SAMSUNG machine...");
    await handleSamsungMachine(machine_id);
  } else {
    console.log("Processing TCL machine...");
    await handleTCLMachine(machine_id, mode_id, washing_id);
  }

  // Возвращаем успешный результат
  console.log("Payment processed successfully.");
  return {
    txn_id: query.txn_id,
    prv_txn_id: prvTxnId,
    result: 0,
    sum: parseInt(query.sum),
    bin: BIN,
    comment: "Pay item found",
  };
}

// Обработка SAMSUNG машин
async function handleSamsungMachine(machine_id) {
  await firebaseService.writeData({ machine_status: 1 }, machine_id);
  console.log("Machine started.");

  setTimeout(async () => {
    const machineState = await firebaseService.readData(machine_id);

    if (machineState.machine_status === 1) {
      await updateMachineStatusWithRetries(machine_id);
    }
  }, 30000);
}

// Обработка TCL машин
async function handleTCLMachine(machine_id, mode_id, washing_id) {
  await firebaseService.writeData({ machine_status: 1 }, machine_id);
  await firebaseService.writeStartStopData({ machine_status: 1, mode: mode_id }, machine_id);

  console.log("Machine started with mode:", mode_id);

  setTimeout(async () => {
    await firebaseService.writeData({ machine_status: -1 }, machine_id);
    await firebaseService.writeStartStopData({ machine_status: -1, mode: -1 }, machine_id);
    console.log("Machine reset after 17 seconds.");
  }, 17000);

  setTimeout(async () => {
    await washingService.updateWashing(washing_id, {
      state: "AVAILABLE",
      is_door_open: 0,
    });
    console.log("Washing state updated to AVAILABLE after 15 minutes.");
  }, 15 * 60 * 1000);
}

// Функция для проверки состояния машины с повторами
async function updateMachineStatusWithRetries(machine_id) {
  for (let delay of [15000, 30000, 45000]) {
    setTimeout(async () => {
      const updatedState = await firebaseService.readData(machine_id);
      if (updatedState.output.isDoorOpen == 0) {
        console.log(`Machine door closed, setting status to 1 after ${delay / 1000} seconds.`);
        await firebaseService.writeStartStopData({ machine_status: 1 }, machine_id);
      } else {
        console.log(`Machine door open, resetting machine after ${delay / 1000} seconds.`);
        await firebaseService.writeData({ machine_status: -1 }, machine_id);
        await firebaseService.writeStartStopData({ machine_status: -1 }, machine_id);
      }
    }, delay);
  }
}


export const paymentProcess = async (req, res) => {
  let json;

  try {
    // Логирование начала процесса
    console.log(`Processing payment command: ${req.query.command} for txn_id: ${req.query.txn_id}`);

    switch (req.query.command) {
      case "check":
        console.log(`Checking payment status for txn_id: ${req.query.txn_id}`);
        json = await check(req.query);
        console.log(`Check completed for txn_id: ${req.query.txn_id}`, json);
        break;

      case "pay":
        console.log(`Processing payment for txn_id: ${req.query.txn_id}`);
        json = await pay(req.query);
        console.log(`Payment processed for txn_id: ${req.query.txn_id}`, json);
        break;

      default:
        console.warn(`Invalid command received: ${req.query.command} for txn_id: ${req.query.txn_id}`);
        json = {
          txn_id: req.query.txn_id,
          result: 1,
          comment: "Command not found",
        };
    }
  } catch (err) {
    // Логирование ошибки с дополнительной информацией
    console.error(`Error during payment processing for txn_id: ${req.query.txn_id}`, err);

    json = {
      txn_id: req.query.txn_id,
      result: 1,
      comment: "Error during processing",
      desc: err.message,
    };
  } finally {
    // Логирование завершения обработки и отправки ответа
    console.log(`Response sent for txn_id: ${req.query.txn_id}`, json);
    res.json(json);
  }
};


export const getPrice = async (req, res) => {
  let json;

  try {
    // Логирование начала процесса получения цены
    console.log(`Fetching price for service_id: ${req.query.service_id}`);

    // Получение цены из сервиса
    const result = await modeService.readPrice(req.query.service_id);

    if (result && result.length > 0) {
      // Лог успешного получения данных
      console.log(`Price found for service_id: ${req.query.service_id}`, result);

      // Формирование ответа
      json = { sum: result[0].price, bin: BIN };
    } else {
      // Логирование случая, когда услуга не найдена
      console.warn(`Service not found for service_id: ${req.query.service_id}`);
      json = { result: 1, comment: "Service not found" };
    }
  } catch (err) {
    // Логирование ошибки с описанием
    console.error(`Error fetching price for service_id: ${req.query.service_id}`, err);
    json = { result: 1, comment: "Service not found", error: err.message };
  } finally {
    // Логирование отправки ответа
    console.log(`Response sent for service_id: ${req.query.service_id}`, json);
    res.json(json);
  }
};

