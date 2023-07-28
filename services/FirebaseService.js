/* eslint-disable semi */
const firebase = require('firebase');

const firebaseConfig = {
  apiKey: 'AIzaSyB95Rp0pvwjcFi0dHEvvrRh0svfTkuL7MA',
  authDomain: 'ala-laundry-902e5.firebaseapp.com',
  projectId: 'ala-laundry-902e5',
  storageBucket: 'ala-laundry-902e5.appspot.com',
  messagingSenderId: '844364387376',
  appId: '1:844364387376:web:545d4930063b7ad41ec9f5',
  measurementId: 'G-BLBDRXZKGE'
};

firebase.initializeApp(firebaseConfig);

module.exports.writeData = async (data, machineId) => {
  try {
    const washingMachinesInputRef2 = firebase
      .database()
      .ref(`${machineId}/input`);
    washingMachinesInputRef2.update({
      trigger: data.machine_status
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.writeAdminData = async (status, machineId) => {
  try {
    const washingMachinesInputRef = firebase
      .database()
      .ref(`${machineId}/input`);
    washingMachinesInputRef.update({
      admin: status
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.readData = async (machineId) => {
  try {
    const washingMachinesInputRef = firebase.database().ref(`${machineId}`);
    const input = await washingMachinesInputRef.once('value');

    if (!input.exists()) {
      throw new Error('Machine is not found');
    }

    return input;
  } catch (_err) {
    return { error: _err.message };
  }
};
