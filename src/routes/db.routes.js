import { Router } from "express";
import {
    sendQuery
} from "../controllers/dbController.js";
const router = Router();

router.get("/", sendQuery);

export default router;