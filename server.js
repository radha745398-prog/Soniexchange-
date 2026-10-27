const express = require('express');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } = require('firebase/firestore');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const TelegramBot = require('node-telegram-bot-api');
const { Kafka } = require('kafkajs');

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

// FIREBASE CONFIGURATION
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

// ================= NEW PROVIDER API & KAFKA CONFIGURATION =================
const NEW_PROVIDER_BASE_URL = 'http://103.189.172.254:8887';

// KAFKA SETUP (As per documentation & screenshot)
const kafkaTopics = {
  '4': { topic: 'cricket-market-catalogue', maxBatch: 100, maxQueue: 400 },
  '1': { topic: 'soccer-market-catalogue', maxBatch: 200, maxQueue: 800 },
  '2': { topic: 'tennis-market-catalogue', maxBatch: 200, maxQueue: 800 }
};

async function initKafkaConsumer() {
  try {
    const kafka = new Kafka({
      clientId: 'soniexchange-client',
      brokers: ['103.189.172.165:9092'] //[span_2](start_span)[span_2](end_span)
    });
    const consumer = kafka.consumer({ groupId: 'soniexchange-odds-group' });
    await consumer.connect();
    
    for (const key of Object.keys(kafkaTopics)) {
      await consumer.subscribe({ topic: kafkaTopics[key].topic, fromBeginning: false });
    }
    console.log('Kafka Consumer connected and subscribed successfully to topics[span_3](start_span)[span_3](end_span)');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        // Handle incoming real-time odds messages here safely
        const val = message.value ? message.value.toString() : null;
        if (val) {
          // Process message payload
        }
      },
    });
  } catch (err) {
    console.log('Kafka consumer notice (Running with REST fallback):', err.message);
  }
}
initKafkaConsumer();
// =========================================================================

