import washingService from "../services/washingService.js";

export const readWashings = async (req, res) => {
  const [rows] = await washingService.readWashings();
  res.json({ rows });
};

export const createWashing = async (req, res) => {
  const newwashing = req.body;
  const result = await washingService.createWashing(newwashing);
  res.json({ message: result });
};

export const readWashing = async (req, res) => {
  const { id } = req.params;
  const [result] = await washingService.readWashing(id);
  res.json({ message: result });
};

export const updateWashing = async (req, res) => {
  const { id } = req.params;
  const newwashing = req.body;
  const result = await washingService.updateWashing(id, newwashing);
  res.json({ message: result });
};

export const deleteWashing = async (req, res) => {
  const { id } = req.params;
  const result = await washingService.deleteWashing(id);
  res.json({ message: result });
};
