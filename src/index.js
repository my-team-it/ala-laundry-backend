import fs from "fs";
import https from "https";

import app from "./app.js";
import { HTTP_PORT, HTTPS_PORT } from "./config.js";

https
  .createServer(
    {
      key: fs.readFileSync("key.pem"),
      cert: fs.readFileSync("cert.pem"),
    },
    app.app
  )
  .listen(HTTPS_PORT, () => {
    console.log(`App (HTTPS) listening on port ${HTTPS_PORT}`);
  });

app.appHTTP.listen(HTTP_PORT, () => {
  console.log(`App (HTTP) listening on port ${HTTP_PORT}`);
});
