const express = require('express');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();

// ==========================================
// FIREBASE INITIALIZATION (YOUR NEW CONFIG)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyC_qTjOTUx0BdW5qMajZauMvquItJXchVA",
  authDomain: "soniexchange-eedf6.firebaseapp.com",
  projectId: "soniexchange-eedf6",
  storageBucket: "soniexchange-eedf6.firebasestorage.app",
  messagingSenderId: "885491339460",
  appId: "1:885491339460:web:611843ab509f023a397991"
};

// Initialize Firebase App & Firestore
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
console.log("Firebase connected successfully via Config!");

// ==========================================
// MIDDLEWARE & CONFIGURATION
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'soniexchange_secure_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// ==========================================
// AUTHENTICATION & API ROUTES
// ==========================================

// Master Admin Seeding Route
app.post('/api/init-admin', async (req, res) => {
  try {
    const adminRef = doc(db, 'users', 'Soniexchange');
    const docSnap = await getDoc(adminRef);
    
    if (!docSnap.exists()) {
      const hashedPassword = await bcrypt.hash('Lyy@5656', 10);
      await setDoc(adminRef, {
        username: 'Soniexchange',
        password: hashedPassword,
        role: 'Admin',
        credits: 1000000,
        transactionPassword: '745398',
        isFirstLogin: false,
        createdAt: new Date().toISOString()
      });
      return res.json({ success: true, message: 'Master admin created successfully!' });
    }
    res.json({ success: true, message: 'Master admin already exists.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userRef = doc(db, 'users', username);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }

    const userData = docSnap.data();
    const isMatch = await bcrypt.compare(password, userData.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }

    req.session.user = {
      username: userData.username,
      role: userData.role
    };

    res.json({ success: true, message: 'Login successful', role: userData.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error during login' });
  }
});

// Logout Route
app.get('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Fallback Route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==========================================
// SERVER LISTEN
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
