import paymentService from "../services/paymentService.js";

export const readPayments = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const [rows] = await paymentService.readPayment();
  res.json({ data: rows });
};

export const createPayment = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const newpayment = req.body;
  const result = await paymentService.createPayment(newpayment);
  res.json({ data: result });
};

export const readPayment = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const { id } = req.params;
  const [result] = await paymentService.readPayment(id);
  res.json({ data: result });
};

export const updatePayment = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const { id } = req.params;
  const newpayment = req.body;
  const result = await paymentService.updatePayment(id, newpayment);
  res.json({ data: result });
};

export const deletePayment = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const { id } = req.params;
  const result = await paymentService.deletePayment(id);
  res.json({ data: result });
};
