import { Router } from "express";
import {
  createWashing,
  deleteWashing,
  readWashing,
  readWashings,
  updateWashing,
} from "../controllers/washingController.js";
const router = Router();

router.get("/", readWashings);
router.post("/add", createWashing);
router.get("/:id", readWashing);
router.post("/update/:id", updateWashing);
router.get("/delete/:id", deleteWashing);

export default router;
