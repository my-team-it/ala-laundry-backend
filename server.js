const express = require('express')
const mongoose = require("mongoose");
const https = require("https");
const fs = require("fs");
const appHTTPS = express()
const appHTTP = express()
const port = 443
const orderRouter = require("./routes/OrderRoutes");
const kaspiRouter = require("./routes/KaspiRoutes");

console.log(process.env.MONGODB_URI_ENV)
//configure mongoose
mongoose.connect(
  process.env.MONGODB_URI_ENV,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected to MongoDB");
    }
  }
);

https
  .createServer(
		// Provide the private and public key to the server by reading each
		// file's content with the readFileSync() method.
    {
      key: fs.readFileSync("key.pem"),
      cert: fs.readFileSync("cert.pem"),
    },
    appHTTPS
  )
  .listen(port, () => {
    console.log(`serever is runing at port ${port}`);
  });

appHTTPS.get('/payment', (req, res) => {
    res.send('Hello World!')
})

appHTTPS.use("/api/order", orderRouter);
appHTTPS.use("/payment_route", kaspiRouter);


appHTTP.get('/payment', (req, res) => {
    res.send('Hello World!')
})

appHTTP.use("/api/order", orderRouter);
appHTTP.listen(80, () => {
  console.log(`Example app listening on port 80`)
})

