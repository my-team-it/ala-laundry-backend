import firebaseService from "../services/firebaseService.js";

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


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
// Parse and validate the machine ID and mode from the request parameters
  const machineId = parseInt(req.params.id, 10);
  const mode = parseInt(req.params.mode, 10);

  if (isNaN(machineId) || isNaN(mode)) {
    console.error(`Invalid machine ID or mode: ${req.params.id}, ${req.params.mode}`);
    return res.status(400).json({ error: "Invalid machine ID or mode" });
  }

  try {
    console.log(`Starting machine ${req.params.id}.`);
    // Write the initial machine status to Firebase
    await firebaseService.writeStartStopData(
      { machine_status: 1 },
      machineId
    );

    // Wait for 1 second before checking the machine status
    await delay(1000);

    console.log(`Checking machine ${machineId} status after start.`);
    const machineState = await firebaseService.readData(machineId);

    if (machineState.machine_status === 1) {
      console.log(`Machine ${machineId} is ON. Setting mode to ${mode}.`);

      // Set the machine mode
      await firebaseService.writeStartStopData(
        { mode: mode },
        machineId
      );

      // Read the updated machine data
      const result = await firebaseService.readData(machineId);
      console.log(`Mode set successfully for machine ${machineId}.`);

      // Send the success response to the client
      res.json({ data: result, status: "success" });
    } else {
      console.error(`Machine ${machineId} did not start properly.`);
      res.status(500).json({ error: "Machine did not start properly." });
    }
  } catch (err) {
    console.error(`Error starting machine ${machineId}: ${err.message}`);
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

export const adminModeOn = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    console.log(`Turning admin mode ON for machine ${req.params.id}.`);
    await firebaseService.writeAdminData({ admin: 1 }, req.params.id);
    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: "success" });
  } catch (err) {
    console.error(`Error turning admin mode ON for machine ${req.params.id}: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

export const adminModeOff = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    console.log(`Turning admin mode OFF for machine ${req.params.id}.`);
    await firebaseService.writeAdminData({ admin: 0 }, req.params.id);

    const result = await firebaseService.readData(req.params.id);
    res.json({ data: result, status: "success" });
  } catch (err) {
    console.error(`Error turning admin mode OFF for machine ${req.params.id}: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};
