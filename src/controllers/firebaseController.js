import firebaseService from "../services/firebaseService.js";

export const machineOn = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    await firebaseService.writeData(
      { machine_status: 1, mode: 1 },
      req.params.id
    );
    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const machineOnWithMode = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    await firebaseService.writeData(
      { machine_status: 1, mode: parseInt(req.params.mode) },
      req.params.id
    );
    // Добавляем задержку для выбора режима после включения машины
    // Проверяем состояние машины после установки
    const machineState = await firebaseService.readData(req.params.id);

      if (machineState.machine_status === 1) {
      res.json({ data: machineState, status: "success" });
    } else {
      res.status(500).json({ error: "Machine did not start properly." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const machineOff = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    await firebaseService.writeData(
      { machine_status: 0},
      req.params.id
    );
    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const machineStart = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    // Включаем машину (machine_status = 1)
    await firebaseService.writeStartStopData(
      { machine_status: 1 }, // Сначала включаем машину без выбора режима
      req.params.id
    );

    // Добавляем задержку для выбора режима после включения машины
    setTimeout(async () => {
      // Проверяем текущее состояние машины
      const machineState = await firebaseService.readData(req.params.id);

      // Если машина включена (machine_status = 1), выбираем режим
      if (machineState.machine_status === 1) {
        await firebaseService.writeStartStopData(
          { mode: parseInt(req.params.mode) },  // Устанавливаем режим после включения
          req.params.id
        );

        // Читаем данные машины для подтверждения
        const result = await firebaseService.readData(req.params.id);
        res.json({ data: result, status: "success" });
      } else {
        // Если машина не включена, возвращаем ошибку
        res.status(500).json({ error: "Machine did not start properly." });
      }
    }, 1000);  // Задержка 1 секунда для надежного включения машины
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const machineStop = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    await firebaseService.writeStartStopData(
      { machine_status: 0 },
      req.params.id
    );
    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const machine = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: "success" });
  } catch (_err) {
    res.status(500).json({ error: _err.message });
  }
};
