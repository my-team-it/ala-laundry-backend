import machineService from "../services/machineService.js";
import washingService from "../services/washingService.js";
import roomService from "../services/roomService.js";
import firebaseService from "../services/firebaseService.js";
import machineTimerService from "../services/machineTimerService.js";

export const readMachines = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const rows = await machineService.readMachines();
  for (let i = 0; i < rows[0].length; i++) {
    firebaseService.onTimerChange(rows[0][i].id);
  }
  res.json({ data: rows[0] });
};

export const readMachinesWithRooomID = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
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
  res.header("Access-Control-Allow-Origin", "*");
  const rows = await machineService.readMachines();
  for (let i = 0; i < rows[0].length; i++) {
    const element = rows[0][i];
    const roomName = await roomService.readRoom(element.room_id);
    const washingState = await washingService.readLastWashingState(element.id);
    const firebaseState = await firebaseService.readData(element.id);
    const [machineTimerState] =
      await machineTimerService.readMachineTimerByMachineID(element.id);
    element.address = roomName[0].address;
    try {
      const now = new Date().getTime();
      console.log(now);
      console.log(firebaseState.output.timer);
      if (now / 1000 - firebaseState.output.timer > 10) {
        element.state = "NON AVAILABLE";
      } else {
        element.state = washingState[0].state;
      }
    } catch (error) {
      console.log(error);
      if (firebaseState.output.timer == null) {
        element.state = "NON AVAILABLE";
      } else {
        element.state = "AVAILABLE";
      }
    }
  }
  res.json({ data: rows[0] });
};

export const createMachine = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const temp = JSON.parse(JSON.stringify(req.body));
  const newmachine = JSON.parse(Object.keys(temp)[0]);
  console.log(newmachine);
  const result = await machineService.createMachine(newmachine);
  const machine_id = result[0].insertId;
  firebaseService.onTimerChange(machine_id);
  res.json({ data: result });
};

export const readMachine = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    const { id } = req.params;
    const result = await machineService.readMachine(id);
    res.json({ data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const updateMachine = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const { id } = req.params;
  const newmachine = req.body;
  const result = await machineService.updateMachine(id, newmachine);
  res.json({ data: result });
};

export const deleteMachine = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const { id } = req.params;
  const result = await machineService.deleteMachine(id);
  res.json({ data: result });
};
