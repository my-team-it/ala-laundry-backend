import { Router } from "express";
import {
  createMode,
  deleteMode,
  readMode,
  readModes,
  updateMode,
} from "../controllers/modeController.js";
const router = Router();

router.get("/", readModes);
router.post("/add", createMode);
router.get("/update/:id", readMode);
router.post("/update/:id", updateMode);
router.get("/delete/:id", deleteMode);

export default router;
