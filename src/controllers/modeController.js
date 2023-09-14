import modeService from "../services/modeService.js";

export const readModes = async (req, res) => {
  const [rows] = await modeService.readModes();
  res.json({ rows });
};

export const createMode = async (req, res) => {
  const newmode = req.body;
  const result = await modeService.createMode(newmode);
  res.json({ message: result });
};

export const readMode = async (req, res) => {
  const { id } = req.params;
  const [result] = await modeService.readMode(id);
  res.json({ message: result });
};

export const updateMode = async (req, res) => {
  const { id } = req.params;
  const newmode = req.body;
  const result = await modeService.updateMode(id, newmode);
  res.json({ message: result });
};

export const deleteMode = async (req, res) => {
  const { id } = req.params;
  const result = await modeService.deleteMode(id);
  res.json({ message: result });
};
