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

  // Write the new post's data simultaneously in the posts list and the user's post list.
  const updates = {};
  updates["/onOff/"] = data.machine_status;
  updates["/mode/"] = data.mode;

  return update(child(ref(database), `${machine_id}/input`), updates);
};

const writeStartStopData = async (data, machine_id) => {
  const database = getDatabase(app);

  // Write the new post's data simultaneously in the posts list and the user's post list.
  const updates = {};
  updates["/startStop/"] = data.machine_status;
  updates["/mode/"] = data.mode;

  return update(child(ref(database), `${machine_id}/input`), updates);
};

const writeAdminData = async (data, machine_id) => {
  const database = getDatabase(app);

  // Write the new post's data simultaneously in the posts list and the user's post list.
  const updates = {};
  updates["/admin/"] = data.admin;

  return update(child(ref(database), `${machine_id}/input`), updates);
};

const readData = async (machineId) => {
  const dbRef = ref(getDatabase());
  const result = await get(child(dbRef, `${machineId}`));
  return result.val();
};

const onTimerChange = (machine_id) => {
  const database = getDatabase(app);
  onValue(ref(database, `${machine_id}/output/`), async (snapshot) => {
    const data = snapshot.val();
    const machineTimerState =
      await machineTimerService.readMachineTimerByMachineID(machine_id);
    if (data == null) {
      machineTimerService.createMachineTimer({
        machine_id,
      });
    } else {
      if (machineTimerState[0].length == 0) {
        machineTimerService.createMachineTimer({
          current_timer: Date.now(),
          machine_id,
        });
      }
      machineTimerService.updateMachineTimerByMachineID(machine_id, {
        current_timer: Date.now(),
      });
    }
  });
};

export default {
  writeData,
  writeAdminData,
  writeStartStopData,
  readData,
  onTimerChange,
};
