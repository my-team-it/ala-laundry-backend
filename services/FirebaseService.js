const firebase = require('firebase')

const firebaseConfig = {
  apiKey: 'AIzaSyB95Rp0pvwjcFi0dHEvvrRh0svfTkuL7MA',
  authDomain: 'ala-laundry-902e5.firebaseapp.com',
  projectId: 'ala-laundry-902e5',
  storageBucket: 'ala-laundry-902e5.appspot.com',
  messagingSenderId: '844364387376',
  appId: '1:844364387376:web:545d4930063b7ad41ec9f5',
  measurementId: 'G-BLBDRXZKGE'
};

firebase.initializeApp(firebaseConfig)

module.exports.writeData = async (data, machine_id) => {
    
    try {
      let washingMachinesInputRef = firebase.database().ref(`${machine_id}/input`);
      washingMachinesInputRef.update({
        mode: data.mode,
        trigger: data.machine_status,
      });

      let washingMachinesOutputRef = firebase.database().ref(`${machine_id}/output`);
      washingMachinesOutputRef.update({
        duration: data.duration,
      })
    } catch (err) {
      console.log(err);
    }
    
};

// module.exports.readData = async (machine_id) => {
//   var rootRef = firebase.database().ref();
//   rootRef.once("value")
//     .then(function(snapshot) {
//       var key = snapshot.key; // null
//       var childKey = snapshot.child(`/{}/ad`).key; // "ada"
//     });
// };