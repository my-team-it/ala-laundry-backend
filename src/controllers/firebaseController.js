import firebaseService from "../services/firebaseService.js";

export const machineOn = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    await firebaseService.writeData(
      { machine_status: 1, mode: parseInt(req.params.mode) },
      req.params.id
    );
    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const machineOff = async (req, res) => {
  try {
    await firebaseService.writeData({ machine_status: 0 }, req.params.id);
    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const machine = async (req, res) => {
  try {
    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: "success" });
  } catch (_err) {
    res.status(500).json({ error: _err.message });
  }
};

export const adminModeOn = async (req, res) => {
  try {
    await firebaseService.writeAdminData({ admin: 1 }, req.params.id);
    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const adminModeOff = async (req, res) => {
  try {
    await firebaseService.writeAdminData({ admin: 0 }, req.params.id);

    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
