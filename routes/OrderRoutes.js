const express = require("express");
const {
  getAllOrders,
  createOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require("../controllers/OrderController");

const router = express.Router();
 
router.route("/").get(getAllOrders).post(createOrder);
router.route("/").get(getAllOrders).post(createOrder);
router.route("/:id").get(getOrderById).put(updateOrder).delete(deleteOrder);
 
module.exports = router;