import modeService from "../services/modeService.js";
import washingService from "../services/washingService.js";
import paymentService from "../services/paymentService.js";
import transactionService from "../services/transactionService.js";
import firebaseService from "../services/firebaseService.js";

const intervalIDs = [];
const isWashingStarted = [];
const ON = 1;
const OFF = 0;

function stopInterval(machineId) {
  while (intervalIDs[machineId].length) {
    clearInterval(intervalIDs[machineId[2]].pop());
  }
}

async function processWashing(washing_id) {
  const washing = await washingService.readWashing(washing_id);
  if (washing[0].state === "PROCESS") {
    const isDoorOpenList = [];
    for (let i = 0; i < 3; i++) {
      setTimeout(
        checkDoorStatus,
        (i + 1) * 30 * 1000,
        washing_id,
        washing[0].machine_id,
        isDoorOpenList,
        i
      );
    }
  }
}

async function checkDoorStatus(i, washing_id, machineId, isDoorOpenList) {
  const json = await firebaseService.readData(machineId);
  isDoorOpenList[i] = json.input.door;
  if (i === 2) {
    if (isDoorOpenList[0] && isDoorOpenList[1] && isDoorOpenList[2]) {
      await washingService.updateWashing(washing_id, {
        state: "COMPLETE",
      });
      if (!isWashingStarted[parseInt(machineId)]) {
        await firebaseService.writeAdminData(ON, machineId);
        await firebaseService.writeData({ machine_status: 0 }, machineId);
        await firebaseService.writeAdminData(OFF, machineId);
      }
      isWashingStarted[parseInt(machineId)] = false;
      stopInterval(machineId);
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
  const listOfModeNames = await modeService.readNames();
  const priceList = listOfModeNames.map((key, index) => ({
    name: key,
    id: index,
  }));

  const result = await washingService.readLastMachineState(query.account);

  if (result[0] === query.account) {
    return {
      txn_id: query.txn_id,
      result: 5,
      bin: "870430301264",
      comment: "Machine is not ready",
    };
  }

  const response = {
    txn_id: query.txn_id,
    result: 0,
    fields: {
      services: priceList,
    },
    bin: "870430301264",
    comment: "Item found",
  };
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
      result: 5,
      bin: "870430301264",
      comment: "Machine is not ready",
    };
  }

  const prvTxnId = generateId();
  const mode_id = parseInt(query.service_id);
  const mode_price = (await modeService.readPrice(mode_id))[0].price;
  const now = new Date();
  const washing = {
    start_time: now,
    is_door_open: true,
    state: "ACTIVE",
    mode_id,
    machine_id,
  };
  const newWashing = await washingService.createWashing(washing);
  const washing_id = newWashing[0].insertId;
  console.log(mode_price);
  const payment = {
    txn_id: query.txn_id,
    prv_txn_id: prvTxnId,
    sum: mode_price,
    status: "PAID",
  };
  const newPayment = await paymentService.createPayment(payment);
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

  await firebaseService.writeData({ machine_status: 1 }, machine_id);
  await firebaseService.writeAdminData(1, machine_id);
  setTimeout(
    async (machineId) => {
      isWashingStarted[parseInt(machine_id)] = true;
      await firebaseService.writeAdminData(0, machine_id);
    },
    3.3 * 60 * 1000,
    machine_id
  );

  if (!intervalIDs[machine_id]) {
    intervalIDs[machine_id] = [];
  }

  intervalIDs[machine_id].push(
    setInterval(processWashing, 1.6 * 60 * 1000, machine_id, transaction_id)
  );

  return {
    txn_id: query.txn_id,
    prv_txn_id: prvTxnId,
    result: 0,
    sum: parseInt(query.sum),
    bin: "870430301264",
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
    json = { sum: result[0].price };
  } catch (err) {
    json = { result: 1, comment: "Service not found" };
  } finally {
    res.json(json);
  }
};
