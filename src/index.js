import https from "https";
import fs from "fs";
import app from "./app.js";

https
  .createServer(
    {
      key: fs.readFileSync("key.pem"),
      cert: fs.readFileSync("cert.pem"),
    },
    app.app
  )
  .listen(443, () => {
    console.log(`App (HTTPS) listening on port ${443}`);
  });

app.appHTTP.listen(80, () => {
  console.log(`App (HTTP) listening on port ${80}`);
});
