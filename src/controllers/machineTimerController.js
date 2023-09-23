import machineTimerService from "../services/machineTimerService.js";

export const readMachineTimers = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const [rows] = await machineTimerService.readMachineTimers();
  res.json({ data: rows });
};

export const createMachineTimer = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const newmachineTimer = req.body;
  const result = await machineTimerService.createMachineTimer(newmachineTimer);
  res.json({ data: result });
};

export const readMachineTimer = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const { id } = req.params;
  const [result] = await machineTimerService.readMachineTimer(id);
  res.json({ data: result });
};

export const updateMachineTimer = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const { id } = req.params;
  const newmachineTimer = req.body;
  const result = await machineTimerService.updateMachineTimer(
    id,
    newmachineTimer
  );
  res.json({ data: result });
};

export const updateMachineTimerByMachineID = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const { machine_id } = req.params;
  const newmachineTimer = req.body;
  const result = await machineTimerService.updateMachineTimerByMachineID(
    machine_id,
    newmachineTimer
  );
  res.json({ data: result });
};

export const deleteMachineTimer = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const { id } = req.params;
  const result = await machineTimerService.deleteMachineTimer(id);
  res.json({ data: result });
};
