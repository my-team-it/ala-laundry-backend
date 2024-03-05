import { pool } from "../db.js";

const readWashings = async () => {
  const rows = await pool.query("SELECT * FROM washing");
  return rows;
};

const readLastWashingStateByMachineID = async (machine_id) => {
  const [rows] = await pool.query(
    "SELECT state FROM washing WHERE machine_id = ? AND state = 'AVAILABLE'",
    [machine_id]
  );
  return rows;
};

const readIsDoorOpenStatesByID = async (washing_id) => {
  const [rows] = await pool.query(
    "SELECT state FROM washing WHERE id = ?",
    [washing_id]
  );
  return rows[0]
}

const readLastByMachineID = async (machine_id) => {
  const [rows] = await pool.query(
    "SELECT * FROM washing WHERE machine_id = ?",
    [machine_id]
  );
  return rows;
};

const readLastWashingState = async (washing_id) => {
  const [rows] = await pool.query("SELECT state FROM washing WHERE id = ?", [
    washing_id,
  ]);
  return rows;
};

const createWashing = async (newwashing) => {
  return await pool.query("INSERT INTO washing set ?", [newwashing]);
};

const readWashing = async (id) => {
  const [result] = await pool.query("SELECT * FROM washing WHERE id = ?", [id]);
  return result;
};

const updateWashing = async (id, newwashing) => {
  return await pool.query("UPDATE washing set ? WHERE id = ?", [
    newwashing,
    id,
  ]);
};

const updateIsDoorOpenByID = async (id, newwashing) => {
  return await pool.query("UPDATE washing set ? WHERE id = ?", [
    newwashing,
    id,
  ]);
};

const deleteWashing = async (req, res) => {
  const result = await pool.query("DELETE FROM washing WHERE id = ?", [id]);
  return result;
};

export default {
  readWashings,
  readLastWashingStateByMachineID,
  readIsDoorOpenStatesByID,
  readLastByMachineID,
  readLastWashingState,
  createWashing,
  readWashing,
  updateWashing,
  updateIsDoorOpenByID,
  deleteWashing,
};
