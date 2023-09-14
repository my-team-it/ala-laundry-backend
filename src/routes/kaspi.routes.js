import { Router } from "express";
import { paymentProcess, getPrice } from "../controllers/kaspiController.js";
const router = Router();

router.get("/payment", paymentProcess);
router.get("/get_price", getPrice);

export default router;
