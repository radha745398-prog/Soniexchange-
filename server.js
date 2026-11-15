const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { db } = require('./config/firebase');
const { initTelegramBot } = require('./services/telegramBot');
const setupAuthRoutes = require('./routes/authRoutes');
const setupAdminRoutes = require('./routes/adminRoutes');
const setupApiRoutes = require('./routes/apiRoutes');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'soniexchange_secure_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Initialize Telegram Bot Instance
let botInstance = null;
const getBotInstance = () => {
  if (!botInstance) {
    botInstance = initTelegramBot(db);
  }
  return botInstance;
};
getBotInstance();

// ==========================================
// 1. ADMIN SWITCH ROUTE (Smart Role Check & Client Domain Redirect)
// ==========================================
app.get('/switch-to-client', (req, res) => {
    const targetUser = req.query.user || 'Client';
    const accountType = (req.query.type || 'Client').toLowerCase();

    // Agar account type Master ya Super Master hai, toh unhe admin panel ke andar hi rakho
    if (accountType.includes('master') || accountType.includes('super') || accountType.includes('admin')) {
        return res.redirect(`/admin-dashboard?user=${encodeURIComponent(targetUser)}`);
    }

    // Aur agar strict Client hai, toh seedha uske alag domain par VIP bypass token ke sath bhej do
    const masterAdminKey = 'soni_super_admin_secret_key_2026';
    res.redirect(`https://soniexchange-client.onrender.com/dashboard?user=${encodeURIComponent(targetUser)}&admin_token=${masterAdminKey}`);
});

// Mount Modular Routes
app.use('/', setupAuthRoutes(db, getBotInstance));
app.use('/', setupAdminRoutes(db));
app.use('/', setupApiRoutes(db));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Soniexchange modular server running smoothly on port ${PORT}`));
