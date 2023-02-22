const express = require('express')
const mongoose = require("mongoose");
const app = express()
const port = 8080
const orderRouter = require("./routes/OrderRoutes");
const kaspiRouter = require("./routes/KaspiRoutes");

console.log(process.env.MONGODB_URI)
//configure mongoose
mongoose.connect(
  process.env.MONGODB_URI,
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

app.get('/payment', (req, res) => {
    res.send('Hello World!')
})

app.get('/create/order', (req, res) => {
    main().catch(console.error);
    res.send('Hello World!')
})

app.use("/api/order", orderRouter);
app.use("/payment_route", kaspiRouter);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})