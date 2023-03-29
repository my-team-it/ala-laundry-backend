const express = require('express');
const {
  machine_off,
  machine_on
} = require('../controllers/MachineController');

const router = express.Router();
 
router.route('/on/:id').get(machine_on);
router.route('/off/:id').get(machine_off);
 
module.exports = router;