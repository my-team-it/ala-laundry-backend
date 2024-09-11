// Управляет данными о режимах стирки.
// Основные операции включают чтение, обновление, удаление режимов.


import { pool } from "../db.js";

const readModes = async () => {
  const result = await pool.query("SELECT * FROM mode");
  return result;
};

const readNames = async () => {
  const [result] = await pool.query("SELECT name FROM mode");
  return result;
};

const createMode = async (newmode) => {
  return await pool.query("INSERT INTO mode set ?", [newmode]);
};

const readMode = async (id) => {
  const [result] = await pool.query("SELECT * FROM mode WHERE id = ?", [id]);
  return result;
};

const readPrice = async (id) => {
  const [result] = await pool.query("SELECT price FROM mode WHERE id = ?", [
    id,
  ]);
  return result;
};

const updateMode = async (id, newmode) => {
  return await pool.query("UPDATE mode set ? WHERE id = ?", [newmode, id]);
};

const deleteMode = async (id) => {
  const result = await pool.query("DELETE FROM mode WHERE id = ?", [id]);
  return result;
};

export default {
  readModes,
  readNames,
  createMode,
  readMode,
  readPrice,
  updateMode,
  deleteMode,
};
