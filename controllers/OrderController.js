const orderService = require("../services/OrderService");

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
    const order = await orderService.createOrder(req.body);
    // res.json({ data: order, status: "success" });
    res.send("Kaspi QR");
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
    const order = await orderService.updateOrder(req.params.id, req.body);
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


//Need to complete 
//this func will be for kaspi side
//req that come from kaspi will be processed here
//when command is 'check'
//  1)take req.query.account and check do we have it in our database ('account' in our database is 'id')
//  2)if have it in our database compare req.query.sum and sum in our database
//  2.1) if two sum is equal return json response
//{
//  txn_id: req.query.txn_id,
//  result: 0,
//  comment: ""
//}
//  2.2)if two sum is not equal return json response
//{
//  txn_id: req.query.txn_id,
//  result: 5,
//  comment: ""
//}
//  3)if don't have it in our database return json response
//{
//  txn_id: req.query.txn_id,
//  result: 1,
//  comment: ""
//}
//when command is 'pay'
//  1)take req.query.account and check do we have it in our database ('account' in our database is 'id')
//  2)if have it in our database compare req.query.sum and sum in our database
//{
//  txn_id: req.query.txn_id,
//  prv_txn_id: ???,
//  result: 0,
//  sum: req.query.sum,
//  comment: ""
//}
//  3)if don't have it in our database return json response
//{
//  txn_id: req.query.txn_id,
//  prv_txn_id: ???,
//  result: 1,
//  sum: req.query.sum,
//  comment: ""
//}
exports.checkOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.query.account);
    if (req.query.command == 'check') {
      console.log(order)
    }
    res.json({ data: order, status: "success" });
  } catch (err) {
    res.json({txn_id: req.query.txn_id, result: 1, comment:""});
  }
};