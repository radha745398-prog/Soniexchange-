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
// 1. ADMIN SWITCH TO CLIENT ROUTE (Fixing the redirect)
// ==========================================
app.get('/switch-to-client', (req, res) => {
    const targetUser = req.query.user || 'Client';
    // Client ke liye seedha client game dashboard par bhejenge
    res.redirect(`/client-portal-dashboard?user=${encodeURIComponent(targetUser)}`);
});

// ==========================================
// 2. CLIENT PORTAL DASHBOARD (Game/Betting UI for clients)
// ==========================================
app.get('/client-portal-dashboard', (req, res) => {
    const username = req.query.user || 'Client';
    
    // Yahan client ka asli game/betting dashboard render hoga
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Client Dashboard - Soniexchange</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        </head>
        <body class="bg-gray-900 text-white min-h-screen p-6">
            <div class="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                <div class="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
                    <h1 class="text-xl font-bold text-green-400">SONIEXCHANGE - Client Dashboard</h1>
                    <span class="bg-blue-600 px-3 py-1 rounded text-sm font-semibold">User: ${username}</span>
                </div>
                <div class="space-y-4">
                    <p class="text-gray-300">Aap successfully admin panel se is client ID par switch ho chuke hain (Bina password ke).</p>
                    <div class="bg-gray-900 p-4 rounded border border-gray-700">
                        <h2 class="font-bold text-yellow-400 mb-2">Live Matches & Odds</h2>
                        <p class="text-xs text-gray-400">Yahan aapka live cricket aur betting interface load hoga.</p>
                    </div>
                    <a href="javascript:window.close();" class="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold">Close Window / Go Back</a>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Mount Modular Routes
app.use('/', setupAuthRoutes(db, getBotInstance));
app.use('/', setupAdminRoutes(db));
app.use('/', setupApiRoutes(db));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Soniexchange modular server running smoothly on port ${PORT}`));
