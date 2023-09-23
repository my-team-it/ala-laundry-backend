import { pool } from "../db.js";

const readMachineTimers = async () => {
  return await pool.query("SELECT * FROM machine_timer");
};

const createMachineTimer = async (newmachine) => {
  return await pool.query("INSERT INTO machine_timer set ?", [newmachine]);
};

const readMachineTimer = async (id) => {
  return await pool.query("SELECT * FROM machine_timer WHERE id = ?", [id]);
};

const readMachineTimerByMachineID = async (machine_id) => {
  return await pool.query("SELECT * FROM machine_timer WHERE machine_id = ?", [
    machine_id,
  ]);
};

const updateMachineTimer = async (id, newmachine) => {
  return await pool.query("UPDATE machine_timer set ? WHERE id = ?", [
    newmachine,
    id,
  ]);
};

const updateMachineTimerByMachineID = async (machine_id, newmachine) => {
  return await pool.query("UPDATE machine_timer set ? WHERE machine_id = ?", [
    newmachine,
    machine_id,
  ]);
};

const deleteMachineTimer = async (id) => {
  return await pool.query("DELETE FROM machine_timer WHERE id = ?", [id]);
};

export default {
  readMachineTimer,
  readMachineTimers,
  readMachineTimerByMachineID,
  createMachineTimer,
  updateMachineTimer,
  updateMachineTimerByMachineID,
  deleteMachineTimer,
};
