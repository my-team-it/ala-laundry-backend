import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async/fixed';

import modeService from "../services/modeService.js";
import washingService from "../services/washingService.js";
import paymentService from "../services/paymentService.js";
import transactionService from "../services/transactionService.js";
import firebaseService from "../services/firebaseService.js";

import { BIN } from "../config.js";

const intervalIDs = [];
const intervalMap = new Map();
const checkIntervalTimeMin = 1


async function startInterval(machineId, washingId) {
  if (intervalMap.has(machineId)) {
    await clearIntervalAsync(intervalMap.get(machineId));
  }

  const interval = setIntervalAsync(async () => {
    await processWashing(washingId);
  }, checkIntervalTimeMin * 60 * 1000);

  intervalMap.set(machineId, interval);
}

async function stopInterval(machineId) {
  if (intervalMap.has(machineId)) {
    await clearIntervalAsync(intervalMap.get(machineId));
    intervalMap.delete(machineId);
  }
}
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
  
  if (i === numCheck - 1) {
    const isDoorOpenList = await washingService.readIsDoorOpenStatesByID(washing_id);
    const isDoorClosedOnAllChecks = Object.values(isDoorOpenList).every(status => !status);
    
    if (isDoorClosedOnAllChecks) {
      stopInterval(parseInt(machine_id));
      
      await washingService.updateWashing(washing_id, {
        state: "AVAILABLE",
        end_timer_val: json.output.timer,
        is_door_open: 0, // Assuming your schema has an `is_door_open` column for the final state
      });

      await firebaseService.writeData({ machine_status: 0 }, machine_id);
      await firebaseService.writeCheckData({ isChecking: 0 }, machine_id);
    }
  }
}


function generateId() {
  let prvTxnId;

  do {
    prvTxnId = Math.floor(Math.random() * Math.pow(10, 19));
  } while (!paymentService.readPrvTxnId(prvTxnId));
  console.log(prvTxnId);
  return prvTxnId;
}

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

  // const payment = {
  //   txn_id: query.txn_id,
  //   status: "UNPAID",
  // };

  // const newPayment = await paymentService.createPayment(payment);

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

async function pay(query) {
  const machine_id = parseInt(query.account);
  const lastState = await washingService.readLastWashingStateByMachineID(
    machine_id
  );

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
  const washing_id = newWashing[0].insertId;

  
  const payment = {
    txn_id: query.txn_id,
    prv_txn_id: prvTxnId,
    sum: mode_price,
    status: "PAID",
  };
  const newPayment = await paymentService.createPayment(payment);
  // await paymentService.updatePaymenWithTxn_id(query.txn_id,payment);
  // const updatedPayment = await paymentService.readPaymenWithTxn_id(query.txn_id);
  const payment_id = newPayment[0].insertId;

  const transaction = {
    transaction_date: now,
    washing_id,
    payment_id,
  };

  const newTransaction = await transactionService.createTransaction(
    transaction
  );
  
  const transaction_id = newTransaction[0].insertId;

  if (machine_id >= 1000) {
    // Включение машины
    await firebaseService.writeData({ machine_status: 1 }, machine_id);

    // Задержка для включения машины и затем выбор режима
    setTimeout(async () => {
      const machineState = await firebaseService.readData(machine_id);

      if (machineState.machine_status === 1) {  // Проверка, что машина включена
        await firebaseService.writeStartStopData({ machine_status: 1 }, machine_id);

        setTimeout(async () => {
          const updatedState = await firebaseService.readData(machine_id);

          if (updatedState.output.isDoorOpen == 0) {  // Если дверь закрыта
            await firebaseService.writeStartStopData({ machine_status: 0 }, machine_id);
          } else {
            // Сброс, если дверь все еще открыта
            await firebaseService.writeData({ machine_status: -1 }, machine_id);
            await firebaseService.writeStartStopData({ machine_status: -1 }, machine_id);
          }
        }, 15000);

        // Проверка состояния через 30 секунд
        setTimeout(async () => {
          const updatedState = await firebaseService.readData(machine_id);

          if (updatedState.output.isDoorOpen == 0) {
            await firebaseService.writeStartStopData({ machine_status: 1 }, machine_id);
          } else {
            await firebaseService.writeData({ machine_status: -1 }, machine_id);
            await firebaseService.writeStartStopData({ machine_status: -1 }, machine_id);
          }
        }, 30000);

        // Последняя проверка через 45 секунд
        setTimeout(async () => {
          const finalState = await firebaseService.readData(machine_id);

          if (finalState.output.isDoorOpen == 0) {
            const gaga = 2 + 2;  // Ваша дополнительная логика, если требуется
          } else {
            await firebaseService.writeData({ machine_status: -1 }, machine_id);
            await firebaseService.writeStartStopData({ machine_status: -1 }, machine_id);
          }
        }, 45000);
      }
    }, 30000);  // Задержка 30 секунд для включения машины
  } else {
    // Управление для других машин
    setTimeout(async () => {
      await washingService.updateWashing(washing_id, {
        state: "AVAILABLE",
        is_door_open: 0,  // Обновляем состояние дверцы
      });
    }, 15 * 60 * 1000);  // Ожидание 15 минут

    await firebaseService.writeData({ machine_status: 1 }, machine_id);
    await firebaseService.writeStartStopData(
      { machine_status: 1, mode: mode_id },
      machine_id
    );

    // Сброс через 17 секунд
    setTimeout(async () => {
      await firebaseService.writeData({ machine_status: -1 }, machine_id);
      await firebaseService.writeStartStopData(
        { machine_status: -1, mode: -1 },
        machine_id
      );
    }, 17000);

    // Управление интервалами для периодической проверки состояния
    if (!intervalIDs[machine_id]) {
      intervalIDs[machine_id] = [];
    }

    intervalIDs[machine_id].push(
      setInterval(processWashing, checkIntervalTimeMin * 60 * 1000, washing_id, transaction_id)
    );
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
