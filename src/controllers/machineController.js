import machineService from "../services/machineService.js";
import washingService from "../services/washingService.js";
import roomService from "../services/roomService.js";

export const readMachines = async (req, res) => {
  const rows = await machineService.readMachines();
  res.json({ data: rows[0] });
};

export const readMachinesWithRooomID = async (req, res) => {
  const { id } = req.params;
  const rows = await machineService.readMachinesWithRooomID(id);
  for (let i = 0; i < rows[0].length; i++) {
    const element = rows[0][i];
    const washingState = await washingService.readLastWashingState(element.id);
    element.state = washingState[0].state;
  }
  res.json({ data: rows[0] });
};

export const readMachinesAndAddress = async (req, res) => {
  const rows = await machineService.readMachines();
  for (let i = 0; i < rows[0].length; i++) {
    const element = rows[0][i];
    const roomName = await roomService.readRoom(element.room_id);
    const washingState = await washingService.readLastWashingState(element.id);
    element.address = roomName[0].address;
    element.state = washingState[0].state;
  }
  res.json({ data: rows[0] });
};

export const createMachine = async (req, res) => {
  const newmachine = req.body;
  console.log(newmachine);
  const result = await machineService.createMachine(newmachine);
  res.json({ message: result });
};

export const readMachine = async (req, res) => {
  const { id } = req.params;
  const result = await machineService.readMachine(id);
  res.json({ message: result });
};

export const updateMachine = async (req, res) => {
  const { id } = req.params;
  const newmachine = req.body;
  const result = await machineService.updateMachine(id, newmachine);
  res.json({ message: result });
};

export const deleteMachine = async (req, res) => {
  const { id } = req.params;
  const result = await machineService.deleteMachine(id);
  res.json({ message: result });
};
