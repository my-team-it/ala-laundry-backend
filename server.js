require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const https = require('https')
const fs = require('fs')
const appHTTPS = express()
const appHTTP = express()

const portHTTPS = 443
const portHTTP = 80

const orderRouter = require('./routes/OrderRoutes')
const kaspiRouter = require('./routes/KaspiRoutes')
const machineRouter = require('./routes/MachineRoutes')

console.log(process.env.MONGO_DATABASE_URL)
mongoose.connect(
  process.env.MONGO_DATABASE_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log('Connected to MongoDB')
    }
  }
)

appHTTPS.use('/api/order', orderRouter)
appHTTPS.use('/kaspi', kaspiRouter)

https
  .createServer(
    {
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem')
    },
    appHTTPS
  )
  .listen(portHTTPS, () => {
    console.log(`App (HTTPS) listening on port ${portHTTPS}`)
  })

appHTTP.use('/api/order', orderRouter)
appHTTP.use('/api/machine', machineRouter)
appHTTP.use('/kaspi', kaspiRouter)

appHTTP.listen(portHTTP, () => {
  console.log(`App (HTTP) listening on port ${portHTTP}`)
})

module.exports = appHTTPS
