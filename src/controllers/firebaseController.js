import firebaseService from "../services/firebaseService.js";
import logger from "../logger.js"; // Импорт логгера

export const machineOn = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    logger.info(`Turning on machine with ID: ${req.params.id}`);
    await firebaseService.writeData(
      { machine_status: 1, mode: 1 },
      req.params.id
    );
    const result = await firebaseService.readData(req.params.id);
    logger.info(`Successfully turned on machine ${req.params.id}`, result);
    res.json({ data: result, status: "success" });
  } catch (err) {
    logger.error(`Error turning on machine ${req.params.id}: ${err.message}`, err);
    res.status(500).json({ error: err.message });
  }
};

export const machineOnWithMode = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    logger.info(`Turning on machine with mode ${req.params.mode} for machine ID: ${req.params.id}`);
    await firebaseService.writeData(
      { machine_status: 1, mode: parseInt(req.params.mode) },
      req.params.id
    );

    const machineState = await firebaseService.readData(req.params.id);
    if (machineState.machine_status === 1) {
      logger.info(`Machine ${req.params.id} successfully turned on with mode ${req.params.mode}`);
      res.json({ data: machineState, status: "success" });
    } else {
      logger.warn(`Machine ${req.params.id} did not start properly.`);
      res.status(500).json({ error: "Machine did not start properly." });
    }
  } catch (err) {
    logger.error(`Error turning on machine ${req.params.id} with mode ${req.params.mode}: ${err.message}`, err);
    res.status(500).json({ error: err.message });
  }
};

export const machineOff = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    logger.info(`Turning off machine with ID: ${req.params.id}`);
    await firebaseService.writeData(
      { machine_status: 0 },
      req.params.id
    );
    const result = await firebaseService.readData(req.params.id);
    logger.info(`Successfully turned off machine ${req.params.id}`, result);
    res.json({ data: result, status: "success" });
  } catch (err) {
    logger.error(`Error turning off machine ${req.params.id}: ${err.message}`, err);
    res.status(500).json({ error: err.message });
  }
};

export const machineStart = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    logger.info(`Starting machine with ID: ${req.params.id}`);
    await firebaseService.writeStartStopData(
      { machine_status: 1 }, // Включаем машину без выбора режима
      req.params.id
    );

    setTimeout(async () => {
      const machineState = await firebaseService.readData(req.params.id);
      if (machineState.machine_status === 1) {
        logger.info(`Machine ${req.params.id} started successfully. Setting mode to ${req.params.mode}.`);
        await firebaseService.writeStartStopData(
          { mode: parseInt(req.params.mode) },  // Устанавливаем режим после включения
          req.params.id
        );

        const result = await firebaseService.readData(req.params.id);
        logger.info(`Mode ${req.params.mode} set successfully for machine ${req.params.id}`, result);
        res.json({ data: result, status: "success" });
      } else {
        logger.warn(`Machine ${req.params.id} did not start properly.`);
        res.status(500).json({ error: "Machine did not start properly." });
      }
    }, 1000);  // Задержка 1 секунда для надежного включения машины
  } catch (err) {
    logger.error(`Error starting machine ${req.params.id}: ${err.message}`, err);
    res.status(500).json({ error: err.message });
  }
};

export const machineStop = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    logger.info(`Stopping machine with ID: ${req.params.id}`);
    await firebaseService.writeStartStopData(
      { machine_status: 0 },
      req.params.id
    );
    const result = await firebaseService.readData(req.params.id);
    logger.info(`Machine ${req.params.id} stopped successfully`, result);
    res.json({ data: result, status: "success" });
  } catch (err) {
    logger.error(`Error stopping machine ${req.params.id}: ${err.message}`, err);
    res.status(500).json({ error: err.message });
  }
};

export const machine = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    logger.info(`Fetching machine status for ID: ${req.params.id}`);
    const result = await firebaseService.readData(req.params.id);
    logger.info(`Fetched machine status for ID ${req.params.id}`, result);
    res.json({ data: result, status: "success" });
  } catch (err) {
    logger.error(`Error fetching machine status for ID ${req.params.id}: ${err.message}`, err);
    res.status(500).json({ error: err.message });
  }
};
