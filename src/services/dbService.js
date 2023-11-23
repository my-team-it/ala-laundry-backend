import { pool } from "../db.js";

const sendQuery = async (query) => {
  return await pool.query(query);
};

export default {
    sendQuery
};
