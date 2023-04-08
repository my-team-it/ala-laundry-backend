const express = require('express')
const {
  getAllOrders,
  createOrder,
  getOrderById,
  updateOrder,
  deleteOrder
} = require('../api/OrderController')

const router = express.Router()

router.route('/getAllOrders').get(getAllOrders)
router.route('/createOrder').get(createOrder)
router.route('/:id').get(getOrderById).put(updateOrder).delete(deleteOrder)

module.exports = router
