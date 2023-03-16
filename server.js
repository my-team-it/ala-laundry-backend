const express = require('express')
const mongoose = require('mongoose');
const https = require('https');
const fs = require('fs');
const appHTTPS = express()
const appHTTP = express()

const portHTTPS = 4343
const portHTTP = 8080

const orderRouter = require('./routes/OrderRoutes');
const kaspiRouter = require('./routes/KaspiRoutes');

mongoose.connect(
  process.env.MONGO_DATABASE_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Connected to MongoDB');
    }
  }
);

appHTTPS.use('/api/order', orderRouter);
appHTTPS.use('/kaspi', kaspiRouter);

https.createServer(
  {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
  },
  appHTTPS
  )
  .listen(portHTTPS, () => {
    console.log(`App (HTTPS) listening on port ${portHTTPS}`);
});


appHTTP.use('/api/order', orderRouter);

appHTTP.listen(portHTTP, () => {
  console.log(`App (HTTP) listening on port ${portHTTP}`);
})

