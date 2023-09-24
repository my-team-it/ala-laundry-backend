import { Router } from "express";
import {
  machineOn,
  machineOnWithMode,
  machineOff,
  machineStart,
  machineStop,
  adminModeOn,
  adminModeOff,
  machine,
} from "../controllers/firebaseController.js";
const router = Router();

router.route("/on/:id").get(machineOn);
router.route("/on/:id/mode/:mode").get(machineOnWithMode);
router.route("/off/:id").get(machineOff);
router.route("/start/:id/mode/:mode").get(machineStart);
router.route("/stop/:id").get(machineStop);
router.route("/admin/on/:id").get(adminModeOn);
router.route("/admin/off/:id").get(adminModeOff);
router.route("/:id").get(machine);

export default router;
