const transactionService = require("../services/TransactionService");
const orderService = require("../services/OrderService");
const firebaseService = require("../services/FirebaseService");

function generate_id() {
  let prv_txn_id;

  do {
    prv_txn_id = Math.floor(Math.random() * Math.pow(10, 20));
  } while (!transactionService.getTransactionByPrvTxnId(prv_txn_id))  
  
  return prv_txn_id;
}

async function check(query) {
  const order = await orderService.getOrderById(query.account);

  if (order.payment_status == 'paid') {
    return { txn_id:query.txn_id, result: 3, sum:parseInt(query.sum), bin:"030213500928", comment: "Item already paid" };
  }

  const response = {txn_id:query.txn_id, result: 0, sum:parseInt(order.sum), bin:"030213500928", comment: "Item found"};
  return response;
}

async function pay(query, sumInDatabase) {
  const order = await orderService.getOrderById(query.account);
  const prv_txn_id = generate_id();
  
  if (order.payment_status == 'paid') {
    return { txn_id:query.txn_id, prv_txn_id: prv_txn_id, result: 3, sum:parseInt(query.sum), bin:"030213500928", comment: "Item already paid" };
  }

  if (sumInDatabase == query.sum) {
    const updateOrderResult = await orderService.updateOrder(query.account, {payment_status:"paid", machine_status:1});
    const order = await orderService.getOrderById(query.account);
    const result = await firebaseService.writeData(order, order.machine_id);
    return { txn_id:query.txn_id, prv_txn_id: prv_txn_id, result: 0, sum:parseInt(query.sum), bin:"030213500928", comment: "Pay item found" };
  }

  return { txn_id:query.txn_id, prv_txn_id: prv_txn_id, result: 1, sum:parseInt(query.sum), bin:"030213500928", comment: "Pay item sum incorrect" };
}

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    res.json({ data: orders, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 
exports.createOrder = async (req, res) => {
  try {
    req.query.payment_status = "unpaid";
    req.query.machine_status = 0;
    const order = await orderService.createOrder(req.query);
    res.json({ data: order, status: "success"});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 
exports.getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.json({ data: order, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 
exports.updateOrder = async (req, res) => {
  try {
    const order = await orderService.updateOrder(req.params.id, req.query);
    res.json({ data: order, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 
exports.deleteOrder = async (req, res) => {
  try {
    const order = await orderService.deleteOrder(req.params.id);
    res.json({ data: order, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.query.account);

    let json;

    switch (req.query.command) {
      case 'check' : json = await check(req.query);break;
      case 'pay' : json = await pay(req.query, order.sum);break;
      default: json = { txn_id: req.query.txn_id, result: 1, comment: "Command not found" };
    }

    res.json(json);

  } catch (err) {
    console.log(err)
    res.json({ txn_id: req.query.txn_id, result: 1, comment: "Error during processing" });
  }
}