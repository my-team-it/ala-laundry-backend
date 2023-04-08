/* eslint-disable semi */
const firebaseService = require('../services/FirebaseService');

exports.machineOn = async (req, res) => {
  try {
    const order = {
      mode: Math.floor(Math.random() * Math.pow(10, 1)),
      machine_status: 1,
      machine_id: req.params.id,
      duration: Math.floor(Math.random() * Math.pow(10, 3))
    };
    await firebaseService.writeData(order, order.machine_id);
    const result = await firebaseService.readData(order.machine_id);
    res.json({ data: result, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.machineOff = async (req, res) => {
  try {
    const order = {
      mode: Math.floor(Math.random() * Math.pow(10, 1)),
      machine_status: 0,
      machine_id: req.params.id,
      duration: Math.floor(Math.random() * Math.pow(10, 3))
    };
    await firebaseService.writeData(order, order.machine_id);
    const result = await firebaseService.readData(order.machine_id);
    res.json({ data: result, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.machine = async (req, res) => {
  try {
    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: 'success' });
  } catch (_err) {
    res.status(500).json({ error: _err.message });
  }
};

exports.adminModeOn = async (req, res) => {
  try {
    await firebaseService.writeAdminData({ admin: 1 }, req.params.id);

    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.adminModeOff = async (req, res) => {
  try {
    await firebaseService.writeAdminData({ admin: 0 }, req.params.id);

    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
