import transactionService from "../services/transactionService.js";

export const readTransactions = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const [rows] = await transactionService.readTransactions();
  res.json({ data: rows });
};

export const createTransaction = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const newtransaction = req.body;
  const result = await transactionService.createTransaction();
  res.json({ data: result });
};

export const readTransaction = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const { id } = req.params;
  const [result] = await transactionService.readTransaction();
  res.json({ data: result });
};

export const updateTransaction = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const { id } = req.params;
  const newtransaction = req.body;
  const result = await transactionService.updateTransaction(id, newtransaction);
  res.json({ data: result });
};

export const deleteTransaction = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const { id } = req.params;
  const result = await transactionService.deleteTransaction(id);
  res.json({ data: result });
};
