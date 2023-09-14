import { pool } from "../db.js";

const readRooms = async () => {
  const [result] = await pool.query("SELECT * FROM room");
  return result;
};

const createRoom = async (newroom) => {
  console.log(newroom)
  return await pool.query("INSERT INTO room set ?", [newroom]);
};

const readRoom = async (id) => {
  const [result] = await pool.query("SELECT * FROM room WHERE id = ?", [id]);
  return result;
};

const updateRoom = async (id, newroom) => {
  return await pool.query("UPDATE room set ? WHERE id = ?", [newroom, id]);
};

const deleteRoom = async (id) => {
  const result = await pool.query("DELETE FROM room WHERE id = ?", [id]);
  return result;
};

export default { readRoom, readRooms, createRoom, updateRoom, deleteRoom };
