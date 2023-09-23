import { Router } from "express";
import {
  createMachineTimer,
  deleteMachineTimer,
  readMachineTimer,
  readMachineTimers,
  updateMachineTimer,
  updateMachineTimerByMachineID,
} from "../controllers/machineTimerController.js";
const router = Router();

router.get("/", readMachineTimers);
router.post("/add", createMachineTimer);
router.get("/:id", readMachineTimer);
router.post("/update/:id", updateMachineTimer);
router.post("/update/machine/:machine_id", updateMachineTimerByMachineID);
router.get("/delete/:id", deleteMachineTimer);

export default router;
