const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();

// ==========================================
// FIREBASE INITIALIZATION VIA RENDER SECRET FILE
// ==========================================
try {
  const serviceAccount = require('/etc/secrets/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Firebase connected successfully via Secret File!");
} catch (error) {
  console.error("Firebase initialization error:", error);
}

const db = admin.firestore();

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
    const adminRef = db.collection('users').doc('Soniexchange');
    const doc = await adminRef.get();
    
    if (!doc.exists) {
      const hashedPassword = await bcrypt.hash('Lyy@5656', 10);
      await adminRef.set({
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
    const userRef = db.collection('users').doc(username);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }

    const userData = doc.data();
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
