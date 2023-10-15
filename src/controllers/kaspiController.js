import modeService from "../services/modeService.js";
import washingService from "../services/washingService.js";
import paymentService from "../services/paymentService.js";
import transactionService from "../services/transactionService.js";
import firebaseService from "../services/firebaseService.js";

const ON = 1;
const OFF = 0;

function generateId() {
  let prvTxnId;

  do {
    prvTxnId = Math.floor(Math.random() * Math.pow(10, 19));
  } while (!paymentService.readPrvTxnId(prvTxnId));
  console.log(prvTxnId);
  return prvTxnId;
}

async function check(query) {
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

  if (firebaseState.output.isDoorOpen == 1) {
    console.log("machine not ready2");
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
  }, 8000);

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
