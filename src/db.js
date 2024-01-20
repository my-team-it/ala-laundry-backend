import { createPool } from "mysql2/promise";

export const pool = createPool({
  host: "restored-db.coabpxbozjxz.eu-north-1.rds.amazonaws.com",
  user: "alaadmin",
  password: "alapassword",
  port: 3306,
  database: "alaprod",
});
