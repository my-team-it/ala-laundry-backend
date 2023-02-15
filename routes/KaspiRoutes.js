const express = require("express");
const {
  checkOrderById,
} = require("../controllers/OrderController");

const router = express.Router();
 
router.route("/").get(checkOrderById);
 
module.exports = router;