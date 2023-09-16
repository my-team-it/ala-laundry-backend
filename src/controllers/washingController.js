import washingService from "../services/washingService.js";

export const readWashings = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const [rows] = await washingService.readWashings();
  res.json({ data: rows });
};

export const createWashing = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const newwashing = req.body;
  const result = await washingService.createWashing(newwashing);
  res.json({ data: result });
};

export const readWashing = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const { id } = req.params;
  const [result] = await washingService.readWashing(id);
  res.json({ data: result });
};

export const updateWashing = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const { id } = req.params;
  const newwashing = req.body;
  const result = await washingService.updateWashing(id, newwashing);
  res.json({ data: result });
};

export const deleteWashing = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const { id } = req.params;
  const result = await washingService.deleteWashing(id);
  res.json({ data: result });
};