// TOP HEADER BAR & SIDEBAR FUNCTION
function getHeaderAndSidebar(loggedInUser, userRole) {
    return `
        <!-- TOP NAVBAR -->
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

                <!-- HEADER SEARCH BOX WITH REALTIME DROPDOWN -->
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

        <!-- 39 SPORTS SIDEBAR MENU -->
        <aside id="sportsSidebar" class="w-64 bg-white text-gray-800 flex flex-col fixed inset-y-0 left-0 transform -translate-x-full transition-transform duration-300 ease-in-out shadow-2xl border-r" style="z-index: 999999;">
            <div class="p-3 bg-[#0077b6] text-white flex justify-between items-center">
                <span class="font-bold text-sm">Sports</span>
                <button type="button" id="sidebarCloseBtn" class="text-white hover:text-gray-200 cursor-pointer"><i class="fa-solid fa-xmark text-base pointer-events-none"></i></button>
            </div>
            <div class="flex-1 overflow-y-auto p-2 space-y-1 text-[11px] font-semibold text-gray-700">
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Football</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Tennis</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Mixed Martial Arts</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Cricket</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Golf</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Boxing</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Beach Volleyball</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Table Tennis</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Futsal</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Horse Racing</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>E Games</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Basketball</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>MotoGP</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Chess</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Volleyball</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Ice Hockey</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Badminton</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Cycling</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Motorbikes</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Athletics</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Basketball 3X3</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Sumo</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Virtual sports</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Handball</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Politics</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Motor Sports</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Baseball</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Rugby Union</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Rugby League</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Darts</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>American Football</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Snooker</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Soccer</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Esports</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Greyhound Racing</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Kabaddi</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Boat Racing</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Esoccer</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Wrestling</span> <span>+</span></div>
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

// ALL MODALS HTML FUNCTION
function getModalsHTML(loggedInUser) {
    return `
        <!-- MARKET ANALYSIS MODAL -->
        <div id="marketAnalysisModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-12 z-50" onclick="handleOverlayClick(event, 'marketAnalysisModal')">
            <div class="bg-white rounded-xs shadow-2xl w-full max-w-2xl mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-[#2b3e50] px-3 py-2 flex justify-between items-center text-white">
                    <span class="font-bold text-xs">Market Analysis</span>
                    <button type="button" onclick="closeMarketAnalysisModal()" class="w-5 h-5 bg-[#00a8e8] text-white flex items-center justify-center text-xs hover:bg-[#008bc2] transition cursor-pointer">✕</button>
                </div>
                
                <div class="p-3 bg-gray-100 grid grid-cols-1 md:grid-cols-12 gap-3 text-[11px]">
                    <div class="md:col-span-4 bg-white border border-gray-300 p-2 space-y-1 shadow-xs">
                        <div class="font-bold border-b border-gray-300 pb-1 text-gray-800 text-[11px]">Game Detail</div>
                        <div class="flex justify-between"><span class="text-gray-600">Username</span><span class="font-semibold text-gray-800" id="maUsername">-</span></div>
                        <div class="flex justify-between"><span class="text-gray-600">Account Type</span><span class="font-semibold text-gray-800" id="maRole">-</span></div>
                        <div class="flex justify-between"><span class="text-gray-600">General</span><span class="font-semibold text-gray-800" id="maGeneral">0.00</span></div>
                        <div class="flex justify-between"><span class="text-gray-600">Exposure</span><span class="font-semibold text-gray-800" id="maExposure">0.00</span></div>
                        <div class="flex justify-between"><span class="text-gray-600">Credit Reference</span><span class="font-semibold text-gray-800" id="maCreditRef">0.00</span></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- DEPOSIT MODAL -->
        <div id="depositModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'depositModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b">
                    <span class="font-bold text-gray-800 text-sm">Deposit</span>
                    <button type="button" onclick="closeDepositModal()" class="cursor-pointer">✕</button>
                </div>
                <form action="/api/deposit" method="POST" class="p-5 space-y-3.5 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalClientUsername">
                    <div><label class="block mb-1">Amount</label><input type="number" name="amount" required class="w-full border p-1.5"></div>
                    <div><label class="block mb-1">Transaction Password</label><input type="password" name="txnPassword" required class="w-full border p-1.5"></div>
                    <div class="flex justify-end space-x-2"><button type="submit" class="bg-[#0099db] text-white px-3 py-1 rounded">Submit</button></div>
                </form>
            </div>
        </div>

        <!-- WITHDRAW MODAL -->
        <div id="withdrawModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'withdrawModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b">
                    <span class="font-bold text-gray-800 text-sm">Withdraw</span>
                    <button type="button" onclick="closeWithdrawModal()" class="cursor-pointer">✕</button>
                </div>
                <form action="/api/withdraw" method="POST" class="p-5 space-y-3.5 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalWithdrawClientUsername">
                    <div><label class="block mb-1">Amount</label><input type="number" name="amount" required class="w-full border p-1.5"></div>
                    <div><label class="block mb-1">Transaction Password</label><input type="password" name="txnPassword" required class="w-full border p-1.5"></div>
                    <div class="flex justify-end space-x-2"><button type="submit" class="bg-[#0099db] text-white px-3 py-1 rounded">Submit</button></div>
                </form>
            </div>
        </div>

        <!-- EXPOSURE LIMIT MODAL -->
        <div id="exposureModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'exposureModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b"><span class="font-bold">Exposure Limit</span><button onclick="closeExposureModal()" class="cursor-pointer">✕</button></div>
                <form action="/api/exposure-limit" method="POST" class="p-5 space-y-3.5 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalExposureClientUsername">
                    <div><label class="block mb-1">New Limit</label><input type="number" name="newLimit" required class="w-full border p-1.5"></div>
                    <div><label class="block mb-1">Transaction Password</label><input type="password" name="txnPassword" required class="w-full border p-1.5"></div>
                    <div class="flex justify-end"><button type="submit" class="bg-[#0099db] text-white px-3 py-1 rounded">Submit</button></div>
                </form>
            </div>
        </div>

        <!-- CREDIT MODAL -->
        <div id="creditModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'creditModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b"><span class="font-bold">Credit</span><button onclick="closeCreditModal()" class="cursor-pointer">✕</button></div>
                <form action="/api/credit-update" method="POST" class="p-5 space-y-3.5 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalCreditClientUsername">
                    <div><label class="block mb-1">New Credit</label><input type="number" name="newCredit" required class="w-full border p-1.5"></div>
                    <div><label class="block mb-1">Transaction Password</label><input type="password" name="txnPassword" required class="w-full border p-1.5"></div>
                    <div class="flex justify-end"><button type="submit" class="bg-[#0099db] text-white px-3 py-1 rounded">Submit</button></div>
                </form>
            </div>
        </div>

        <!-- PASSWORD MODAL -->
        <div id="passwordModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'passwordModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b"><span class="font-bold">Password</span><button onclick="closePasswordModal()" class="cursor-pointer">✕</button></div>
                <form action="/api/client-password-update" method="POST" class="p-5 space-y-3.5 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalPasswordClientUsername">
                    <div><label class="block mb-1">New Password</label><input type="password" name="newPassword" required class="w-full border p-1.5"></div>
                    <div><label class="block mb-1">Confirm Password</label><input type="password" name="confirmPassword" required class="w-full border p-1.5"></div>
                    <div><label class="block mb-1">Transaction Password</label><input type="password" name="txnPassword" required class="w-full border p-1.5"></div>
                    <div class="flex justify-end"><button type="submit" class="bg-[#0099db] text-white px-3 py-1 rounded">Submit</button></div>
                </form>
            </div>
        </div>

        <!-- STATUS MODAL -->
        <div id="statusModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'statusModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b"><span class="font-bold">Change Status</span><button onclick="closeStatusModal()" class="cursor-pointer">✕</button></div>
                <form action="/api/change-status" method="POST" class="p-5 space-y-4 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalStatusClientUsername">
                    <input type="hidden" name="userActive" id="inputUserActive" value="true">
                    <input type="hidden" name="betActive" id="inputBetActive" value="true">
                    <div><label class="block mb-1">Transaction Password</label><input type="password" name="txnPassword" required class="w-full border p-1.5"></div>
                    <div class="flex justify-end"><button type="submit" class="bg-[#0099db] text-white px-3 py-1 rounded">Submit</button></div>
                </form>
            </div>
        </div>

        ${loggedInUser === 'Soniexchange' ? `
        <div id="adminBalanceModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'adminBalanceModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-sm mx-3 overflow-hidden text-gray-800 border">
                <div class="bg-[#0077b6] px-4 py-2.5 flex justify-between items-center text-white">
                    <span class="font-bold text-xs">Update My Admin Balance</span>
                    <button onclick="closeAdminBalanceModal()" class="cursor-pointer">✕</button>
                </div>
                <form action="/api/admin/update-balance" method="POST" class="p-4 space-y-3 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <div><label class="block mb-1">New Balance</label><input type="number" name="newBalance" required class="w-full border p-1.5"></div>
                    <div><label class="block mb-1">Transaction Password</label><input type="password" name="txnPassword" required class="w-full border p-1.5"></div>
                    <div class="flex justify-end"><button type="submit" class="bg-[#0099db] text-white px-3 py-1 rounded">Update</button></div>
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
                    document.getElementById(modalId).classList.add('hidden');
                    document.getElementById(modalId).classList.remove('flex');
                }
            }
            function openAdminBalanceModal() { document.getElementById('adminBalanceModal').classList.remove('hidden'); document.getElementById('adminBalanceModal').classList.add('flex'); }
            function closeAdminBalanceModal() { document.getElementById('adminBalanceModal').classList.remove('flex'); document.getElementById('adminBalanceModal').classList.add('hidden'); }
            function openDepositModal(c, pts, upline, admin) { document.getElementById('modalClientUsername').value = c; document.getElementById('depositModal').classList.remove('hidden'); document.getElementById('depositModal').classList.add('flex'); }
            function closeDepositModal() { document.getElementById('depositModal').classList.remove('flex'); document.getElementById('depositModal').classList.add('hidden'); }
            function openWithdrawModal(c) { document.getElementById('modalWithdrawClientUsername').value = c; document.getElementById('withdrawModal').classList.remove('hidden'); document.getElementById('withdrawModal').classList.add('flex'); }
            function closeWithdrawModal() { document.getElementById('withdrawModal').classList.remove('flex'); document.getElementById('withdrawModal').classList.add('hidden'); }
            function openExposureModal(c, l) { document.getElementById('modalExposureClientUsername').value = c; document.getElementById('exposureModal').classList.remove('hidden'); document.getElementById('exposureModal').classList.add('flex'); }
            function closeExposureModal() { document.getElementById('exposureModal').classList.remove('flex'); document.getElementById('exposureModal').classList.add('hidden'); }
            function openCreditModal(c, cr) { document.getElementById('modalCreditClientUsername').value = c; document.getElementById('creditModal').classList.remove('hidden'); document.getElementById('creditModal').classList.add('flex'); }
            function closeCreditModal() { document.getElementById('creditModal').classList.remove('flex'); document.getElementById('creditModal').classList.add('hidden'); }
            function openPasswordModal(c) { document.getElementById('modalPasswordClientUsername').value = c; document.getElementById('passwordModal').classList.remove('hidden'); document.getElementById('passwordModal').classList.add('flex'); }
            function closePasswordModal() { document.getElementById('passwordModal').classList.remove('flex'); document.getElementById('passwordModal').classList.add('hidden'); }
            function openStatusModal(c) { document.getElementById('modalStatusClientUsername').value = c; document.getElementById('statusModal').classList.remove('hidden'); document.getElementById('statusModal').classList.add('flex'); }
            function closeStatusModal() { document.getElementById('statusModal').classList.remove('flex'); document.getElementById('statusModal').classList.add('hidden'); }
            function toggleSummaryBanner() { document.getElementById('summaryBannerContent').classList.toggle('hidden'); }
            function filterTableBySearch() {
                const q = (document.getElementById('tableSearchInput')?.value || '').toLowerCase();
                document.querySelectorAll('#soniAccountTable tbody tr, #accountTable tbody tr').forEach(r => {
                    r.style.display = r.innerText.toLowerCase().includes(q) ? '' : 'none';
                });
            }
            function resetTableSearch() { document.getElementById('tableSearchInput').value = ''; filterTableBySearch(); }
        </script>
    `;
}

// CLIENT EXCHANGE & CASINO INTERFACE FUNCTION (NEW PROVIDER DYNAMIC HUB)
function renderClientInterface(username, points, exposure) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Soniexchange - Home</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            body { font-family: Arial, sans-serif; background-color: #0d1e2b; color: #ffffff; margin: 0; }
        </style>
    </head>
    <body class="text-xs">
        <!-- CLIENT HEADER BAR -->
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

        <!-- DYNAMIC PROVIDER MULTI-API HUB (Using get-series-redis endpoint as preferred) -->
        <div class="p-2 space-y-2">
            <div class="bg-[#162a3a] rounded-xs border border-gray-800 p-2">
                <label class="block text-[10px] text-cyan-300 font-bold mb-1">LIVE SERIES & EVENTS FEED (Cricket - Sport ID 4):</label>
                <div id="dynamicApiContainer" class="space-y-1 mt-2">
                    <div class="bg-[#0f2230] rounded-xs border border-gray-800 p-3 text-[11px] text-center text-gray-400">Loading Series & Matches Feed...</div>
                </div>
            </div>
        </div>

        <script>
            function fetchNewProviderFeed() {
                var container = document.getElementById('dynamicApiContainer');
                // Using get-series-redis/4 as recommended in documentation
                fetch('/api/provider-proxy?path=/event/get-series-redis/4')
                    .then(function(res) { return res.json(); })
                    .then(function(result) {
                        var items = result.data || [];
                        if (!items || items.length === 0) {
                            container.innerHTML = '<div class="bg-[#0f2230] rounded-xs border border-gray-800 p-2 text-[11px] text-gray-400 text-center">No active series found.</div>';
                            return;
                        }
                        var htmlContent = '<div class="flex flex-col gap-1.5">';
                        for (var i = 0; i < items.length; i++) {
                            var comp = items[i].competition || {};
                            var matches = items[i].match || [];
                            htmlContent += '<div class="bg-[#0f2230] rounded-xs border border-gray-800 p-2 text-[11px] text-white">';
                            htmlContent += '<div class="font-bold text-yellow-400 text-xs border-b border-gray-700 pb-1 mb-1">' + (comp.name || 'Competition') + '</div>';
                            if (matches.length > 0) {
                                for (var j = 0; j < matches.length; j++) {
                                    var m = matches[j].event || {};
                                    htmlContent += '<div class="flex justify-between items-center py-1 border-b border-gray-800 last:border-b-0"><div><span class="text-white font-semibold">' + (m.name || 'Match') + '</span><div class="text-[10px] text-gray-400">Open Date: ' + (m.openDate || 'Live') + '</div></div><span class="bg-green-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">ACTIVE</span></div>';
                                }
                            } else {
                                htmlContent += '<div class="text-[10px] text-gray-400 italic">No matches scheduled currently.</div>';
                            }
                            htmlContent += '</div>';
                        }
                        container.innerHTML = htmlContent + '</div>';
                    })
                    .catch(function(err) {
                        container.innerHTML = '<div class="bg-[#0f2230] rounded-xs border border-gray-800 p-2 text-[11px] text-red-400 text-center">Provider API offline. Safe fallback active.</div>';
                    });
            }
            document.addEventListener('DOMContentLoaded', function() { fetchNewProviderFeed(); });
        </script>
    </body>
    </html>
    `;
}

// ROUTES
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8"><title>Sign In</title>
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

        if (password !== user.password && !(await bcrypt.compare(password, user.password).catch(() => false))) {
            return res.redirect('/');
        }

        req.session.loggedInUser = user.username;
        req.session.userRole = user.role;
        if (user.role === 'ADMIN' || user.username === 'Soniexchange') {
            req.session.masterAdmin = user.username;
        }

        if (user.role === 'Client') {
            return res.send(renderClientInterface(user.username, user.points, user.exposure));
        }

        if (user.mustChangePassword) return res.redirect(`/change-temporary-password?username=${encodeURIComponent(user.username)}`);
        res.redirect(`/soni-view?username=${encodeURIComponent(user.username)}`);
    } catch(err) {
        res.redirect('/');
    }
});

app.get('/soni-view', async (req, res) => {
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

        let tableRows = usersList.map(u => `
            <tr class="border-b bg-white text-[11px] hover:bg-gray-50">
                <td class="p-2 border-r font-bold">${u.username}</td>
                <td class="p-2 border-r text-right">${Number(u.creditRef || 0).toLocaleString()}</td>
                <td class="p-2 border-r text-right">${Number(u.points || 0).toLocaleString()}</td>
                <td class="p-2 border-r text-center">${u.userActive !== false ? '✓' : '✕'}</td>
                <td class="p-2 border-r text-center">${u.betActive !== false ? '✓' : '✕'}</td>
                <td class="p-2 border-r text-center">${u.role || 'User'}</td>
                <td class="p-1.5 text-center"><span class="bg-green-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">Active</span></td>
            </tr>
        `).join('');

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8"><title>Account List - Soni View</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            </head>
            <body class="min-h-screen flex flex-col text-xs bg-gray-100">
                ${getHeaderAndSidebar(loggedInUser, currentUser.role)}
                <main class="flex-1 p-3 max-w-7xl mx-auto w-full">
                    <div class="flex justify-between items-center mb-3">
                        <h2 class="text-base font-bold text-gray-800">Master Admin Dashboard</h2>
                        <a href="/insertuser?username=${encodeURIComponent(loggedInUser)}" class="bg-[#0088cc] text-white px-3 py-1 rounded text-xs font-semibold">Add Account</a>
                    </div>
                    <div class="bg-white border rounded shadow-xs overflow-x-auto">
                        <table id="soniAccountTable" class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-gray-200 text-gray-800 text-[11px] border-b font-bold">
                                    <th class="p-2 border-r">User Name</th>
                                    <th class="p-2 border-r text-right">Credit Ref</th>
                                    <th class="p-2 border-r text-right">Balance</th>
                                    <th class="p-2 border-r text-center">User Active</th>
                                    <th class="p-2 border-r text-center">Bet Active</th>
                                    <th class="p-2 border-r text-center">Account Type</th>
                                    <th class="p-2 text-center">Status</th>
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

app.get('/users', (req, res) => res.redirect(`/soni-view?username=${encodeURIComponent(req.query.username || 'Soniexchange')}`));
app.get('/insertuser', (req, res) => res.send(`Add account page. <a href="/soni-view?username=${encodeURIComponent(req.query.username || 'Soniexchange')}">Back</a>`));
app.get('/logout', (req, res) => req.session.destroy(() => res.redirect('/')));

// ================= NEW PROVIDER API PROXY ENDPOINT =================
app.get('/api/provider-proxy', async (req, res) => {
  try {
    let targetPath = req.query.path || '/event/get-series-redis/4';
    const finalUrl = `${NEW_PROVIDER_BASE_URL}${targetPath.startsWith('/') ? '' : '/'}${targetPath}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(finalUrl, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.json({ success: false, message: "Provider API responded with error status" });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.log("Provider API notice (Safe Fallback):", err.message);
    res.json({ success: false, message: "Provider API offline or timeout", data: [] });
  }
});
// =========================================================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
