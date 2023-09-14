import { createPool } from "mysql2/promise";

export const pool = createPool({
  host: "db4free.net",
  user: "alaadmin",
  password: "alapassword",
  port: 3306,
  database: "alatest",
});
