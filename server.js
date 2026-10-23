const express = require('express');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } = require('firebase/firestore');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

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

// ================= SPORTBEX TRIAL API PROXY ROUTES =================
const axios = require('axios');
const SPORTBEX_API_KEY = 'ASaywLpUmIL2wf2wstI9qtaA7eyN9h2nBJlAj93Y';
const SPORTBEX_BASE_URL = 'https://trial-api.sportbex.com/api';

const getSportbexHeaders = () => ({
  'sportbex-api-key': SPORTBEX_API_KEY,
  'Content-Type': 'application/json'
});

app.get('/api/sportbex/competitions/:sportId', async (req, res) => {
  try {
    const response = await axios.get(`${SPORTBEX_BASE_URL}/betfair/competition-list/${req.params.sportId}`, { headers: getSportbexHeaders() });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch competitions' });
  }
});

app.get('/api/sportbex/events/:competitionId', async (req, res) => {
  try {
    const response = await axios.get(`${SPORTBEX_BASE_URL}/betfair/event-list/${req.params.competitionId}`, { headers: getSportbexHeaders() });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.get('/api/sportbex/odds/:marketId', async (req, res) => {
  try {
    const response = await axios.get(`${SPORTBEX_BASE_URL}/betfair/all-odds-v3/${req.params.marketId}`, { headers: getSportbexHeaders() });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch odds' });
  }
});

app.get('/api/sportbex/fancy/:eventId', async (req, res) => {
  try {
    const response = await axios.get(`${SPORTBEX_BASE_URL}/betfair/fancy-odds/${req.params.eventId}`, { headers: getSportbexHeaders() });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fancy odds' });
  }
});
// ====================================================================

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
                    <a href="#" class="hover:underline py-0.5 px-1">Live Virtual Market ▾</a>
                    <a href="#" class="hover:underline py-0.5 px-1">Reports ▾</a>
                    <a href="#" class="hover:underline py-0.5 px-1">Multi Login</a>
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

                <div class="relative ml-1">
                    <form onsubmit="return false;" class="flex items-center">
                        <input type="text" id="headerSearchInput" placeholder="Search..." autocomplete="off" oninput="handleSearchInput(this.value)" class="text-black bg-white px-2 py-0.5 pr-6 rounded-xs text-[11px] w-28 focus:outline-none border border-gray-300">
                        <span class="absolute right-1.5 text-gray-600 text-[11px] pointer-events-none">
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </span>
                    </form>
                    <div id="searchResultsDropdown" class="hidden absolute left-0 right-0 top-full mt-0.5 bg-[#4f75e2] text-white rounded-xs shadow-xl z-50 max-h-48 overflow-y-auto text-[11px]"></div>
                </div>
            </div>
        </header>

        <aside id="sportsSidebar" class="w-64 bg-white text-gray-800 flex flex-col fixed inset-y-0 left-0 transform -translate-x-full transition-transform duration-300 ease-in-out shadow-2xl border-r" style="z-index: 999999;">
            <div class="p-3 bg-[#0077b6] text-white flex justify-between items-center">
                <span class="font-bold text-sm">Sports</span>
                <button type="button" id="sidebarCloseBtn" class="text-white hover:text-gray-200 cursor-pointer"><i class="fa-solid fa-xmark text-base pointer-events-none"></i></button>
            </div>
            <div class="flex-1 overflow-y-auto p-2 space-y-1 text-[11px] font-semibold text-gray-700">
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Cricket</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Football</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Tennis</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Table Tennis</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Horse Racing</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Greyhound Racing</span> <span>+</span></div>
            </div>
        </aside>

        <div id="sidebarOverlay" class="fixed inset-0 bg-black/50 hidden" style="z-index: 999998;"></div>

        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const toggleBtn = document.getElementById('sidebarToggleBtn');
                const closeBtn = document.getElementById('sidebarCloseBtn');
                const sidebar = document.getElementById('sportsSidebar');
                const overlay = document.getElementById('sidebarOverlay');

                function openSidebar(e) {
                    if (e) e.stopPropagation();
                    if (sidebar) sidebar.classList.remove('-translate-x-full');
                    if (overlay) overlay.classList.remove('hidden');
                }

                function closeSidebar(e) {
                    if (e) e.stopPropagation();
                    if (sidebar) sidebar.classList.add('-translate-x-full');
                    if (overlay) overlay.classList.add('hidden');
                }

                if (toggleBtn) toggleBtn.onclick = openSidebar;
                if (closeBtn) closeBtn.onclick = closeSidebar;
                if (overlay) overlay.onclick = closeSidebar;

                const userBtn = document.getElementById('userMenuBtn');
                const userContent = document.getElementById('userMenuContent');

                if (userBtn && userContent) {
                    userBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        userContent.classList.toggle('hidden');
                    });

                    document.addEventListener('click', function(e) {
                        if (!userContent.contains(e.target) && !userBtn.contains(e.target)) {
                            userContent.classList.add('hidden');
                        }
                    });
                }
            });

            let searchTimeout = null;
            function handleSearchInput(val) {
                clearTimeout(searchTimeout);
                const dropdown = document.getElementById('searchResultsDropdown');
                if (!val || val.trim().length === 0) {
                    dropdown.classList.add('hidden');
                    dropdown.innerHTML = '';
                    return;
                }

                searchTimeout = setTimeout(async () => {
                    try {
                        const res = await fetch('/api/search-users?q=' + encodeURIComponent(val) + '&loggedInUser=${encodeURIComponent(loggedInUser)}');
                        const data = await res.json();
                        
                        if (data && data.length > 0) {
                            dropdown.innerHTML = data.map(u => \`
                                <div onclick="openMarketAnalysisModal('\${u.username}')" class="px-2.5 py-1.5 hover:bg-[#3b5cb8] cursor-pointer font-semibold border-b border-white/10 last:border-b-0">
                                    \${u.username}
                                </div>
                            \`).join('');
                            dropdown.classList.remove('hidden');
                        } else {
                            dropdown.innerHTML = '<div class="px-2 py-1.5 text-white/80 text-[10px]">No user found</div>';
                            dropdown.classList.remove('hidden');
                        }
                    } catch (err) {
                        console.error('Search error:', err);
                    }
                }, 200);
            }

            document.addEventListener('click', function(e) {
                const searchInput = document.getElementById('headerSearchInput');
                const dropdown = document.getElementById('searchResultsDropdown');
                if (searchInput && dropdown && !searchInput.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.add('hidden');
                }
            });
        </script>
    `;
}

function getModalsHTML(loggedInUser) {
    return `
        <div id="marketAnalysisModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-12 z-50" onclick="handleOverlayClick(event, 'marketAnalysisModal')">
            <div class="bg-white rounded-xs shadow-2xl w-full max-w-2xl mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-[#2b3e50] px-3 py-2 flex justify-between items-center text-white">
                    <span class="font-bold text-xs">Market Analysis</span>
                    <button type="button" onclick="closeMarketAnalysisModal()" class="w-5 h-5 bg-[#00a8e8] text-white flex items-center justify-center text-xs hover:bg-[#008bc2] transition cursor-pointer">✕</button>
                </div>
                <div class="p-3 bg-gray-100 text-[11px]">
                    <div class="bg-white border p-2 space-y-1">
                        <div class="flex justify-between"><span class="text-gray-600">Username</span><span class="font-semibold" id="maUsername">-</span></div>
                        <div class="flex justify-between"><span class="text-gray-600">Account Type</span><span class="font-semibold" id="maRole">-</span></div>
                    </div>
                </div>
            </div>
        </div>

        <div id="depositModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'depositModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b">
                    <span class="font-bold text-gray-800 text-sm">Deposit</span>
                    <button type="button" onclick="closeDepositModal()" class="w-6 h-6 rounded-full bg-[#00a8e8] text-white flex items-center justify-center text-xs cursor-pointer">✕</button>
                </div>
                <form action="/api/deposit" method="POST" class="p-5 space-y-3.5 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalClientUsername">
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 text-[11px]">Amount</label>
                        <div class="col-span-8"><input type="number" name="amount" required placeholder="Amount" class="w-full border p-1.5 rounded-xs"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 text-[11px]">Transaction Password</label>
                        <div class="col-span-8"><input type="password" name="txnPassword" required placeholder="Transaction Password" class="w-full border p-1.5 rounded-xs"></div>
                    </div>
                    <div class="flex justify-end space-x-2 pt-3">
                        <button type="submit" class="bg-[#0099db] text-white px-3.5 py-1.5 rounded-xs font-bold cursor-pointer">Submit</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="withdrawModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'withdrawModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b">
                    <span class="font-bold text-gray-800 text-sm">Withdraw</span>
                    <button type="button" onclick="closeWithdrawModal()" class="w-6 h-6 rounded-full bg-[#00a8e8] text-white flex items-center justify-center text-xs cursor-pointer">✕</button>
                </div>
                <form action="/api/withdraw" method="POST" class="p-5 space-y-3.5 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalWithdrawClientUsername">
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 text-[11px]">Amount</label>
                        <div class="col-span-8"><input type="number" name="amount" required placeholder="Amount" class="w-full border p-1.5 rounded-xs"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 text-[11px]">Transaction Password</label>
                        <div class="col-span-8"><input type="password" name="txnPassword" required placeholder="Transaction Password" class="w-full border p-1.5 rounded-xs"></div>
                    </div>
                    <div class="flex justify-end space-x-2 pt-3">
                        <button type="submit" class="bg-[#0099db] text-white px-3.5 py-1.5 rounded-xs font-bold cursor-pointer">Submit</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="exposureModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'exposureModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b">
                    <span class="font-bold text-gray-800 text-sm">Exposure Limit</span>
                    <button type="button" onclick="closeExposureModal()" class="w-6 h-6 rounded-full bg-[#00a8e8] text-white flex items-center justify-center text-xs cursor-pointer">✕</button>
                </div>
                <form action="/api/exposure-limit" method="POST" class="p-5 space-y-3.5 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalExposureClientUsername">
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 text-[11px]">New Limit</label>
                        <div class="col-span-8"><input type="number" name="newLimit" required class="w-full border p-1.5 rounded-xs"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 text-[11px]">Transaction Password</label>
                        <div class="col-span-8"><input type="password" name="txnPassword" required class="w-full border p-1.5 rounded-xs"></div>
                    </div>
                    <div class="flex justify-end space-x-2 pt-3">
                        <button type="submit" class="bg-[#0099db] text-white px-3.5 py-1.5 rounded-xs font-bold cursor-pointer">Submit</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="creditModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'creditModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b">
                    <span class="font-bold text-gray-800 text-sm">Credit</span>
                    <button type="button" onclick="closeCreditModal()" class="w-6 h-6 rounded-full bg-[#00a8e8] text-white flex items-center justify-center text-xs cursor-pointer">✕</button>
                </div>
                <form action="/api/credit-update" method="POST" class="p-5 space-y-3.5 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalCreditClientUsername">
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 text-[11px]">New Credit</label>
                        <div class="col-span-8"><input type="number" name="newCredit" required class="w-full border p-1.5 rounded-xs"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 text-[11px]">Transaction Password</label>
                        <div class="col-span-8"><input type="password" name="txnPassword" required class="w-full border p-1.5 rounded-xs"></div>
                    </div>
                    <div class="flex justify-end space-x-2 pt-3">
                        <button type="submit" class="bg-[#0099db] text-white px-3.5 py-1.5 rounded-xs font-bold cursor-pointer">Submit</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="passwordModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'passwordModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b">
                    <span class="font-bold text-gray-800 text-sm">Password</span>
                    <button type="button" onclick="closePasswordModal()" class="w-6 h-6 rounded-full bg-[#00a8e8] text-white flex items-center justify-center text-xs cursor-pointer">✕</button>
                </div>
                <form action="/api/client-password-update" method="POST" class="p-5 space-y-3.5 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalPasswordClientUsername">
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 text-[11px]">New Password</label>
                        <div class="col-span-8"><input type="password" name="newPassword" required class="w-full border p-1.5 rounded-xs"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 text-[11px]">Confirm Password</label>
                        <div class="col-span-8"><input type="password" name="confirmPassword" required class="w-full border p-1.5 rounded-xs"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 text-[11px]">Transaction Password</label>
                        <div class="col-span-8"><input type="password" name="txnPassword" required class="w-full border p-1.5 rounded-xs"></div>
                    </div>
                    <div class="flex justify-end space-x-2 pt-3">
                        <button type="submit" class="bg-[#0099db] text-white px-3.5 py-1.5 rounded-xs font-bold cursor-pointer">Submit</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="statusModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'statusModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b">
                    <span class="font-bold text-gray-800 text-sm">Change Status</span>
                    <button type="button" onclick="closeStatusModal()" class="w-6 h-6 rounded-full bg-[#00a8e8] text-white flex items-center justify-center text-xs cursor-pointer">✕</button>
                </div>
                <form action="/api/change-status" method="POST" class="p-5 space-y-4 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalStatusClientUsername">
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 text-[11px]">Transaction Password</label>
                        <div class="col-span-8"><input type="password" name="txnPassword" required class="w-full border p-1.5 rounded-xs"></div>
                    </div>
                    <div class="flex justify-end space-x-2 pt-3">
                        <button type="submit" class="bg-[#0099db] text-white px-3.5 py-1.5 rounded-xs font-bold cursor-pointer">Submit</button>
                    </div>
                </form>
            </div>
        </div>

        ${loggedInUser === 'Soniexchange' ? `
        <div id="adminBalanceModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'adminBalanceModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-sm mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-[#0077b6] px-4 py-2.5 flex justify-between items-center text-white">
                    <span class="font-bold text-xs">Update My Admin Balance</span>
                    <button type="button" onclick="closeAdminBalanceModal()" class="w-5 h-5 rounded-full bg-[#00a8e8] text-white flex items-center justify-center text-xs cursor-pointer">✕</button>
                </div>
                <form action="/api/admin/update-balance" method="POST" class="p-4 space-y-3 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <div>
                        <label class="block font-semibold text-gray-700 mb-1 text-[11px]">New Balance Amount</label>
                        <input type="number" name="newBalance" required placeholder="e.g. 200000" class="w-full border p-1.5 rounded-xs text-xs">
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-700 mb-1 text-[11px]">Transaction Password</label>
                        <input type="password" name="txnPassword" required placeholder="Transaction Password" class="w-full border p-1.5 rounded-xs text-xs">
                    </div>
                    <div class="flex justify-end space-x-2 pt-2">
                        <button type="submit" class="bg-[#0099db] text-white px-3 py-1 rounded-xs font-bold text-[11px] cursor-pointer">Update Now</button>
                    </div>
                </form>
            </div>
        </div>
        ` : ''}
    `;
}

function getModalScriptsJS() {
    return `
        <script>
            function handleOverlayClick(event, modalId) {
                if (event.target.id === modalId) {
                    if (modalId === 'depositModal') closeDepositModal();
                    if (modalId === 'withdrawModal') closeWithdrawModal();
                    if (modalId === 'exposureModal') closeExposureModal();
                    if (modalId === 'creditModal') closeCreditModal();
                    if (modalId === 'passwordModal') closePasswordModal();
                    if (modalId === 'statusModal') closeStatusModal();
                    if (modalId === 'marketAnalysisModal') closeMarketAnalysisModal();
                    if (modalId === 'adminBalanceModal') closeAdminBalanceModal();
                }
            }
            function openAdminBalanceModal() { document.getElementById('adminBalanceModal')?.classList.remove('hidden'), document.getElementById('adminBalanceModal')?.classList.add('flex'); }
            function closeAdminBalanceModal() { document.getElementById('adminBalanceModal')?.classList.remove('flex'), document.getElementById('adminBalanceModal')?.classList.add('hidden'); }
            async function openMarketAnalysisModal(username) {
                document.getElementById('searchResultsDropdown')?.classList.add('hidden');
                try {
                    const res = await fetch('/api/user-detail?username=' + encodeURIComponent(username));
                    const data = await res.json();
                    if (data && data.success) {
                        document.getElementById('maUsername').textContent = data.user.username || '-';
                        document.getElementById('maRole').textContent = data.user.role || 'User';
                        document.getElementById('marketAnalysisModal')?.classList.remove('hidden');
                        document.getElementById('marketAnalysisModal')?.classList.add('flex');
                    }
                } catch(e) {}
            }
            function closeMarketAnalysisModal() { document.getElementById('marketAnalysisModal')?.classList.remove('flex'), document.getElementById('marketAnalysisModal')?.classList.add('hidden'); }
            function openDepositModal(clientName) { document.getElementById('modalClientUsername').value = clientName, document.getElementById('depositModal')?.classList.remove('hidden'), document.getElementById('depositModal')?.classList.add('flex'); }
            function closeDepositModal() { document.getElementById('depositModal')?.classList.remove('flex'), document.getElementById('depositModal')?.classList.add('hidden'); }
            function openWithdrawModal(clientName) { document.getElementById('modalWithdrawClientUsername').value = clientName, document.getElementById('withdrawModal')?.classList.remove('hidden'), document.getElementById('withdrawModal')?.classList.add('flex'); }
            function closeWithdrawModal() { document.getElementById('withdrawModal')?.classList.remove('flex'), document.getElementById('withdrawModal')?.classList.add('hidden'); }
            function openExposureModal(clientName) { document.getElementById('modalExposureClientUsername').value = clientName, document.getElementById('exposureModal')?.classList.remove('hidden'), document.getElementById('exposureModal')?.classList.add('flex'); }
            function closeExposureModal() { document.getElementById('exposureModal')?.classList.remove('flex'), document.getElementById('exposureModal')?.classList.add('hidden'); }
            function openCreditModal(clientName) { document.getElementById('modalCreditClientUsername').value = clientName, document.getElementById('creditModal')?.classList.remove('hidden'), document.getElementById('creditModal')?.classList.add('flex'); }
            function closeCreditModal() { document.getElementById('creditModal')?.classList.remove('flex'), document.getElementById('creditModal')?.classList.add('hidden'); }
            function openPasswordModal(clientName) { document.getElementById('modalPasswordClientUsername').value = clientName, document.getElementById('passwordModal')?.classList.remove('hidden'), document.getElementById('passwordModal')?.classList.add('flex'); }
            function closePasswordModal() { document.getElementById('passwordModal')?.classList.remove('flex'), document.getElementById('passwordModal')?.classList.add('hidden'); }
            function openStatusModal(clientName) { document.getElementById('modalStatusClientUsername').value = clientName, document.getElementById('statusModal')?.classList.remove('hidden'), document.getElementById('statusModal')?.classList.add('flex'); }
            function closeStatusModal() { document.getElementById('statusModal')?.classList.remove('flex'), document.getElementById('statusModal')?.classList.add('hidden'); }
            function toggleSummaryBanner() {
                const banner = document.getElementById('summaryBannerContent');
                const arrowIcon = document.getElementById('summaryArrowIcon');
                if (banner?.classList.contains('hidden')) {
                    banner.classList.remove('hidden');
                    arrowIcon.className = "fa-solid fa-chevron-up text-xs";
                } else {
                    banner?.classList.add('hidden');
                    if(arrowIcon) arrowIcon.className = "fa-solid fa-chevron-down text-xs";
                }
            }
            function filterTableBySearch() {
                const q = (document.getElementById('tableSearchInput')?.value || '').toLowerCase();
                document.querySelectorAll('#soniAccountTable tbody tr, #accountTable tbody tr').forEach(row => {
                    row.style.display = row.innerText.toLowerCase().includes(q) ? '' : 'none';
                });
            }
            function resetTableSearch() {
                const input = document.getElementById('tableSearchInput');
                if(input) input.value = '';
                filterTableBySearch();
            }
        </script>
    `;
}

app.get('/api/search-users', async (req, res) => {
    const q = (req.query.q || '').trim().toLowerCase();
    const loggedInUser = req.query.loggedInUser || 'Soniexchange';
    if (!q) return res.json([]);
    try {
        let usersList = [];
        if (loggedInUser === 'Soniexchange') {
            const snap = await getDocs(collection(db, "users"));
            snap.forEach(d => { if (d.id !== 'Soniexchange') usersList.push({ username: d.id, ...d.data() }); });
        } else {
            const snap = await getDocs(query(collection(db, "users"), where("createdBy", "==", loggedInUser)));
            snap.forEach(d => usersList.push({ username: d.id, ...d.data() }));
        }
        res.json(usersList.filter(u => u.username.toLowerCase().includes(q)));
    } catch(e) { res.json([]); }
});

app.get('/api/user-detail', async (req, res) => {
    const username = (req.query.username || '').trim();
    if (!username) return res.json({ success: false });
    try {
        const snap = await getDoc(doc(db, 'users', username));
        if (snap.exists()) return res.json({ success: true, user: snap.data() });
        res.json({ success: false });
    } catch(e) { res.json({ success: false }); }
});

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8"><title>Sign In</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-[#116491] min-h-screen flex flex-col items-center justify-center p-6 text-white font-sans">
            <div class="bg-white text-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-sm">
                <h2 class="text-center font-semibold mb-4">Sign In</h2>
                <form action="/login-process" method="POST" class="space-y-4">
                    <input type="text" name="username" required placeholder="Username" class="w-full border p-2.5 rounded text-xs">
                    <input type="password" name="password" required placeholder="Password" class="w-full border p-2.5 rounded text-xs">
                    <button type="submit" class="w-full bg-[#0088cc] text-white font-bold py-2.5 rounded text-xs">Login →</button>
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
        const docSnap = await getDoc(doc(db, 'users', username));
        if (!docSnap.exists()) return res.redirect('/');
        const user = docSnap.data();
        if (password !== user.password) return res.redirect('/');

        if (user.gauthEnabled || user.telegramEnabled) {
            return res.redirect(`/login/verify-otp?username=${encodeURIComponent(username)}`);
        }
        res.redirect(`/dashboard?username=${encodeURIComponent(username)}`);
    } catch(e) { res.redirect('/'); }
});

app.get('/dashboard', async (req, res) => {
    const loggedInUser = req.query.username || 'Soniexchange';
    try {
        const docSnap = await getDoc(doc(db, 'users', loggedInUser));
        const userData = docSnap.exists() ? docSnap.data() : { role: 'Client', points: 0 };
        const role = userData.role || 'Client';

        if (role === 'Client') {
            return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SoniExchange - Pro Betting Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .nav-sports::-webkit-scrollbar { display: none; }
        .nav-sports { -ms-overflow-style: none; scrollbar-width: none; }
        .casino-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
        @media(min-width: 768px) { .casino-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
    </style>
</head>
<body class="bg-gray-100 text-gray-900 pb-20">
    <div class="bg-[#1c2833] text-white px-3 py-2 flex justify-between items-center shadow-md sticky top-0 z-50">
        <span class="font-bold text-yellow-400 text-sm"><i class="fa-solid fa-bolt mr-1"></i> SONIEXCHANGE</span>
        <div class="flex items-center space-x-3 text-xs">
            <div class="bg-gray-800 px-2 py-1 rounded">Bal: ₹<span id="userBalanceDisplay" class="font-bold text-green-400">${Number(userData.points || 0).toLocaleString()}</span></div>
            <a href="/logout" class="bg-red-600 px-2.5 py-1 rounded font-bold">Logout</a>
        </div>
    </div>
    <div class="p-4 max-w-4xl mx-auto text-center">
        <h2 class="text-lg font-bold text-gray-800 mb-2">Welcome ${loggedInUser}</h2>
        <p class="text-xs text-gray-600">Your betting exchange dashboard is active.</p>
    </div>
</body>
</html>`);
        }

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8"><title>Dashboard</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            </head>
            <body class="min-h-screen flex flex-col text-xs bg-[#f4f6f8]">
                ${getHeaderAndSidebar(loggedInUser, role)}
                <main class="flex-1 p-4 max-w-7xl mx-auto w-full">
                    <div class="bg-white p-6 rounded shadow border">
                        <h2 class="text-sm font-bold text-gray-800">Welcome Admin, ${loggedInUser}!</h2>
                        <p class="text-gray-600 text-xs mt-1">Select <b>List of Clients</b> or <b>Soni View</b> from top bar to manage accounts.</p>
                    </div>
                </main>
                ${getModalsHTML(loggedInUser)}
                ${getModalScriptsJS()}
            </body>
            </html>
        `);
    } catch(e) { res.redirect('/'); }
});

app.get('/soni-view', async (req, res) => {
    const loggedInUser = req.query.username || 'Soniexchange';
    const tab = req.query.tab || 'active';
    try {
        const docSnap = await getDoc(doc(db, 'users', loggedInUser));
        const currentUser = docSnap.exists() ? docSnap.data() : { role: 'ADMIN', points: 100000000 };

        let allUsersList = [];
        if (loggedInUser === 'Soniexchange') {
            const snap = await getDocs(collection(db, "users"));
            snap.forEach(d => { if (d.id !== 'Soniexchange') allUsersList.push({ id: d.id, ...d.data() }); });
        } else {
            const snap = await getDocs(query(collection(db, "users"), where("createdBy", "==", loggedInUser)));
            snap.forEach(d => allUsersList.push({ id: d.id, ...d.data() }));
        }

        let usersList = allUsersList.filter(u => tab === 'active' ? (u.userActive !== false) : (u.userActive === false));

        let tableRows = usersList.length === 0 ? `<tr><td colspan="12" class="text-center p-4 text-gray-500">No users found.</td></tr>` : usersList.map(u => `
            <tr class="border-b bg-white text-[11px] hover:bg-gray-50">
                <td class="p-2 border-r font-bold">${u.username}</td>
                <td class="p-2 border-r text-right">${Number(u.creditRef || 0).toLocaleString()}</td>
                <td class="p-2 border-r text-right">${Number(u.points || 0).toLocaleString()}</td>
                <td class="p-2 border-r text-right">0</td>
                <td class="p-2 border-r text-right">${Number(u.exposure || 0).toLocaleString()}</td>
                <td class="p-2 border-r text-right">${Number(u.points || 0).toLocaleString()}</td>
                <td class="p-2 border-r text-center">${u.userActive !== false ? '✓' : '✕'}</td>
                <td class="p-2 border-r text-center">${u.betActive !== false ? '✓' : '✕'}</td>
                <td class="p-2 border-r text-right">${Number(u.exposureLimit || 0).toLocaleString()}</td>
                <td class="p-2 border-r text-center">${u.defaultPct || 0}</td>
                <td class="p-2 border-r text-center">${u.role || 'User'}</td>
                <td class="p-1.5 text-center">
                    <button onclick="openDepositModal('${u.username}')" class="bg-black text-white px-1.5 py-0.5 rounded text-[10px]">D</button>
                </td>
            </tr>
        `).join('');

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8"><title>Soni View</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            </head>
            <body class="min-h-screen flex flex-col text-xs bg-[#f4f6f8]">
                ${getHeaderAndSidebar(loggedInUser, currentUser.role)}
                <div class="bg-[#0077b6] text-white shadow-md">
                    <div class="flex justify-center items-center py-1 cursor-pointer" onclick="toggleSummaryBanner()">
                        <i id="summaryArrowIcon" class="fa-solid fa-chevron-down text-xs"></i>
                    </div>
                    <div id="summaryBannerContent" class="hidden px-4 pb-3 pt-1 grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] border-t border-white/20">
                        <div>Total Master Balance: ${Number(currentUser.points || 0).toLocaleString()}</div>
                    </div>
                </div>
                <main class="flex-1 p-3 max-w-7xl mx-auto w-full">
                    <div class="flex justify-between items-center mb-2">
                        <h2 class="text-base font-bold text-gray-800">Account List</h2>
                        <a href="/insertuser?username=${encodeURIComponent(loggedInUser)}" class="bg-[#0088cc] text-white px-3 py-1 rounded">Add Account</a>
                    </div>
                    <div class="bg-white border rounded shadow-xs overflow-x-auto">
                        <table id="soniAccountTable" class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-gray-100 text-[10px] border-b-2 font-bold">
                                    <th class="p-2 border-r">User Name</th>
                                    <th class="p-2 border-r text-right">CR</th>
                                    <th class="p-2 border-r text-right">Balance</th>
                                    <th class="p-2 border-r text-right">P/L</th>
                                    <th class="p-2 border-r text-right">Exposure</th>
                                    <th class="p-2 border-r text-right">Avail. Bal</th>
                                    <th class="p-2 border-r text-center">U st</th>
                                    <th class="p-2 border-r text-center">B st</th>
                                    <th class="p-2 border-r text-right">Exp. Limit</th>
                                    <th class="p-2 border-r text-center">Default(%)</th>
                                    <th class="p-2 border-r text-center">Type</th>
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
    } catch(e) { res.redirect('/'); }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => { res.redirect('/'); });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
