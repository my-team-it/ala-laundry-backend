import paymentService from "../services/paymentService.js";

export const readPayments = async (req, res) => {
  const [rows] = await paymentService.readPayment();
  res.json({ rows });
};

export const createPayment = async (req, res) => {
  const newpayment = req.body;
  const result = await paymentService.createPayment(newpayment);
  res.json({ message: result });
};

export const readPayment = async (req, res) => {
  const { id } = req.params;
  const [result] = await paymentService.readPayment(id);
  res.json({ message: result });
};

export const updatePayment = async (req, res) => {
  const { id } = req.params;
  const newpayment = req.body;
  const result = await paymentService.updatePayment(id, newpayment);
  res.json({ message: result });
};

export const deletePayment = async (req, res) => {
  const { id } = req.params;
  const result = await paymentService.deletePayment(id);
  res.json({ message: result });
};
