import { Router } from "express";
import {
  machineOn,
  machineOff,
  adminModeOn,
  adminModeOff,
  machine,
} from "../controllers/firebaseController.js";
const router = Router();

router.route("/on/:id").get(machineOn);
router.route("/off/:id").get(machineOff);
router.route("/admin/on/:id").get(adminModeOn);
router.route("/admin/off/:id").get(adminModeOff);
router.route("/:id").get(machine);

export default router;
