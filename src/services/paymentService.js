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

const deletePayment = async (id) => {
  const result = await pool.query("DELETE FROM payment WHERE id = ?", [id]);
  return result;
};

export default {
  readPayments,
  createPayment,
  readPayment,
  readPrvTxnId,
  updatePayment,
  deletePayment,
};