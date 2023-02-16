const TransactionModel = require("../models/Transaction");
 
exports.getAllTransaction = async () => {
  return await TransactionModel.find();
};
 
exports.createTransaction = async (Transaction) => {
  return await TransactionModel.create(Transaction);
};

exports.getTransactionById = async (id) => {
  return await TransactionModel.findById(id);
};

exports.getTransactionByPrvTxnId = async (prv_txn_id) => {
  return await TransactionModel.findOne({prv_txn_id:prv_txn_id}, function (err, result) {
    if (!result) {
      return null;
    }
  }).clone();
};
 
exports.updateTransaction = async (id, Transaction) => {
  return await TransactionModel.findByIdAndUpdate(id, Transaction);
};
 
exports.deleteTransaction = async (id) => {
  return await TransactionModel.findByIdAndDelete(id);
};
