const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyC_qTjOTUx0BdW5qMajZauMvquItJXchVA",
  authDomain: "soniexchange-eedf6.firebaseapp.com",
  projectId: "soniexchange-eedf6",
  storageBucket: "soniexchange-eedf6.firebasestorage.app",
  messagingSenderId: "885491339460",
  appId: "1:885491339460:web:611843ab509f023a397991"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// AUTO-INITIALIZE MASTER ADMIN ON FIREBASE
async function initMasterAdmin() {
  try {
    const adminRef = doc(db, 'users', 'Soniexchange');
    const docSnap = await getDoc(adminRef);

    if (!docSnap.exists()) {
      await setDoc(adminRef, {
        username: 'Soniexchange',
        password: 'Lyy@5656',
        role: 'ADMIN',
        points: 100000000,
        creditRef: 100000000,
        mustChangePassword: false,
        txnPassword: '745398',
        userActive: true,
        betActive: true,
        createdAt: new Date().toISOString()
      });
      console.log('Master Admin Soniexchange created in Firebase!');
    }
  } catch (err) {
    console.error('Error initializing Master Admin:', err);
  }
}
initMasterAdmin();

module.exports = { db };

