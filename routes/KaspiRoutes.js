const express = require('express')
const { checkOrderById, getPrice } = require('../api/OrderController')

const router = express.Router()

router.route('/payment').get(checkOrderById)
router.route('/get_price').get(getPrice)

module.exports = router
