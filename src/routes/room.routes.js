import { Router } from "express";
import {
  createRoom,
  deleteRoom,
  readRoom,
  readRooms,
  updateRoom,
} from "../controllers/roomController.js";
const router = Router();

router.get("/", readRooms);
router.post("/add", createRoom);
router.get("/update/:id", readRoom);
router.post("/update/:id", updateRoom);
router.get("/delete/:id", deleteRoom);

export default router;
