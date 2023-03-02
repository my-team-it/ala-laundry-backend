const express = require('express')
const mongoose = require("mongoose");
const https = require("https");
const fs = require("fs");
const app = express()
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
    app
  )
  .listen(port, () => {
    console.log(`serever is runing at port ${port}`);
  });

app.get('/payment', (req, res) => {
    res.send('Hello World!')
})

app.get('/create/order', (req, res) => {
    main().catch(console.error);
    res.send('Hello World!')
})

app.use("/api/order", orderRouter);
app.use("/payment_route", kaspiRouter);

app.listen(80, () => {
  console.log(`Example app listening on port 80}`)
})
