const transactionService = require('../services/TransactionService');
const orderService = require('../services/OrderService');
const firebaseService = require('../services/FirebaseService');
const dateTime = require('../utils/DateTime');


const list_of_modes = ['"Іш киім" режимі|Режим "Постельное белье"','"Түсті" режимі|Режим "Цветной"','"Назік" режимі|Режим "Деликатный"','"Аралас" режимі|Режим "Смешанный"','"Жылдам" режимі|Режим "Быстрый"','"Мақта" режимі|Режим "Хлопок"','"Эко" режимі|Режим "Эко"','"Синтетикалық" режимі|Режим "Синтетический"','"Ысқылау" режимі|Режим "Ополаскивание"','"Ағызу" режимі|Режим "Слив"','"Барабанды тазалау" режимі|Режим "Очистка барабана"'];
const list_of_prices = [500,500,500,500,500,400,500,1200,500,300,300,1];
const list_of_durations = [500,500,500,500,500,400,500,1200,500,300,300,1];

function generate_id() {
  let prv_txn_id;

  do {
    prv_txn_id = Math.floor(Math.random() * Math.pow(10, 20));
  } while (!transactionService.getTransactionByPrvTxnId(prv_txn_id))  
  
  return prv_txn_id;
}

async function check(query) {
  if (order.payment_status == 'paid') {
    return { txn_id:query.txn_id, result: 3, bin:'030213500928', comment: 'Item already paid' };
  }

  const price_list = list_of_modes.map((key, index) => ({ name: key, id: index}));
  
  const response = {
    txn_id:query.txn_id, 
    result: 0, 
    fields:{
      services:price_list
    }, 
    bin:'030213500928',
    comment: 'Item found'
  };
  return response;
}

async function pay(query) {
  const prv_txn_id = generate_id();
  let service_id = parseInt(query.service_id)
  let orderJson = {
    machine_id: query.account,
    payment_status: "paid",
    sum: parseInt(query.sum),
    mode: service_id,
    duration: list_of_durations[service_id],
    machine_status: 1
  }
  let orders = orderService.getAllOrders();
  let id;
  orders.forEach(element => {
    if (element.machine_id == orderJson.machine_id) {
      id = element._id;
    }
  });
  if (list_of_prices[service_id] == orderJson.sum) {
    const order = await orderService.updateOrder(id, orderJson);
    console.log(dateTime.getDateTime() + "| Update order:" + order);
    const result = await firebaseService.writeData(order, order.machine_id);
    return { txn_id:query.txn_id, prv_txn_id: prv_txn_id, result: 0, sum:parseInt(query.sum), bin:'030213500928', comment: 'Pay item found'};
  }

  return { txn_id:query.txn_id, prv_txn_id: prv_txn_id, result: 1, sum:parseInt(query.sum), bin:'030213500928', comment: 'Pay item sum incorrect' };
}

exports.getAllOrders = async (req, res) => {
  console.log(dateTime.getDateTime() + "| Request:" + req);
  try {
    const orders = await orderService.getAllOrders();
    console.log(dateTime.getDateTime() + "| Retrieve all orders:" + orders);
    res.json({ data: orders, status: 'success' });
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: err.message });
  }
};
 
exports.createOrder = async (req, res) => {
  console.log(dateTime.getDateTime() + "| Request:" + req);
  try {
    req.query.payment_status = 'unpaid';
    req.query.machine_status = 0;
    const order = await orderService.createOrder(req.query);
    console.log(dateTime.getDateTime() + "| Create order:" + order);
    res.json({ data: order, status: 'success'});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 
exports.getOrderById = async (req, res) => {
  console.log(dateTime.getDateTime() + "| Request:" + req);
  try {
    const order = await orderService.getOrderById(req.params.id);
    console.log(dateTime.getDateTime() + "| Retrieve order:" + order);
    res.json({ data: order, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 
exports.updateOrder = async (req, res) => {
  console.log(dateTime.getDateTime() + "| Request:" + req);
  try {
    const order = await orderService.updateOrder(req.params.id, req.query);
    console.log(dateTime.getDateTime() + "| Update order:" + order);
    res.json({ data: order, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 
exports.deleteOrder = async (req, res) => {
  console.log(dateTime.getDateTime() + "| Request:" + req);
  try {
    const order = await orderService.deleteOrder(req.params.id);
    console.log(dateTime.getDateTime() + "| Delete order:" + order);
    res.json({ data: order, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkOrderById = async (req, res) => {
  let json;
  try {
    console.log(dateTime.getDateTime() + "| Request:" + req);
    switch (req.query.command) {
      case 'check' : json = await check(req.query);break;
      case 'pay' : json = await pay(req.query);break;
      default: json = { txn_id: req.query.txn_id, result: 1, comment: 'Command not found' };
    }
  } catch (err) {
    console.error(err);
    json = { txn_id: req.query.txn_id, result: 1, comment: 'Error during processing' };
  } finally {
    console.log(dateTime.getDateTime() + "| Response:" + res)
    res.json(json);
  }
}

exports.get_price = async (req, res) => {
  let json;
  console.log(dateTime.getDateTime() + "| Request:" + req)
  try {
    json = {sum:list_of_prices[req.query.service_id]};
  } catch (err) {
    console.error(err)
    json = { result: 1, comment: 'Service not found' };
  } finally {
    console.log(dateTime.getDateTime() + "| Response:" + res)
    res.json(json);
  }
}
