import { Router } from "express";
import {
  createPayment,
  deletePayment,
  readPayment,
  readPayments,
  updatePayment,
} from "../controllers/paymentController.js";
const router = Router();

router.get("/", readPayments);
router.post("/add", createPayment);
router.get("/update/:id", readPayment);
router.post("/update/:id", updatePayment);
router.get("/delete/:id", deletePayment);

export default router;
