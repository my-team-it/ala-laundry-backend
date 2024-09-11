// Управляет транзакциями оплаты, что является ключевым шагом перед запуском машины.

import { pool } from "../db.js";

const readPayments = async () => {
  const [rows] = await pool.query("SELECT * FROM payment");
  return rows;
};

const createPayment = async (newpayment) => {
  return await pool.query("INSERT INTO payment set ?", [newpayment]);
};

const readPayment = async (id) => {
  const [result] = await pool.query("SELECT * FROM payment WHERE id = ?", [id]);
  return result;
};

const readPaymenWithTxn_id = async (txn_id) => {
  const [result] = await pool.query(
    "SELECT * FROM payment WHERE txn_id = ?",
    [txn_id]
  );
  return result;
};

const readPrvTxnId = async (prv_txn_id) => {
  const [result] = await pool.query(
    "SELECT prv_txn_id FROM payment WHERE prv_txn_id = ?",
    [prv_txn_id]
  );
  return result;
};

const updatePayment = async (id, newpayment) => {
  return await pool.query("UPDATE payment set ? WHERE id = ?", [
    newpayment,
    id,
  ]);
};

const updatePaymenWithTxn_id = async (id, newpayment) => {
  return await pool.query("UPDATE payment set ? WHERE txn_id = ?", [
    newpayment,
    id,
  ]);
};

const deletePayment = async (id) => {
  const result = await pool.query("DELETE FROM payment WHERE id = ?", [id]);
  return result;
};

export default {
  readPayments,
  createPayment,
  readPayment,
  readPaymenWithTxn_id,
  readPrvTxnId,
  updatePayment,
  updatePaymenWithTxn_id,
  deletePayment,
};
