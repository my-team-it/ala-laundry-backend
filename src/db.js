import { createPool } from "mysql2/promise";

export const pool = createPool({
  host: "database-1.coabpxbozjxz.eu-north-1.rds.amazonaws.com",
  user: "admin",
  password: "adminAla!",
  port: 3306,
  database: "alaprod",
});
