import firebaseService from "../services/firebaseService.js";

export const machineOn = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    // Включаем машину: отправляем isOn = 1 в input
    await firebaseService.writeData({ isOn: 1 }, `${req.params.id}/input/isOn`);

    // Ожидаем 2 секунды, чтобы машина успела включиться
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Проверяем, включилась ли машина
    const machineOnState = await firebaseService.readData(`${req.params.id}/input/isOn`);
    if (machineOnState !== 1) {
      throw new Error("Машина не включилась.");
    }

    // Устанавливаем режим стирки, если необходимо
    await firebaseService.writeData({ mode: 1 }, `${req.params.id}/input/mode`);

    // Читаем данные для подтверждения и отправляем ответ
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
    setTimeout(async () => {
      // Проверяем состояние машины перед выбором режима
      const machineState = await firebaseService.readData(req.params.id);

      // Если машина включена, выбираем режим
      if (machineState.machine_status === 1) {
        await firebaseService.writeData(
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
    }, 1000);  // Задержка в 1 секунду для надежного включения машины
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
    const machineState = await firebaseService.readData(req.params.id);
    
    // Проверяем, не установлено ли значение -1, чтобы избежать ненужных операций
    if (machineState.machine_status !== -1) {
      await firebaseService.writeStartStopData({ machine_status: 0 }, req.params.id); // Отключаем машину
    }

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
