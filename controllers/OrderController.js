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
    // to do : prv_txn_id generate
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

exports.checkOrderById = async (req, res) => {
  try {
    const check = await orderService.getOrderById(req.query.account);
    if(req.query.command == 'check') {
      const sumInDatabase = order.sum;
      const {txn_id, sum } = req.query;

      if(sumInDatabase == sum) {
        return res.json({txn_id, result: 0, comment: ""});
      }
      else {
        return res.json({txt_id, result: 5, comment: ""});
      }
    }
    else if (req.query.command == 'pay') {
      const sumInDatabase = order.sum; // Assuming that sum is a property of order object
      const { txn_id, sum } = req.query;

    if (sumInDatabase == sum) {
      return res.json({ txn_id, prv_txn_id: "???", result: 0, sum, comment: "" });
    } else {
      return res.json({ txn_id, prv_txn_id: "???", result: 1, sum, comment: "" });
    }
    }
    else {
      return res.json({ txn_id: req.query.txn_id, result: 1, comment: "" });
    }
  } catch (err) {
  return res.json({ txn_id: req.query.txn_id, result: 1, comment: "" });
}
}

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