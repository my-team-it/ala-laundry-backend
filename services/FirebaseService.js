const firebase = require('firebase')

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyB95Rp0pvwjcFi0dHEvvrRh0svfTkuL7MA",
  authDomain: "ala-laundry-902e5.firebaseapp.com",
  projectId: "ala-laundry-902e5",
  storageBucket: "ala-laundry-902e5.appspot.com",
  messagingSenderId: "844364387376",
  appId: "1:844364387376:web:545d4930063b7ad41ec9f5",
  measurementId: "G-BLBDRXZKGE"
};

firebase.initializeApp(firebaseConfig)

const database = firebase.database()
const washingMachinesRef = database.ref();

module.exports.writeData = async (data, machine_id) => {
  update(ref(washingMachinesRef, `/${machine_id}/input`), {
    mode: data.mode,
    trigger: data.trigger,
  })
    .then(() => {
      return {message:"Настройки успешно заданы."};
    })
    .catch(() => {
      return {message:"Не удалось сохранить настройки"};
    });

  update(ref(db, `/${machine_id}/output`), {
    duration: data.duration,
  });
};

module.exports.readData = async (machine_id) => {
  get(child(washingMachinesRef, `/${machine_id}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        return {data:data}
      } else {
        return {message:"No data available"};
      }
    })
    .catch((error) => {
      return {error:error};
    });
};