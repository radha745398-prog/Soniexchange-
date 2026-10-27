const express = require('express');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } = require('firebase/firestore');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// ================= CONFIG & PROVIDER URLS =================
const PROVIDER_BASE_URL = process.env.PROVIDER_BASE_URL || 'http://103.189.172.254:8887';
const WIDGET_BASE_URL = process.env.WIDGET_BASE_URL || 'http://78.56.98.25:9002';

// TELEGRAM BOT CONFIGURATION
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8995592600:AAHO69c3MT29W-sJP3_8kpzDQ2NAC2cc2Zg';
let bot = null;
try {
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_BOT_TOKEN !== 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
    bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
    
    bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text ? msg.text.trim() : '';

      if (text.startsWith('/start')) {
        bot.sendMessage(chatId, "Welcome to Soniexchange Security Bot! To connect your account, type /connect YOUR_CODE");
      } else if (text.startsWith('/connect')) {
        const parts = text.split(' ');
        if (parts.length < 2) {
          bot.sendMessage(chatId, "Please provide your connection code e.g. /connect 5DAB79F3");
          return;
        }
        const connCode = parts[1].toUpperCase();

        try {
          const q = query(collection(db, "users"), where("telegramCode", "==", connCode));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            bot.sendMessage(chatId, "Invalid or expired connection code! Please generate a new code from your website secure auth settings.");
          } else {
            let targetDocId = null;
            querySnapshot.forEach((d) => { targetDocId = d.id; });

            if (targetDocId) {
              const userRef = doc(db, 'users', targetDocId);
              await updateDoc(userRef, {
                telegramChatId: chatId.toString(),
                telegramEnabled: true,
                telegramCode: null
              });
              bot.sendMessage(chatId, `Success! Your account (${targetDocId}) is now successfully linked with Telegram. 2FA is enabled.`);
            }
          }
        } catch (err) {
          console.error("Telegram connection error:", err);
          bot.sendMessage(chatId, "An error occurred while linking your account. Please try again.");
        }
      }
    });
  }
} catch (e) {
  console.log("Telegram Bot initialization notice:", e.message);
}

// Firebase Config
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

