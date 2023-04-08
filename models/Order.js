const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderSchema = new Schema({
  machine_id: String,
  payment_status: String,
  sum: Number,
  mode: Number,
  duration: Number,
  machine_status: Number
})

module.exports = mongoose.model('Order', orderSchema)
