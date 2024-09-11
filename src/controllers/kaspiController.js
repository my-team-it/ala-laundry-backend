import modeService from "../services/modeService.js";
import washingService from "../services/washingService.js";
import paymentService from "../services/paymentService.js";
import transactionService from "../services/transactionService.js";
import firebaseService from "../services/firebaseService.js";
import { BIN } from "../config.js";

const intervalIDs = [];
const checkIntervalTimeMin = 1;

function stopInterval(machineId) {
  if (intervalIDs[machineId]) {
    while (intervalIDs[machineId].length) {
      clearInterval(intervalIDs[machineId].pop());
    }
  }
}

// Функция для проверки состояния двери и подготовка машины к следующему циклу
async function processWashing(washing_id) {
  const [washing] = await washingService.readWashing(washing_id);
  await firebaseService.writeCheckData({ isChecking: 1 }, washing.machine_id);
  const numCheck = 3;

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

// Функция проверки состояния двери и логика завершения стирки
async function checkDoorStatus(i, washing_id, machine_id, numCheck) {
  const json = await firebaseService.readData(machine_id);
  const value = json.output.isDoorOpen; // Чтение состояния двери
  let updateObj = { [`is_door_open_${i + 1}`]: value }; // Обновление состояния дверей
  await washingService.updateIsDoorOpenByID(washing_id, updateObj);

  if (i === numCheck - 1) {
    const isDoorOpenList = await washingService.readIsDoorOpenStatesByID(washing_id);
    const isDoorClosedOnAllChecks = Object.values(isDoorOpenList).every(status => status === 1);

    if (isDoorClosedOnAllChecks) {
      stopInterval(parseInt(machine_id));
      await washingService.updateWashing(washing_id, {
        state: "AVAILABLE",
        end_timer_val: json.output.timer,
        is_door_open: 0
      });
      await firebaseService.writeData({ machine_status: 0 }, machine_id);
      await firebaseService.writeCheckData({ isChecking: 0 }, machine_id);
    } else {
      await firebaseService.writeData({ machine_status: -1 }, machine_id);
    }
  }
}

function generateId() {
  let prvTxnId;
  do {
    prvTxnId = Math.floor(Math.random() * Math.pow(10, 19));
  } while (!paymentService.readPrvTxnId(prvTxnId));
  return prvTxnId;
}

async function check(query) {
  const washing = await washingService.readLastByMachineID(query.account);
  const firebaseState = await firebaseService.readData(query.account);
  const now = new Date().getTime();

  if (now / 1000 - firebaseState.output.timer > 10) {
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
    priceList = [priceList[6]]; // Samsung
    if (firebaseState.output.isDoorOpen == 1) {
      return {
        txn_id: query.txn_id,
        result: 6,
        bin: BIN,
        comment: "The machine is busy",
      };
    }
  } else {
    priceList = priceList.slice(0, 6); // TCL
    if (washing.length > 1 && washing[washing.length - 1].is_door_open == 1) {
      return {
        txn_id: query.txn_id,
        result: 6,
        bin: BIN,
        comment: "The machine is busy",
      };
    }
  }

  return {
    txn_id: query.txn_id,
    result: 0,
    fields: { services: priceList },
    bin: BIN,
    comment: "Item found",
  };
}

async function pay(query) {
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
  const washing_id = newWashing[0].insertId;

  const payment = {
    txn_id: query.txn_id,
    prv_txn_id: prvTxnId,
    sum: mode_price,
    status: "PAID",
  };
  await paymentService.createPayment(payment);

  const transaction = {
    transaction_date: now,
    washing_id,
    payment_id: newWashing[0].insertId,
  };
  await transactionService.createTransaction(transaction);

  await firebaseService.writeData({ machine_status: 1 }, machine_id);

  setTimeout(async () => {
    const machineState = await firebaseService.readData(machine_id);
    if (machineState.machine_status === 1 && machineState.output.isDoorOpen == 0) {
      await firebaseService.writeStartStopData({ machine_status: 1 }, machine_id);

      setTimeout(async () => {
        const updatedState = await firebaseService.readData(machine_id);
        if (updatedState.output.isDoorOpen == 0) {
          await firebaseService.writeStartStopData({ machine_status: 0 }, machine_id);
        } else {
          await firebaseService.writeData({ machine_status: -1 }, machine_id);
        }
      }, 15000);

      setTimeout(async () => {
        const updatedState = await firebaseService.readData(machine_id);
        if (updatedState.output.isDoorOpen == 0) {
          await firebaseService.writeStartStopData({ machine_status: 1 }, machine_id);
        } else {
          await firebaseService.writeData({ machine_status: -1 }, machine_id);
        }
      }, 30000);
    }
  }, 10000);

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
        json = { txn_id: req.query.txn_id, result: 1, comment: "Command not found" };
    }
  } catch (err) {
    json = { txn_id: req.query.txn_id, result: 1, comment: "Error during processing", desc: err.message };
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
