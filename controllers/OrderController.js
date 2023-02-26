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

function check(sumInDatabase, txn_id, sum) {
  if(sumInDatabase == sum) {
    return {txn_id:txn_id, result: 0, comment: "Item found"};
  }

  return {txt_id:txt_id, result: 5, comment: "Item sum incorrect"};
}

async function pay(query, sumInDatabase) {
  const order = await orderService.getOrderById(query.account);
  console.log('result');
  const result = await firebaseService.writeData(order, order.machine_id);
  console.log(result);

  const prv_txn_id = generate_id();

  if (sumInDatabase == query.sum) {
    const result = await orderService.updateOrder(query._id, {payment_status:"paid"});
    return { txn_id:txn_id, prv_txn_id: prv_txn_id, result: 0, sum:query.sum, comment: "Pay item found" };
  }

  return { txn_id:txn_id, prv_txn_id: prv_txn_id, result: 1, sum:sum, comment: "Pay item sum incorrect" };
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
      case 'check' : json = check(order.sum, req.query.txn_id, req.query.sum);break;
      case 'pay' : json = await pay(req.query, order.sum);break;
      default: json = { txn_id: req.query.txn_id, result: 1, comment: "Command not found" };
    }

    res.json(json);

  } catch (err) {
    res.json({ txn_id: req.query.txn_id, result: 1, comment: "Error during processing" });
  }
}