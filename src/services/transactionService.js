import { pool } from "../db.js";

const readTransactions = async () => {
  const [rows] = await pool.query("SELECT * FROM transaction");
  return rows;
};

const createTransaction = async (newtransaction) => {
  return await pool.query("INSERT INTO transaction set ?", [newtransaction]);
};

const readTransaction = async (id) => {
  return await pool.query("SELECT * FROM transaction WHERE id = ?", [id]);
};

const updateTransaction = async (id, newtransaction) => {
  return await pool.query("UPDATE transaction set ? WHERE id = ?", [
    newtransaction,
    id,
  ]);
};

const deleteTransaction = async (id) => {
  const result = await pool.query("DELETE FROM transaction WHERE id = ?", [id]);
  return result;
};

export default {
  readTransactions,
  createTransaction,
  readTransaction,
  updateTransaction,
  deleteTransaction,
};
