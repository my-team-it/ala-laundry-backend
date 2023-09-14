import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  readTransaction,
  readTransactions,
  updateTransaction,
} from "../controllers/transactionController.js";
const router = Router();

router.get("/", readTransactions);
router.post("/add", createTransaction);
router.get("/:id", readTransaction);
router.post("/update/:id", updateTransaction);
router.get("/delete/:id", deleteTransaction);

export default router;
