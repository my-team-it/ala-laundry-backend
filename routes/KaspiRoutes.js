const express = require('express');
const {
  checkOrderById,
  get_price,
} = require('../controllers/OrderController');

const router = express.Router();
 
router.route('/payment').get(checkOrderById);
router.route('/get_price').get(get_price);

module.exports = router;