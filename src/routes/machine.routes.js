import { Router } from "express";
import {
  createMachine,
  deleteMachine,
  readMachine,
  readMachines,
  readMachinesWithRooomID,
  readMachinesAndAddress,
  updateMachine,
} from "../controllers/machineController.js";
const router = Router();

router.get("/", readMachines);
router.get("/room/:id", readMachinesWithRooomID);
router.get("/address", readMachinesAndAddress);
router.post("/add", createMachine);
router.get("/update/:id", readMachine);
router.post("/update/:id", updateMachine);
router.get("/delete/:id", deleteMachine);

export default router;
