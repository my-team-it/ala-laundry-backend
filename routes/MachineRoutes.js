/* eslint-disable semi */
const express = require('express');
const {
  machineOff,
  machineOn,
  machine,
  adminModeOn,
  adminModeOff
} = require('../api/MachineController');

const router = express.Router();

router.route('/on/:id').get(machineOn);
router.route('/off/:id').get(machineOff);
router.route('/admin/on/:id').get(adminModeOn);
router.route('/admin/off/:id').get(adminModeOff);
router.route('/:id').get(machine);

module.exports = router;
