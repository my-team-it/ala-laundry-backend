/* eslint-disable space-before-function-paren */
/* eslint-disable semi */
const transactionService = require('../services/TransactionService');
const orderService = require('../services/OrderService');
const firebaseService = require('../services/FirebaseService');
const dateTime = require('../utils/DateTime');

const listOfModes = ['Кір жуу|Стирка'];
const listOfPrices = [1];

async function isOrderPaid(query) {
  const orders = await orderService.getAllOrders();
  let id;
  for (let i = 0; i < 5; i++) {
    if (orders[i].machine_id === query.account) {
      id = orders[i]._id;
    }
  }
  const order = await orderService.getOrderById(id);
  console.log('-----------');
  console.log(order);
  console.log('-----------');

  return order;
}

function generateId() {
  let prvTxnId;

  do {
    prvTxnId = Math.floor(Math.random() * Math.pow(10, 20));
  } while (!transactionService.getTransactionByPrvTxnId(prvTxnId));

  return prvTxnId;
}

async function check(query) {
  const priceList = listOfModes.map((key, index) => ({
    name: key,
    id: index
  }));

  const order = await isOrderPaid(query);
  console.log(order);
  const result = await firebaseService.readData(order.machine_id);
  const json = result.toJSON();
  const isDoorOpen = json.output.door_status;

  if (order.payment_status === 'paid' || isDoorOpen) {
    return {
      txn_id: query.txn_id,
      result: 5,
      bin: '870430301264',
      comment: 'Machine is not ready'
    };
  }
  const response = {
    txn_id: query.txn_id,
    result: 0,
    fields: {
      services: priceList
    },
    bin: '870430301264',
    comment: 'Item found'
  };
  return response;
}

async function pay(query) {
  const prvTxnId = generateId();
  const serviceId = parseInt(query.service_id);
  const orderJson = {
    machine_id: query.account,
    payment_status: 'paid',
    sum: parseInt(query.sum),
    mode: serviceId,
    machine_status: 1
  };

  const order = await isOrderPaid(query);

  if (listOfPrices[serviceId] === orderJson.sum) {
    const orderO = await orderService.updateOrder(order._id, orderJson);
    console.log(dateTime.getDateTime() + '| Update order:' + orderO);
    await firebaseService.writeData({ machine_status: 1 }, orderO.machine_id);
    await firebaseService.writeAdminData({ admin: 1 }, orderO.machine_id);

    setInterval(
      async (data1, data2) => {
        console.log('Data1: ' + data1);
        console.log('Data2: ' + data2);
        const firebaseStatus = await firebaseService.readData(data1.account);
        const json = firebaseStatus.toJSON();
        const isDoorOpen = json.output.door_status;
        if (!isDoorOpen) {
          const unpaidOrder = await orderService.updateOrder(data2._id, {
            machine_status: 0,
            payment_status: 'unpaid'
          });
          await firebaseService.writeData(
            { machine_status: 0 },
            unpaidOrder.machine_id
          );
          await firebaseService.writeAdminData(
            { admin: 0 },
            unpaidOrder.machine_id
          );
        }
      },
      3 * 60 * 1000,
      query,
      orderO
    );
    return {
      txn_id: query.txn_id,
      prv_txn_id: prvTxnId,
      result: 0,
      sum: parseInt(query.sum),
      bin: '870430301264',
      comment: 'Pay item found'
    };
  }

  return {
    txn_id: query.txn_id,
    prv_txn_id: prvTxnId,
    result: 1,
    sum: parseInt(query.sum),
    bin: '870430301264',
    comment: 'Pay item sum incorrect'
  };
}

exports.getAllOrders = async (req, res) => {
  console.log(dateTime.getDateTime() + '| Request query:' + req.query);
  try {
    const orders = await orderService.getAllOrders();
    console.log(dateTime.getDateTime() + '| Retrieve all orders:' + orders);
    res.json({ data: orders, status: 'success' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  console.log(dateTime.getDateTime() + '| Request query:' + req.query);
  try {
    req.query.payment_status = 'unpaid';
    req.query.machine_status = 0;
    const order = await orderService.createOrder(req.query);
    console.log(dateTime.getDateTime() + '| Create order:' + order);
    res.json({ data: order, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  console.log(dateTime.getDateTime() + '| Request query:' + req.query);
  try {
    const order = await orderService.getOrderById(req.params.id);
    console.log(dateTime.getDateTime() + '| Retrieve order:' + order);
    res.json({ data: order, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  console.log(dateTime.getDateTime() + '| Request query:' + req.query);
  try {
    const order = await orderService.updateOrder(req.params.id, req.query);
    console.log(dateTime.getDateTime() + '| Update order:' + order);
    res.json({ data: order, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  console.log(dateTime.getDateTime() + '| Request query:' + req.query);
  try {
    const order = await orderService.deleteOrder(req.params.id);
    console.log(dateTime.getDateTime() + '| Delete order:' + order);
    res.json({ data: order, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkOrderById = async (req, res) => {
  let json;
  try {
    console.log(dateTime.getDateTime() + '| Request query:' + req.query);
    switch (req.query.command) {
      case 'check':
        json = await check(req.query);
        break;
      case 'pay':
        json = await pay(req.query);
        break;
      default:
        json = {
          txn_id: req.query.txn_id,
          result: 1,
          comment: 'Command not found'
        };
    }
  } catch (err) {
    json = {
      txn_id: req.query.txn_id,
      result: 1,
      comment: 'Error during processing',
      desc: err.message
    };
  } finally {
    console.log(dateTime.getDateTime() + '| Response:' + json);
    res.json(json);
  }
};

exports.getPrice = async (req, res) => {
  let json;
  console.log(dateTime.getDateTime() + '| Request query:' + req.query);
  try {
    json = { sum: listOfPrices[req.query.service_id] };
  } catch (err) {
    console.error(err);
    json = { result: 1, comment: 'Service not found' };
  } finally {
    console.log(dateTime.getDateTime() + '| Response:' + json);
    res.json(json);
  }
};

exports.getDuration = async (req, res) => {
  let json;
  console.log(dateTime.getDateTime() + '| Request query:' + req.query);
  try {
    json = { sum: listOfPrices[req.query.service_id] };
  } catch (err) {
    console.error(err);
    json = { result: 1, comment: 'Service not found' };
  } finally {
    console.log(dateTime.getDateTime() + '| Response:' + json);
    res.json(json);
  }
};
