const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const order_schema = new Schema({
    prv_txn_id: Number
 });
  
module.exports = mongoose.model("Order", order_schema);