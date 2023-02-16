const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transaction_schema = new Schema({
    prv_txn_id: Number
 });
  
module.exports = mongoose.model("Transaction", transaction_schema);