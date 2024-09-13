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
  try {
    console.log(`Turning machine ${req.params.id} ON with mode ${req.params.mode}.`);
    await firebaseService.writeData(
      { machine_status: 1, mode: parseInt(req.params.mode) },
      req.params.id
    );
    
    setTimeout(async () => {
      console.log(`Checking machine ${req.params.id} status after turning ON.`);
      const machineState = await firebaseService.readData(req.params.id);

      if (machineState.machine_status === 1) {
        console.log(`Machine ${req.params.id} is ON. Setting mode to ${req.params.mode}.`);
        await firebaseService.writeData(
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
    console.error(`Error turning machine ${req.params.id} ON with mode ${req.params.mode}: ${err.message}`);
    res.status(500).json({ error: err.message });
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

// export const adminModeOn = async (req, res) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   try {
//     console.log(`Turning admin mode ON for machine ${req.params.id}.`);
//     await firebaseService.writeAdminData({ admin: 1 }, req.params.id);
//     const result = await firebaseService.readData(req.params.id);
//     res.json({ data: result, status: "success" });
//   } catch (err) {
//     console.error(`Error turning admin mode ON for machine ${req.params.id}: ${err.message}`);
//     res.status(500).json({ error: err.message });
//   }
// };

// export const adminModeOff = async (req, res) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   try {
//     console.log(`Turning admin mode OFF for machine ${req.params.id}.`);
//     await firebaseService.writeAdminData({ admin: 0 }, req.params.id);

//     const result = await firebaseService.readData(req.params.id);
//     res.json({ data: result, status: "success" });
//   } catch (err) {
//     console.error(`Error turning admin mode OFF for machine ${req.params.id}: ${err.message}`);
//     res.status(500).json({ error: err.message });
//   }
// };
