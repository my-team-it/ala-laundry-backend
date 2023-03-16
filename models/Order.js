const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const order_schema = new Schema({
    machine_id: String,
    payment_status: String,
    sum: Number,
    mode: Number,
    duration: Number,
    machine_status: Number,
 });
  
module.exports = mongoose.model('Order', order_schema);