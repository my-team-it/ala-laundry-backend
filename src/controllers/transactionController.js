import transactionService from "../services/transactionService.js";

export const readTransactions = async (req, res) => {
  const [rows] = await transactionService.readTransactions();
  res.json({ rows });
};

export const createTransaction = async (req, res) => {
  const newtransaction = req.body;
  const result = await transactionService.createTransaction();
  res.json({ message: result });
};

export const readTransaction = async (req, res) => {
  const { id } = req.params;
  const [result] = await transactionService.readTransaction();
  res.json({ message: result });
};

export const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const newtransaction = req.body;
  const result = await transactionService.updateTransaction(id, newtransaction);
  res.json({ message: result });
};

export const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  const result = await transactionService.deleteTransaction(id);
  res.json({ message: result });
};
