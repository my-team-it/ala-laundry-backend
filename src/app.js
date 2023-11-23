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
import machineTimerRoutes from "./routes/machineTimer.routes.js";
import dbRoutes from "./routes/db.routes.js";

const app = express();
const appHTTP = express();

// parse an HTML body into a string
app.use(bodyParser.text({ type: "json" }));

// middlewares
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
appHTTP.use(morgan("dev"));
appHTTP.use(express.urlencoded({ extended: false }));
// routes
app.use("/kaspi", kaspiRoutes);
app.use("/machine", machineRoutes);
app.use("/mode", modeRoutes);
app.use("/payment", paymentRoutes);
app.use("/room", roomRoutes);
app.use("/transaction", transactionRoutes);
app.use("/washing", washingRoutes);
app.use("/firebase", firebaseRoutes);
app.use("/machineTimer", machineTimerRoutes);
app.use("/db", dbRoutes)

appHTTP.use("/kaspi", kaspiRoutes);
appHTTP.use("/machine", machineRoutes);
appHTTP.use("/mode", modeRoutes);
appHTTP.use("/payment", paymentRoutes);
appHTTP.use("/room", roomRoutes);
appHTTP.use("/transaction", transactionRoutes);
appHTTP.use("/washing", washingRoutes);
appHTTP.use("/firebase", firebaseRoutes);
appHTTP.use("/machineTimer", machineTimerRoutes);
appHTTP.use("/db", dbRoutes)

// starting the server
export default { app, appHTTP };
