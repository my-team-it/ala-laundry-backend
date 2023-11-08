import modeService from "../services/modeService.js";
import washingService from "../services/washingService.js";
import paymentService from "../services/paymentService.js";
import transactionService from "../services/transactionService.js";
import firebaseService from "../services/firebaseService.js";

const ON = 1;
const OFF = 0;

const intervalIDs = [];
const isWashingStarted = [];

function stopInterval(machineId) {
  while (intervalIDs[machineId].length) {
    clearInterval(intervalIDs[machineId].pop());
  }
}

async function processWashing(washing_id) {
  const [washing] = await washingService.readWashing(washing_id);
  console.log(washing);
  if (washing.state === "ACTIVE") {
    const isDoorOpenList = [];
    for (let i = 0; i < 3; i++) {
      setTimeout(
        checkDoorStatus,
        (i + 1) * 60 * 1000,
        i,
        washing_id,
        washing.machine_id,
        isDoorOpenList
      );
    }
  }
}

async function checkDoorStatus(i, washing_id, machineId, isDoorOpenList) {
  console.log(washing_id);
  console.log(machineId);
  console.log(isDoorOpenList);

  const json = await firebaseService.readData(machineId);
  isDoorOpenList[i] = json.output.isDoorOpen;
  if (i === 2) {
    if (!isDoorOpenList[0] && !isDoorOpenList[1] && !isDoorOpenList[2]) {
      await washingService.updateWashing(washing_id, {
        state: "AVAILABLE",
        end_timer_val: json.output.timer,
        is_door_open: 0,
      });
      if (!isWashingStarted[parseInt(machineId)]) {
        await firebaseService.writeData({ machine_status: 0 }, machineId);
      }
      isWashingStarted[parseInt(machineId)] = false;
      stopInterval(parseInt(machineId));
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
      bin: "870430301264",
      comment: "Machine is not ready",
    };
  }

  const listOfModeNames = await modeService.readNames();
  let priceList = listOfModeNames.map((key, index) => ({
    name: key.name,
    id: index + 1,
  }));

  if (
    query.account != 6 &&
    query.account != 7 &&
    query.account != 8 &&
    query.account != 9
  ) {
    if (washing[washing.length - 1].is_door_open == 1) {
      console.log("machine not ready2");
      return {
        txn_id: query.txn_id,
        result: 5,
        bin: "870430301264",
        comment: "Machine is not ready",
      };
    }
  } else {
    priceList = {'Жуу|Стирка':1};
    if (firebaseState.output.isDoorClosed == 1) {
      console.log("machine not ready5");
      return {
        txn_id: query.txn_id,
        result: 5,
        bin: "870430301264",
        comment: "Machine is not ready",
      };
    }
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
  // console.log(mode_priceD);
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

  if (
    machine_id != 6 &&
    machine_id != 7 &&
    machine_id != 8 &&
    machine_id != 9
  ) {
    await firebaseService.writeData({ machine_status: 1 }, machine_id);
    await firebaseService.writeStartStopData(
      { machine_status: 1, mode: mode_id },
      machine_id
    );

    setTimeout(async () => {
      await firebaseService.writeData({ machine_status: -1 }, machine_id);
      await firebaseService.writeStartStopData(
        { machine_status: -1, mode: -1 },
        machine_id
      );
    }, 17000);

    if (!intervalIDs[machine_id]) {
      intervalIDs[machine_id] = [];
    }

    intervalIDs[machine_id].push(
      setInterval(processWashing, 3 * 60 * 1000, washing_id, transaction_id)
    );
  } else {
    await firebaseService.writeData({ machine_status: 1 }, machine_id);

    setTimeout(async () => {
      await firebaseService.writeStartStopData(
        { machine_status: 1 },
        machine_id
      );
      setTimeout(async () => {
        await firebaseService.writeData({ machine_status: -1 }, machine_id);
        await firebaseService.writeStartStopData(
          { machine_status: -1, mode: -1 },
          machine_id
        );
      }, 17000);
    }, 60 * 1000)
  }

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
