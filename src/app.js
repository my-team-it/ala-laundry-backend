import express from "express";
import path from "path";
import morgan from "morgan";
import bodyParser from "body-parser";

import kaspiRoutes from "./routes/kaspi.routes.js";
import machineRoutes from "./routes/machine.routes.js";
import modeRoutes from "./routes/mode.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import roomRoutes from "./routes/room.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import washingRoutes from "./routes/washing.routes.js";
import firebaseRoutes from "./routes/firebase.routes.js";

import { fileURLToPath } from "url";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// settings
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// parse an HTML body into a string
app.use(bodyParser.text({ type: "text/html" }));

// middlewares
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

// routes
app.use("/kaspi", kaspiRoutes);
app.use("/machine", machineRoutes);
app.use("/mode", modeRoutes);
app.use("/payment", paymentRoutes);
app.use("/room", roomRoutes);
app.use("/transaction", transactionRoutes);
app.use("/washing", washingRoutes);
app.use("/firebase", firebaseRoutes);
app.get("/", async (req, res) => {
  res.render("main", {});
});
// static files
app.use(express.static(path.join(__dirname, "public")));

// starting the server
export default app;