app.use(session({
  secret: 'soniexchange_secure_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

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

// ================= TOP HEADER BAR & SIDEBAR FUNCTION =================
function getHeaderAndSidebar(loggedInUser, userRole) {
    return `
        <header class="bg-[#0077b6] text-white px-3 py-1 flex items-center justify-between text-[11px] whitespace-nowrap relative shadow-sm" style="z-index: 50; min-height: 38px;">
            <div class="flex items-center space-x-2">
                <a href="/soni-view?username=${encodeURIComponent(loggedInUser)}" class="font-bold text-white text-[12px] pr-1 cursor-pointer hover:text-gray-200">Soni</a>
                <button type="button" id="sidebarToggleBtn" class="text-white hover:bg-black/20 px-1 py-0.5 rounded focus:outline-none cursor-pointer">
                    <i class="fa-solid fa-bars text-xs pointer-events-none"></i>
                </button>
                <nav class="flex items-center space-x-2 font-normal text-[11px]">
                    <a href="/users?username=${encodeURIComponent(loggedInUser)}" class="hover:underline py-0.5 px-1 font-semibold">List of Clients</a>
                    <a href="#" class="hover:underline py-0.5 px-1">Assign Agent</a>
                    <a href="#" class="hover:underline py-0.5 px-1">Market Analysis</a>
                    <a href="#" class="hover:underline py-0.5 px-1">Live Market ▾</a>
                </nav>
            </div>

            <div class="flex items-center space-x-2 ml-4 relative">
                <div class="relative inline-block text-left" id="userMenuDropdown">
                    <button type="button" id="userMenuBtn" class="font-normal text-white text-[11px] hover:text-gray-200 focus:outline-none flex items-center space-x-1 cursor-pointer">
                        <span>${loggedInUser} ▾</span>
                    </button>
                    <div id="userMenuContent" class="hidden absolute right-0 mt-1 w-44 bg-[#1e3a4c] text-white rounded-xs shadow-xl border border-gray-600 py-1 text-[11px] z-50">
                        <a href="/admin/secureauth?username=${encodeURIComponent(loggedInUser)}" class="block px-3 py-1.5 hover:bg-[#2b4c63] border-b border-gray-600/50">Secure Auth Verification</a>
                        <a href="/change-password?username=${encodeURIComponent(loggedInUser)}" class="block px-3 py-1.5 hover:bg-[#2b4c63] border-b border-gray-600/50">Change Password</a>
                        <a href="/logout" class="block px-3 py-1.5 hover:bg-red-600 font-semibold">Logout</a>
                    </div>
                </div>
                <a href="/logout" class="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded text-[10px] font-bold">Logout</a>
            </div>
        </header>

        <aside id="sportsSidebar" class="w-64 bg-white text-gray-800 flex flex-col fixed inset-y-0 left-0 transform -translate-x-full transition-transform duration-300 ease-in-out shadow-2xl border-r" style="z-index: 999999;">
            <div class="p-3 bg-[#0077b6] text-white flex justify-between items-center">
                <span class="font-bold text-sm">Sports Menu</span>
                <button type="button" id="sidebarCloseBtn" class="text-white cursor-pointer"><i class="fa-solid fa-xmark text-base"></i></button>
            </div>
            <div class="flex-1 overflow-y-auto p-2 space-y-1 text-[11px] font-semibold text-gray-700">
                <div class="py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b">Cricket</div>
                <div class="py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b">Football</div>
                <div class="py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b">Tennis</div>
            </div>
        </aside>
        <div id="sidebarOverlay" class="fixed inset-0 bg-black/50 hidden" style="z-index: 999998;"></div>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const toggleBtn = document.getElementById('sidebarToggleBtn');
                const closeBtn = document.getElementById('sidebarCloseBtn');
                const sidebar = document.getElementById('sportsSidebar');
                const overlay = document.getElementById('sidebarOverlay');
                if (toggleBtn) toggleBtn.onclick = (e) => { e.stopPropagation(); sidebar.classList.remove('-translate-x-full'); overlay.classList.remove('hidden'); };
                if (closeBtn) closeBtn.onclick = (e) => { e.stopPropagation(); sidebar.classList.add('-translate-x-full'); overlay.classList.add('hidden'); };
                if (overlay) overlay.onclick = () => { sidebar.classList.add('-translate-x-full'); overlay.classList.add('hidden'); };
                
                const userBtn = document.getElementById('userMenuBtn');
                const userContent = document.getElementById('userMenuContent');
                if (userBtn && userContent) {
                    userBtn.onclick = (e) => { e.stopPropagation(); userContent.classList.toggle('hidden'); };
                }
            });
        </script>
    `;
}

// ================= MODALS & SCRIPTS =================
function getModalsHTML(loggedInUser) {
    return `
        <div id="adminBalanceModal" class="fixed inset-0 bg-black/50 hidden items-start justify-center pt-16 z-50">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-sm mx-3 overflow-hidden text-gray-800 border">
                <div class="bg-[#0077b6] px-4 py-2 flex justify-between items-center text-white">
                    <span class="font-bold text-xs">Update My Admin Balance</span>
                    <button type="button" onclick="closeAdminBalanceModal()" class="cursor-pointer">✕</button>
                </div>
                <form action="/api/admin/update-balance" method="POST" class="p-4 space-y-3 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <div><label class="block font-semibold mb-1">New Balance</label><input type="number" name="newBalance" required class="w-full border p-1.5 rounded"></div>
                    <div><label class="block font-semibold mb-1">Transaction Password</label><input type="password" name="txnPassword" required class="w-full border p-1.5 rounded"></div>
                    <div class="flex justify-end space-x-2 pt-2"><button type="submit" class="bg-[#0099db] text-white px-3 py-1 rounded">Update</button></div>
                </form>
            </div>
        </div>
    `;
}

function getModalScriptsJS() {
    return `
        <script>
            function openAdminBalanceModal() { document.getElementById('adminBalanceModal').classList.remove('hidden'); document.getElementById('adminBalanceModal').classList.add('flex'); }
            function closeAdminBalanceModal() { document.getElementById('adminBalanceModal').classList.remove('flex'); document.getElementById('adminBalanceModal').classList.add('hidden'); }
        </script>
    `;
}

// ================= CLIENT INTERFACE (PROVIDER INTEGRATED) =================
function renderClientInterface(username, points, exposure) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Soniexchange - Live Exchange</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            body { font-family: Arial, sans-serif; background-color: #0d1e2b; color: #ffffff; margin: 0; }
        </style>
    </head>
    <body class="text-xs">
        <header class="bg-[#1f364a] text-white px-3 py-1.5 flex justify-between items-center border-b border-gray-700">
            <div class="flex items-center space-x-3">
                <i class="fa-solid fa-bars text-sm cursor-pointer"></i>
                <span class="font-italic italic font-bold text-base text-white tracking-wide">Soniexchange</span>
            </div>
            <div class="flex items-center space-x-3 text-[11px]">
                <div class="text-right">
                    <div>Balance: <span class="font-bold text-green-400">${Number(points || 0).toLocaleString()}</span></div>
                    <div class="text-[10px] text-gray-300">Exp: <span class="text-red-400">${Number(exposure || 0).toLocaleString()}</span> | ${username} <a href="/logout" class="text-red-400 ml-1 hover:underline">(Logout)</a></div>
                </div>
            </div>
        </header>

        <div class="p-3 space-y-2">
            <div class="bg-[#162a3a] rounded-xs border border-gray-800 p-2.5 flex justify-between items-center">
                <span class="text-[11px] text-cyan-300 font-bold"><i class="fa-solid fa-bolt mr-1"></i> LIVE CRICKET MATCHES (PROVIDER DATA)</span>
                <button onclick="fetchClientLiveMatches()" class="bg-[#0077b6] text-white px-2 py-1 rounded text-[10px] font-bold cursor-pointer">Refresh Feed</button>
            </div>

            <div id="clientMatchesContainer" class="space-y-1.5">
                <div class="bg-[#162a3a] rounded-xs border border-gray-800 p-4 text-[11px] text-center text-gray-400">
                    Loading live matches from provider API...
                </div>
            </div>
        </div>

        <script>
            function fetchClientLiveMatches() {
                var container = document.getElementById('clientMatchesContainer');
                container.innerHTML = '<div class="bg-[#162a3a] rounded-xs border border-gray-800 p-3 text-[11px] text-gray-400 text-center">Fetching series and match data...</div>';

                fetch('/api/provider/get-series?sportId=4')
                    .then(function(res) { return res.json(); })
                    .then(function(result) {
                        var seriesList = result.data || result;
                        if (!seriesList || seriesList.length === 0) {
                            container.innerHTML = '<div class="bg-[#162a3a] rounded-xs border border-gray-800 p-3 text-[11px] text-gray-400 text-center">No active matches found right now.</div>';
                            return;
                        }

                        var htmlContent = '';
                        for (var i = 0; i < seriesList.length; i++) {
                            var series = seriesList[i];
                            var compName = series.competition ? series.competition.name : 'Tournament';
                            var matches = series.match || [];

                            for (var j = 0; j < matches.length; j++) {
                                var m = matches[j];
                                var matchTitle = m.name || (m.event ? m.event.name : 'Match Event');
                                var matchId = m.matchId || (m.event ? m.event.id : '');

                                htmlContent += \`
                                  <div onclick="alert('Opening Match ID: \${matchId}')" class="bg-[#162a3a] hover:bg-[#1f3a50] rounded-xs border border-gray-800 p-2.5 text-[11px] flex justify-between items-center text-white cursor-pointer transition shadow-sm">
                                    <div>
                                      <div class="font-bold text-yellow-400 text-xs">\${matchTitle}</div>
                                      <div class="text-[10px] text-gray-300 mt-0.5">\${compName} (ID: \${matchId})</div>
                                    </div>
                                    <div class="flex items-center space-x-1">
                                        <span class="bg-red-600 animate-pulse text-white text-[9px] px-1.5 py-0.5 rounded font-bold">LIVE ●</span>
                                    </div>
                                  </div>
                                \`;
                            }
                        }

                        container.innerHTML = htmlContent || '<div class="bg-[#162a3a] rounded-xs border border-gray-800 p-3 text-[11px] text-gray-400 text-center">No matches scheduled.</div>';
                    })
                    .catch(function(err) {
                        container.innerHTML = '<div class="bg-[#162a3a] rounded-xs border border-gray-800 p-3 text-[11px] text-red-400 text-center">Failed to load feed data. Check IP whitelisting.</div>';
                    });
            }

            document.addEventListener('DOMContentLoaded', function() {
                fetchClientLiveMatches();
            });
        </script>
    </body>
    </html>
    `;
}

// ================= AUTHENTICATION ROUTES =================
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Sign In - Soniexchange</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-[#116491] min-h-screen flex items-center justify-center p-6 text-white font-sans">
            <div class="bg-white text-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-sm">
                <h2 class="text-center text-sm font-semibold mb-6">Sign In</h2>
                <form action="/login-process" method="POST" class="space-y-4">
                    <input type="text" name="username" required placeholder="Username" class="w-full border rounded p-2.5 text-xs">
                    <input type="password" name="password" required placeholder="Password" class="w-full border rounded p-2.5 text-xs">
                    <button type="submit" class="w-full bg-[#0088cc] text-white font-bold py-2.5 rounded text-xs cursor-pointer">Login →</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.post('/login-process', async (req, res) => {
    let { username, password } = req.body;
    username = username ? username.trim() : '';
    password = password ? password.trim() : '';

    try {
        const userRef = doc(db, 'users', username);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) return res.redirect('/');
        const user = docSnap.data();

        if (user.password !== password) return res.redirect('/');

        req.session.loggedInUser = user.username;
        req.session.userRole = user.role;

        res.redirect(`/dashboard?username=${encodeURIComponent(user.username)}`);
    } catch(err) {
        res.redirect('/');
    }
});

app.get('/dashboard', async (req, res) => {
    const loggedInUser = req.query.username || 'Soniexchange';
    try {
        const userRef = doc(db, 'users', loggedInUser);
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) return res.redirect('/');
        const user = docSnap.data();

        if (user.role === 'Client') {
            return res.send(renderClientInterface(user.username, user.points, user.exposure));
        }

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Dashboard - Soniexchange</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            </head>
            <body class="bg-gray-100 min-h-screen flex flex-col text-xs">
                ${getHeaderAndSidebar(loggedInUser, user.role)}
                <main class="flex-1 p-4 max-w-7xl mx-auto w-full">
                    <div class="bg-white p-4 rounded shadow border">
                        <h2 class="font-bold text-sm text-[#0077b6] mb-2">Welcome Master Admin: ${loggedInUser}</h2>
                        <p class="text-gray-600">Use top menu to navigate client list and management tools.</p>
                    </div>
                </main>
                ${getModalsHTML(loggedInUser)}
                ${getModalScriptsJS()}
            </body>
            </html>
        `);
    } catch(err) {
        res.redirect('/');
    }
});

// ================= ACCOUNT LIST & MANAGEMENT ROUTE (/users) =================
app.get('/users', async (req, res) => {
    const loggedInUser = req.query.username || 'Soniexchange';
    try {
        const userRef = doc(db, 'users', loggedInUser);
        const docSnap = await getDoc(userRef);
        const currentUser = docSnap.exists() ? docSnap.data() : { role: 'ADMIN', points: 100000000 };

        let usersList = [];
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((docItem) => {
            if (docItem.id !== 'Soniexchange') {
                usersList.push({ id: docItem.id, ...docItem.data() });
            }
        });

        let tableRows = usersList.length === 0 ? `
            <tr><td colspan="8" class="text-center p-4 text-gray-500">No clients found.</td></tr>
        ` : usersList.map(u => `
            <tr class="border-b bg-white text-[11px] hover:bg-gray-50">
                <td class="p-2 border-r font-bold">${u.username}</td>
                <td class="p-2 border-r text-right">${Number(u.creditRef || 0).toLocaleString()}</td>
                <td class="p-2 border-r text-center">${u.userActive !== false ? '✓' : '✕'}</td>
                <td class="p-2 border-r text-center">${u.betActive !== false ? '✓' : '✕'}</td>
                <td class="p-2 border-r text-right">${Number(u.exposureLimit || 0).toLocaleString()}</td>
                <td class="p-2 border-r text-center">${u.defaultPct || 0}</td>
                <td class="p-2 border-r text-center">${u.role || 'User'}</td>
                <td class="p-1.5 text-center">Active</td>
            </tr>
        `).join('');

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Account List</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            </head>
            <body class="bg-gray-100 min-h-screen flex flex-col text-xs">
                ${getHeaderAndSidebar(loggedInUser, currentUser.role)}
                <main class="flex-1 p-3 max-w-7xl mx-auto w-full">
                    <h2 class="text-base font-bold text-gray-800 mb-3">Account List</h2>
                    <div class="bg-white border rounded shadow-xs overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-gray-100 text-gray-700 text-[11px] border-b-2 font-bold">
                                    <th class="p-2 border-r">User Name</th>
                                    <th class="p-2 border-r text-right">CR</th>
                                    <th class="p-2 border-r text-center">U st</th>
                                    <th class="p-2 border-r text-center">B st</th>
                                    <th class="p-2 border-r text-right">Exposure Limit</th>
                                    <th class="p-2 border-r text-center">Default (%)</th>
                                    <th class="p-2 border-r text-center">Account Type</th>
                                    <th class="p-2 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>${tableRows}</tbody>
                        </table>
                    </div>
                </main>
                ${getModalsHTML(loggedInUser)}
                ${getModalScriptsJS()}
            </body>
            </html>
        `);
    } catch(err) {
        res.redirect('/');
    }
});

// ================= PROVIDER API PROXY ENDPOINTS =================
app.get('/api/provider/get-series', async (req, res) => {
    try {
        const sportId = req.query.sportId || '4';
        const response = await axios.get(`${PROVIDER_BASE_URL}/event/get-series-redis/${sportId}`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/provider/markets', async (req, res) => {
    try {
        const eventId = req.query.eventId;
        const response = await axios.get(`${PROVIDER_BASE_URL}/markets/by-provider?eventId=${encodeURIComponent(eventId)}&sportId=4&providerId=3`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/provider/odds', async (req, res) => {
    try {
        const marketId = req.query.marketId;
        const response = await axios.get(`${PROVIDER_BASE_URL}/odds/getMarketOdds?providerId=3&marketId=${encodeURIComponent(marketId)}`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/provider/widget/:eventId', async (req, res) => {
    try {
        const response = await axios.get(`${WIDGET_BASE_URL}/event/widget/${req.params.eventId}`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ success: false, message: "Widget not found" });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`All-In-One Server running on port ${PORT}`));
