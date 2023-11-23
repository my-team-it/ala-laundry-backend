import machineService from "../services/dbService.js";

export const sendQuery = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const rows = await machineService.readMachines();
  res.json({ data: rows });
};
