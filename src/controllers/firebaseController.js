import firebaseService from "../services/firebaseService.js";

// Включение машины с установкой режима по умолчанию (mode = 1)
export const machineOn = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    // Включаем машину и устанавливаем режим по умолчанию
    await firebaseService.writeData(
      { machine_status: 1, mode: 1 },
      `${req.params.id}/input`
    );

    // Проверяем, включилась ли машина
    const machineState = await firebaseService.readData(req.params.id);
    if (machineState.input.machine_status !== 1) {
      throw new Error("Машина не включилась.");
    }

    // Возвращаем успешный результат
    res.json({ data: machineState, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Включение машины с выбранным режимом
export const machineOnWithMode = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    // Включаем машину с выбранным режимом
    await firebaseService.writeData(
      { machine_status: 1, mode: parseInt(req.params.mode) },
      `${req.params.id}/input`
    );

    // Проверяем, включилась ли машина
    const machineState = await firebaseService.readData(req.params.id);
    if (machineState.input.machine_status !== 1) {
      throw new Error("Машина не включилась.");
    }

    // Устанавливаем выбранный режим
    await firebaseService.writeData(
      { mode: parseInt(req.params.mode) },
      `${req.params.id}/input/mode`
    );

    // Возвращаем успешный результат
    res.json({ data: machineState, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Выключение машины
export const machineOff = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    // Отключаем машину
    await firebaseService.writeData(
      { machine_status: 0 },
      `${req.params.id}/input/machine_status`
    );

    // Проверяем текущее состояние машины
    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Запуск стирки
export const machineStart = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    // Включаем машину
    await firebaseService.writeStartStopData(
      { machine_status: 1 },
      req.params.id
    );

    // Проверяем, включилась ли машина
    const machineState = await firebaseService.readData(req.params.id);
    if (machineState.input.machine_status !== 1) {
      throw new Error("Машина не включилась.");
    }

    // Устанавливаем выбранный режим
    await firebaseService.writeStartStopData(
      { mode: parseInt(req.params.mode) },
      req.params.id
    );

    // Проверяем блокировку двери (isDoorOpen = 1)
    const doorState = await firebaseService.readData(`${req.params.id}/output/isDoorOpen`);
    if (doorState !== 1) {
      throw new Error("Дверь не заблокировалась, стирка не может начаться.");
    }

    // Возвращаем успешный результат
    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Остановка стирки и выключение машины
export const machineStop = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    // Проверяем текущее состояние машины
    const machineState = await firebaseService.readData(req.params.id);

    // Если состояние машины не -1, отключаем машину
    if (machineState.input.machine_status !== -1) {
      await firebaseService.writeStartStopData({ machine_status: 0 }, req.params.id);
    }

    // Возвращаем результат
    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Получение текущего состояния машины
export const machine = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Включение режима администрирования
export const adminModeOn = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    await firebaseService.writeAdminData({ admin: 1 }, req.params.id);
    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Выключение режима администрирования
export const adminModeOff = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    await firebaseService.writeAdminData({ admin: 0 }, req.params.id);
    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
