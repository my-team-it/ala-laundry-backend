const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const order_schema = new Schema({
    order_id: Number,
    machine_id: Number,
    payment_status: String,
    sum: Number,
    mode: String,
    machine_status: String,
    prv_txn_id: Number
 });
  
module.exports = mongoose.model("Order", order_schema);