// Этот файл отвечает за запись и чтение данных в Firebase.
// Основные функции:
// writeData: записывает статус машины (включена/выключена) в Firebase.
// writeStartStopData: управляет выбором режима и стартом машины, с задержками.
// readData: читает текущее состояние машины.
// onTimerChange: реагирует на изменение таймера машины.

import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  update,
  get,
  child,
  onValue,
} from "firebase/database";

import machineTimerService from "./machineTimerService.js";

const firebaseConfig = {
  apiKey: "AIzaSyB95Rp0pvwjcFi0dHEvvrRh0svfTkuL7MA",
  authDomain: "ala-laundry-902e5.firebaseapp.com",
  projectId: "ala-laundry-902e5",
  storageBucket: "ala-laundry-902e5.appspot.com",
  messagingSenderId: "844364387376",
  appId: "1:844364387376:web:545d4930063b7ad41ec9f5",
  measurementId: "G-BLBDRXZKGE",
};

const app = initializeApp(firebaseConfig);

const writeData = async (data, machine_id) => {
  const database = getDatabase(app);

  // Логируем данные перед отправкой в Firebase

  try {
    const updates = {};
    updates["isOn"] = data.machine_status;

    await update(child(ref(database), `${machine_id}/input/isOn`), updates);
  } catch (error) {
    throw error;
  }
};

const writeStartStopData = async (data, machine_id) => {
  const database = getDatabase(app);

  try {
    if (data.mode != null) {
      const updates_1 = {};
      updates_1["mode"] = data.mode;

      setTimeout(
        async () => {
          await update(child(ref(database), `${machine_id}/input/mode`), updates_1);
        },
        5000
      );
    }

    const updates_2 = {};
    updates_2["isStarted"] = data.machine_status;

    logger.info(`Writing start/stop data to Firebase for machine ${machine_id}:`, updates_2);
    setTimeout(
      async () => {
        await update(child(ref(database), `${machine_id}/input/isStarted`), updates_2);
      },
      7000
    );

    return true;
  } catch (error) {
    throw error;
  }
};

const writeCheckData = async (data, machine_id) => {
  const database = getDatabase(app);

  try {
    const updates = {};
    updates["isChecking"] = data.isChecking;

    await update(child(ref(database), `${machine_id}/input/isChecking`), updates);
  } catch (error) {
    throw error;
  }
};

const writeAdminData = async (data, machine_id) => {
  const database = getDatabase(app);

  try {
    const updates = {};
    updates["/admin/"] = data.admin;

    await update(child(ref(database), `${machine_id}/input`), updates);
  } catch (error) {
    throw error;
  }
};

const readData = async (machineId) => {
  const dbRef = ref(getDatabase());

  try {
    const result = await get(child(dbRef, `${machineId}`));
    const data = result.val();
    return data;
  } catch (error) {
    throw error;
  }
};

const onTimerChange = (machine_id) => {
  // Логирование изменений таймера для отладки
  
  // Оригинальная логика была закомментирована
  /*
  const database = getDatabase(app);
  onValue(ref(database, `${machine_id}/output/`), async (snapshot) => {
    const data = snapshot.val();
    const now = new Date();
    const [machineTimerState] = await machineTimerService.readMachineTimerByMachineID(machine_id);
    
    if (data == null) {
      await machineTimerService.createMachineTimer({
        machine_id,
      });
    } else {
      if (machineTimerState[0].length == 0) {
        await machineTimerService.createMachineTimer({
          current_timer: now.getTime(),
          machine_id,
        });
      }
      await machineTimerService.updateMachineTimerByMachineID(machine_id, {
        current_timer: now.getTime(),
      });
    }
  });
  */
};

export default {
  writeData,
  writeCheckData,
  writeAdminData,
  writeStartStopData,
  readData,
  onTimerChange,
};
