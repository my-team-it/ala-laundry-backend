const mongoose = require('mongoose')
const Schema = mongoose.Schema

const transactionSchema = new Schema({
  prv_txn_id: Number
})

module.exports = mongoose.model('Transaction', transactionSchema)
