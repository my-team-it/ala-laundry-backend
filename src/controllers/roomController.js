import roomService from "../services/roomService.js";

export const readRooms = async (req, res) => {
  const rows = await roomService.readRooms();
  res.json({ rows });
};

export const createRoom = async (req, res) => {
  const newroom = req.body;
  console.log(req.body);
  const result = await roomService.createRoom(newroom);
  res.json({ message: result });
};

export const readRoom = async (req, res) => {
  const { id } = req.params;
  const [result] = await roomService.readRoom(id);
  res.json({ message: result });
};

export const updateRoom = async (req, res) => {
  const { id } = req.params;
  const newroom = req.body;
  const result = await roomService.updateRoom(id, newroom);
  res.json({ message: result });
};

export const deleteRoom = async (req, res) => {
  const { id } = req.params;
  const result = await roomService.deleteRoom(id);
  res.json({ message: result });
};
