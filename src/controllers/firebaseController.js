import firebaseService from "../services/firebaseService.js";

export const machineOn = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    console.log(`Turning machine ${req.params.id} ON with mode 1.`);
    await firebaseService.writeData(
      { machine_status: 1, mode: 1 },
      req.params.id
    );
    console.log(`Machine ${req.params.id} turned ON successfully.`);
    
    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: "success" });
  } catch (err) {
    console.error(`Error turning machine ${req.params.id} ON: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

export const machineOnWithMode = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const machineId = req.params.id;
  const mode = parseInt(req.params.mode);
  
  try {
    console.log(`Attempting to turn on machine ${machineId} with mode ${mode}.`);
    
    // Включаем машину и сразу задаём режим
    await firebaseService.writeData({ machine_status: 1, mode: mode }, machineId);
    console.log(`Machine ${machineId} turned ON with mode ${mode}.`);

    // Добавляем задержку для проверки
    setTimeout(async () => {
      try {
        // Проверяем статус машины через 1 секунду
        console.log(`Checking status of machine ${machineId} after turning ON.`);
        const machineState = await firebaseService.readData(machineId);
        
        // Если машина включена, проверяем успешную установку режима
        if (machineState.machine_status === 1 && machineState.output.mode === mode) {
          console.log(`Machine ${machineId} is ON and mode ${mode} is successfully set.`);
          
          // Отправляем успешный результат
          const result = await firebaseService.readData(machineId);
          res.json({ data: result, status: "success" });
        } else {
          // Если машина не включилась или режим не установлен, возвращаем ошибку
          console.error(`Failed to set mode ${mode} on machine ${machineId}. Retrying...`);
          res.status(500).json({ error: "Failed to set machine mode or start machine." });
        }
      } catch (checkErr) {
        // Ловим ошибки во время проверки статуса машины
        console.error(`Error checking status of machine ${machineId} after ON: ${checkErr.message}`);
        res.status(500).json({ error: `Error checking machine status: ${checkErr.message}` });
      }
    }, 1000); // Задержка в 1 секунду для проверки состояния машины
  } catch (err) {
    // Ловим ошибки при включении машины
    console.error(`Error turning machine ${machineId} ON with mode ${mode}: ${err.message}`);
    res.status(500).json({ error: `Error turning on machine: ${err.message}` });
  }
};


export const machineOff = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    console.log(`Turning machine ${req.params.id} OFF.`);
    await firebaseService.writeData(
      { machine_status: 0 },
      req.params.id
    );
    console.log(`Machine ${req.params.id} turned OFF successfully.`);
    
    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: "success" });
  } catch (err) {
    console.error(`Error turning machine ${req.params.id} OFF: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

export const machineStart = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    console.log(`Starting machine ${req.params.id}.`);
    await firebaseService.writeStartStopData(
      { machine_status: 1 },
      req.params.id
    );

    setTimeout(async () => {
      console.log(`Checking machine ${req.params.id} status after start.`);
      const machineState = await firebaseService.readData(req.params.id);

      if (machineState.machine_status === 1) {
        console.log(`Machine ${req.params.id} is ON. Setting mode to ${req.params.mode}.`);
        await firebaseService.writeStartStopData(
          { mode: parseInt(req.params.mode) },  
          req.params.id
        );

        const result = await firebaseService.readData(req.params.id);
        console.log(`Mode set successfully for machine ${req.params.id}.`);
        res.json({ data: result, status: "success" });
      } else {
        console.error(`Machine ${req.params.id} did not start properly.`);
        res.status(500).json({ error: "Machine did not start properly." });
      }
    }, 1000);
  } catch (err) {
    console.error(`Error starting machine ${req.params.id}: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

export const machineStop = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    console.log(`Stopping machine ${req.params.id}.`);
    const machineState = await firebaseService.readData(req.params.id);
    
    if (machineState.machine_status !== -1) {
      await firebaseService.writeStartStopData({ machine_status: 0 }, req.params.id);
      console.log(`Machine ${req.params.id} stopped successfully.`);
    } else {
      console.log(`Machine ${req.params.id} was already stopped or reset.`);
    }

    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: "success" });
  } catch (err) {
    console.error(`Error stopping machine ${req.params.id}: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

export const machine = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    console.log(`Fetching data for machine ${req.params.id}.`);
    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: "success" });
  } catch (err) {
    console.error(`Error fetching data for machine ${req.params.id}: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};
