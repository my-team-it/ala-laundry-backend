// Работает с базой данных для операций с машиной (чтение, создание, обновление, удаление).
// Используется для хранения и получения данных о машинах.

import { pool } from "../db.js";

const readMachines = async () => {
  return await pool.query("SELECT * FROM machine");
};

const readMachinesWithRooomID = async (room_id) => {
  return await pool.query("SELECT * FROM machine WHERE room_id = ?", [room_id]);
};

const createMachine = async (newmachine) => {
  return await pool.query("INSERT INTO machine set ?", [newmachine]);
};

const readMachine = async (id) => {
  return await pool.query("SELECT * FROM machine WHERE id = ?", [id]);
};

const updateMachine = async (id, newmachine) => {
  return await pool.query("UPDATE machine set ? WHERE id = ?", [
    newmachine,
    id,
  ]);
};

const deleteMachine = async (id) => {
  return await pool.query("DELETE FROM machine WHERE id = ?", [id]);
};

export default {
  readMachine,
  readMachines,
  readMachinesWithRooomID,
  createMachine,
  updateMachine,
  deleteMachine,
};
