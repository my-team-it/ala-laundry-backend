import https from "https";
import fs from "fs";
import app from "./app.js";
import { port } from "./config.js";

// app.listen(port);
https
  .createServer(
    {
      key: fs.readFileSync("key.pem"),
      cert: fs.readFileSync("cert.pem"),
    },
    app
  )
  .listen(443, () => {
    console.log(`App (HTTPS) listening on port ${443}`);
  });
