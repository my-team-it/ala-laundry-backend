const firebaseService = require('../services/FirebaseService');

exports.machine_on = async (req, res) => {
    try {
        const order = {
            mode: Math.floor(Math.random() * Math.pow(10, 1)),
            machine_status: 1,
            machine_id: req.params.id,
            duration: Math.floor(Math.random() * Math.pow(10, 3))
        }
        const result = await firebaseService.writeData(order, order.machine_id);
        res.json({ data: result, status: 'success' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
}

exports.machine_off = async (req, res) => {
    try {
        const order = {
            mode: Math.floor(Math.random() * Math.pow(10, 1)),
            machine_status: 0,
            machine_id: req.params.id,
            duration: Math.floor(Math.random() * Math.pow(10, 3))
        }
        const result = await firebaseService.writeData(order, order.machine_id);
        res.json({ data: result, status: 'success' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
}
