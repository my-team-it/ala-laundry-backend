const OrderModel = require('../models/Order')

exports.getAllOrders = async () => {
  return await OrderModel.find()
}

exports.createOrder = async (Order) => {
  return await OrderModel.create(Order)
}
exports.getOrderById = async (id) => {
  return await OrderModel.findById(id)
}

exports.updateOrder = async (id, Order) => {
  return await OrderModel.findByIdAndUpdate(id, Order)
}

exports.deleteOrder = async (id) => {
  return await OrderModel.findByIdAndDelete(id)
}
