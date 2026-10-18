const express = require('express');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } = require('firebase/firestore');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

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

// TOP HEADER BAR & SIDEBAR FUNCTION WITH AUTOCOMPLETE SEARCH
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
                        <a href="#" class="block px-3 py-1.5 hover:bg-[#2b4c63] border-b border-gray-600/50">Secure Auth Verification</a>
                        <a href="/change-password?username=${encodeURIComponent(loggedInUser)}" class="block px-3 py-1.5 hover:bg-[#2b4c63] border-b border-gray-600/50">Change Password</a>
                        <a href="/logout" class="block px-3 py-1.5 hover:bg-red-600 font-semibold">Logout</a>
                    </div>
                </div>

                <a href="/logout" class="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded text-[10px] font-bold">Logout</a>

                <!-- LIVE AUTOCOMPLETE SEARCH BOX -->
                <div class="relative ml-1">
                    <form onsubmit="return false;" class="flex items-center">
                        <input type="text" id="headerSearchInput" placeholder="Search..." autocomplete="off" oninput="handleSearchInput(this.value)" class="text-black bg-white px-2 py-0.5 pr-6 rounded-xs text-[11px] w-28 focus:outline-none border border-gray-300">
                        <span class="absolute right-1.5 text-gray-600 text-[11px] pointer-events-none">
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </span>
                    </form>
                    <!-- BLUE DROPDOWN BOX FOR MATCHED USERS -->
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
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Cricket</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Horse Racing</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Basketball</span> <span>+</span></div>
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

            // HANDLE LIVE SEARCH INPUT
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

// ALL MODALS HTML FUNCTION (INCLUDING MARKET ANALYSIS MODAL)
function getModalsHTML(loggedInUser) {
    return `
        <!-- MARKET ANALYSIS MODAL (EXACT SCREENSHOT 2 MATCH) -->
        <div id="marketAnalysisModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-12 z-50" onclick="handleOverlayClick(event, 'marketAnalysisModal')">
            <div class="bg-white rounded-xs shadow-2xl w-full max-w-2xl mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-[#2b3e50] px-3 py-2 flex justify-between items-center text-white">
                    <span class="font-bold text-xs">Market Analysis</span>
                    <button type="button" onclick="closeMarketAnalysisModal()" class="w-5 h-5 bg-[#00a8e8] text-white flex items-center justify-center text-xs hover:bg-[#008bc2] transition cursor-pointer">✕</button>
                </div>
                
                <div class="p-3 bg-gray-100 grid grid-cols-1 md:grid-cols-12 gap-3 text-[11px]" id="marketAnalysisContent">
                    <!-- GAME DETAIL BOX -->
                    <div class="md:col-span-4 bg-white border border-gray-300 p-2 space-y-1 shadow-xs">
                        <div class="font-bold border-b border-gray-300 pb-1 text-gray-800 text-[11px]">Game Detail</div>
                        <div class="flex justify-between"><span class="text-gray-600">Username</span><span class="font-semibold text-gray-800" id="maUsername">-</span></div>
                        <div class="flex justify-between"><span class="text-gray-600">Account Type</span><span class="font-semibold text-gray-800" id="maRole">-</span></div>
                        <div class="flex justify-between"><span class="text-gray-600">General</span><span class="font-semibold text-gray-800" id="maGeneral">0.00</span></div>
                        <div class="flex justify-between"><span class="text-gray-600">Exposure</span><span class="font-semibold text-gray-800" id="maExposure">0.00</span></div>
                        <div class="flex justify-between"><span class="text-gray-600">Credit Reference</span><span class="font-semibold text-gray-800" id="maCreditRef">0.00</span></div>
                    </div>

                    <!-- USER LOCK BOX -->
                    <div class="md:col-span-4 bg-white border border-gray-300 shadow-xs">
                        <div class="font-bold p-1.5 border-b border-gray-300 text-gray-800 text-[11px]">User Lock</div>
                        <table class="w-full text-left text-[10px]">
                            <thead>
                                <tr class="bg-[#2b3e50] text-white font-bold">
                                    <th class="p-1 border-r">Master Name</th>
                                    <th class="p-1 text-center border-r">User Act</th>
                                    <th class="p-1 text-center">Bet Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="border-b">
                                    <td class="p-1 font-semibold text-gray-800" id="maMasterName">-</td>
                                    <td class="p-1 text-center"><input type="checkbox" id="maUserAct" disabled class="accent-[#2b3e50]"></td>
                                    <td class="p-1 text-center"><input type="checkbox" id="maBetAct" disabled class="accent-[#2b3e50]"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- GAME LOCK BOX -->
                    <div class="md:col-span-4 bg-white border border-gray-300 shadow-xs">
                        <div class="font-bold p-1.5 border-b border-gray-300 text-gray-800 text-[11px]">Game Lock</div>
                        <table class="w-full text-left text-[10px]">
                            <thead>
                                <tr class="bg-[#2b3e50] text-white font-bold">
                                    <th class="p-1 border-r">S.No.</th>
                                    <th class="p-1 border-r">Master Name</th>
                                    <th class="p-1 border-r text-center">Bet Lock</th>
                                    <th class="p-1">Event Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="border-b bg-gray-50">
                                    <td colspan="4" class="p-2 text-center text-gray-500 font-semibold">No records found</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- DEPOSIT POPUP MODAL -->
        <div id="depositModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'depositModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-200">
                    <span class="font-bold text-gray-800 text-sm">Deposit</span>
                    <button type="button" onclick="closeDepositModal()" class="w-6 h-6 rounded-full bg-[#00a8e8] text-white flex items-center justify-center text-xs hover:bg-[#008bc2] transition cursor-pointer">✕</button>
                </div>
                <form action="/api/deposit" method="POST" class="p-5 space-y-3.5 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalClientUsername">
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <span class="col-span-4 font-normal text-gray-700 text-[11px]">Upline</span>
                        <div class="col-span-4"><input type="text" value="0" readonly class="w-full border border-gray-300 bg-gray-200 p-1.5 rounded-xs text-right text-gray-700 focus:outline-none"></div>
                        <div class="col-span-4"><input type="text" id="modalLoggedInPoints" readonly class="w-full border border-gray-300 bg-gray-200 p-1.5 rounded-xs text-right text-gray-700 focus:outline-none" value="0"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <span class="col-span-4 font-normal text-gray-700 text-[11px]">Client</span>
                        <div class="col-span-4"><input type="text" value="0" readonly class="w-full border border-gray-300 bg-gray-200 p-1.5 rounded-xs text-right text-gray-700 focus:outline-none"></div>
                        <div class="col-span-4"><input type="text" id="modalClientPoints" readonly class="w-full border border-gray-300 bg-gray-200 p-1.5 rounded-xs text-right text-gray-700 focus:outline-none" value="0"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Amount</label>
                        <div class="col-span-8"><input type="number" name="amount" required class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none text-right"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Remark</label>
                        <div class="col-span-8"><input type="text" name="remark" class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Transaction Password</label>
                        <div class="col-span-8"><input type="password" name="txnPassword" required class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none"></div>
                    </div>
                    <div class="flex justify-end space-x-2 pt-3">
                        <button type="button" onclick="closeDepositModal()" class="bg-[#2d3e50] hover:bg-[#1a2530] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <i class="fa-solid fa-rotate-left"></i> <span>BACK</span>
                        </button>
                        <button type="submit" class="bg-[#0099db] hover:bg-[#007cb3] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <span>submit</span> <i class="fa-solid fa-right-to-bracket"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- WITHDRAW POPUP MODAL -->
        <div id="withdrawModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'withdrawModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-200">
                    <span class="font-bold text-gray-800 text-sm">Withdraw</span>
                    <button type="button" onclick="closeWithdrawModal()" class="w-6 h-6 rounded-full bg-[#00a8e8] text-white flex items-center justify-center text-xs hover:bg-[#008bc2] transition cursor-pointer">✕</button>
                </div>
                <form action="/api/withdraw" method="POST" class="p-5 space-y-3.5 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalWithdrawClientUsername">
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <span class="col-span-4 font-normal text-gray-700 text-[11px]">Upline</span>
                        <div class="col-span-4"><input type="text" value="0" readonly class="w-full border border-gray-300 bg-gray-200 p-1.5 rounded-xs text-right text-gray-700 focus:outline-none"></div>
                        <div class="col-span-4"><input type="text" id="modalWithdrawLoggedInPoints" readonly class="w-full border border-gray-300 bg-gray-200 p-1.5 rounded-xs text-right text-gray-700 focus:outline-none" value="0"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <span class="col-span-4 font-normal text-gray-700 text-[11px]">Client</span>
                        <div class="col-span-4"><input type="text" value="0" readonly class="w-full border border-gray-300 bg-gray-200 p-1.5 rounded-xs text-right text-gray-700 focus:outline-none"></div>
                        <div class="col-span-4"><input type="text" id="modalWithdrawClientPoints" readonly class="w-full border border-gray-300 bg-gray-200 p-1.5 rounded-xs text-right text-gray-700 focus:outline-none" value="0"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Amount</label>
                        <div class="col-span-8"><input type="number" name="amount" required class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none text-right"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Remark</label>
                        <div class="col-span-8"><input type="text" name="remark" class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Transaction Password</label>
                        <div class="col-span-8"><input type="password" name="txnPassword" required class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none"></div>
                    </div>
                    <div class="flex justify-end space-x-2 pt-3">
                        <button type="button" onclick="closeWithdrawModal()" class="bg-[#2d3e50] hover:bg-[#1a2530] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <i class="fa-solid fa-rotate-left"></i> <span>BACK</span>
                        </button>
                        <button type="submit" class="bg-[#0099db] hover:bg-[#007cb3] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <span>submit</span> <i class="fa-solid fa-right-to-bracket"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- EXPOSURE LIMIT POPUP MODAL -->
        <div id="exposureModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'exposureModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-200">
                    <span class="font-bold text-gray-800 text-sm">Exposure Limit</span>
                    <button type="button" onclick="closeExposureModal()" class="w-6 h-6 rounded-full bg-[#00a8e8] text-white flex items-center justify-center text-xs hover:bg-[#008bc2] transition cursor-pointer">✕</button>
                </div>
                <form action="/api/exposure-limit" method="POST" class="p-5 space-y-3.5 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalExposureClientUsername">
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Old Limit</label>
                        <div class="col-span-8"><input type="text" id="modalOldExposureLimit" readonly class="w-full border border-gray-300 bg-gray-200 p-1.5 rounded-xs text-right text-gray-700 focus:outline-none" value="0.00"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">New Limit</label>
                        <div class="col-span-8"><input type="number" name="newLimit" required class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none text-right"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Transaction Password</label>
                        <div class="col-span-8"><input type="password" name="txnPassword" required class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none"></div>
                    </div>
                    <div class="flex justify-end space-x-2 pt-3">
                        <button type="button" onclick="closeExposureModal()" class="bg-[#2d3e50] hover:bg-[#1a2530] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <i class="fa-solid fa-rotate-left"></i> <span>BACK</span>
                        </button>
                        <button type="submit" class="bg-[#0099db] hover:bg-[#007cb3] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <span>submit</span> <i class="fa-solid fa-right-to-bracket"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- CREDIT POPUP MODAL -->
        <div id="creditModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'creditModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-200">
                    <span class="font-bold text-gray-800 text-sm">Credit</span>
                    <button type="button" onclick="closeCreditModal()" class="w-6 h-6 rounded-full bg-[#00a8e8] text-white flex items-center justify-center text-xs hover:bg-[#008bc2] transition cursor-pointer">✕</button>
                </div>
                <form action="/api/credit-update" method="POST" class="p-5 space-y-3.5 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalCreditClientUsername">
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Old Credit</label>
                        <div class="col-span-8"><input type="text" id="modalOldCredit" readonly class="w-full border border-gray-300 bg-gray-200 p-1.5 rounded-xs text-right text-gray-700 focus:outline-none" value="0.00"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">New Credit</label>
                        <div class="col-span-8"><input type="number" name="newCredit" required class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none text-right"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Transaction Password</label>
                        <div class="col-span-8"><input type="password" name="txnPassword" required class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none"></div>
                    </div>
                    <div class="flex justify-end space-x-2 pt-3">
                        <button type="button" onclick="closeCreditModal()" class="bg-[#2d3e50] hover:bg-[#1a2530] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <i class="fa-solid fa-rotate-left"></i> <span>BACK</span>
                        </button>
                        <button type="submit" class="bg-[#0099db] hover:bg-[#007cb3] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <span>submit</span> <i class="fa-solid fa-right-to-bracket"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- PASSWORD POPUP MODAL -->
        <div id="passwordModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'passwordModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-200">
                    <span class="font-bold text-gray-800 text-sm">Password</span>
                    <button type="button" onclick="closePasswordModal()" class="w-6 h-6 rounded-full bg-[#00a8e8] text-white flex items-center justify-center text-xs hover:bg-[#008bc2] transition cursor-pointer">✕</button>
                </div>
                <form action="/api/client-password-update" method="POST" class="p-5 space-y-3.5 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalPasswordClientUsername">
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">New Password</label>
                        <div class="col-span-8"><input type="password" name="newPassword" required class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Confirm Password</label>
                        <div class="col-span-8"><input type="password" name="confirmPassword" required class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Transaction Password</label>
                        <div class="col-span-8"><input type="password" name="txnPassword" required class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none"></div>
                    </div>
                    <div class="flex justify-end space-x-2 pt-3">
                        <button type="button" onclick="closePasswordModal()" class="bg-[#2d3e50] hover:bg-[#1a2530] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <i class="fa-solid fa-rotate-left"></i> <span>BACK</span>
                        </button>
                        <button type="submit" class="bg-[#0099db] hover:bg-[#007cb3] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <span>submit</span> <i class="fa-solid fa-right-to-bracket"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- CHANGE STATUS POPUP MODAL (S BUTTON) -->
        <div id="statusModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'statusModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-200">
                    <span class="font-bold text-gray-800 text-sm">Change Status</span>
                    <button type="button" onclick="closeStatusModal()" class="w-6 h-6 rounded-full bg-[#00a8e8] text-white flex items-center justify-center text-xs hover:bg-[#008bc2] transition cursor-pointer">✕</button>
                </div>
                <form action="/api/change-status" method="POST" class="p-5 space-y-4 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalStatusClientUsername">
                    
                    <div class="text-[#e67e22] font-semibold text-xs mb-2" id="modalStatusDisplayClient">ClientName</div>

                    <div class="grid grid-cols-2 gap-4 my-2 text-center">
                        <div>
                            <label class="block text-gray-700 font-semibold mb-1 text-[11px]">User Active</label>
                            <button type="button" id="btnUserActive" onclick="toggleUserStatus()" class="w-16 h-7 bg-[#0088cc] text-white rounded-full font-bold text-[10px] relative transition-colors cursor-pointer shadow-inner">
                                <span id="textUserActive" class="absolute left-2.5 top-1">ON</span>
                                <div id="dotUserActive" class="w-5 h-5 bg-[#1b2a38] rounded-full absolute top-1 right-1 transition-all"></div>
                            </button>
                            <input type="hidden" name="userActive" id="inputUserActive" value="true">
                        </div>
                        <div>
                            <label class="block text-gray-700 font-semibold mb-1 text-[11px]">Bet Active</label>
                            <button type="button" id="btnBetActive" onclick="toggleBetStatus()" class="w-16 h-7 bg-[#0088cc] text-white rounded-full font-bold text-[10px] relative transition-colors cursor-pointer shadow-inner">
                                <span id="textBetActive" class="absolute left-2.5 top-1">ON</span>
                                <div id="dotBetActive" class="w-5 h-5 bg-[#1b2a38] rounded-full absolute top-1 right-1 transition-all"></div>
                            </button>
                            <input type="hidden" name="betActive" id="inputBetActive" value="true">
                        </div>
                    </div>

                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Transaction Password</label>
                        <div class="col-span-8"><input type="password" name="txnPassword" required class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none"></div>
                    </div>

                    <div class="flex justify-end space-x-2 pt-3">
                        <button type="button" onclick="closeStatusModal()" class="bg-[#2d3e50] hover:bg-[#1a2530] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <i class="fa-solid fa-rotate-left"></i> <span>BACK</span>
                        </button>
                        <button type="submit" class="bg-[#0099db] hover:bg-[#007cb3] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <span>submit</span> <i class="fa-solid fa-right-to-bracket"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// MODAL SCRIPTS FUNCTION
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
                }
            }

            async function openMarketAnalysisModal(username) {
                const dropdown = document.getElementById('searchResultsDropdown');
                if(dropdown) dropdown.classList.add('hidden');

                try {
                    const res = await fetch('/api/user-detail?username=' + encodeURIComponent(username));
                    const data = await res.json();
                    
                    if (data && data.success) {
                        const u = data.user;
                        document.getElementById('maUsername').textContent = u.username || '-';
                        document.getElementById('maRole').textContent = u.role || 'User';
                        document.getElementById('maGeneral').textContent = Number(u.points || 0).toFixed(2);
                        document.getElementById('maExposure').textContent = Number(u.exposure || 0).toFixed(2);
                        document.getElementById('maCreditRef').textContent = Number(u.creditRef || 0).toFixed(2);
                        document.getElementById('maMasterName').textContent = u.createdBy || 'Soniexchange';
                        document.getElementById('maUserAct').checked = u.userActive !== false;
                        document.getElementById('maBetAct').checked = u.betActive !== false;

                        const modal = document.getElementById('marketAnalysisModal');
                        modal.classList.remove('hidden');
                        modal.classList.add('flex');
                    }
                } catch(err) {
                    console.error('Error fetching market analysis detail:', err);
                }
            }

            function closeMarketAnalysisModal() {
                const modal = document.getElementById('marketAnalysisModal');
                modal.classList.remove('flex');
                modal.classList.add('hidden');
            }

            function openDepositModal(clientName, clientPts, uplinePts) {
                document.getElementById('modalClientUsername').value = clientName;
                document.getElementById('modalLoggedInPoints').value = uplinePts.toLocaleString();
                document.getElementById('modalClientPoints').value = clientPts.toLocaleString();
                
                const modal = document.getElementById('depositModal');
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
            function closeDepositModal() {
                const modal = document.getElementById('depositModal');
                modal.classList.remove('flex');
                modal.classList.add('hidden');
            }

            function openWithdrawModal(clientName, clientPts, uplinePts) {
                document.getElementById('modalWithdrawClientUsername').value = clientName;
                document.getElementById('modalWithdrawLoggedInPoints').value = uplinePts.toLocaleString();
                document.getElementById('modalWithdrawClientPoints').value = clientPts.toLocaleString();
                
                const modal = document.getElementById('withdrawModal');
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
            function closeWithdrawModal() {
                const modal = document.getElementById('withdrawModal');
                modal.classList.remove('flex');
                modal.classList.add('hidden');
            }

            function openExposureModal(clientName, oldLimit) {
                document.getElementById('modalExposureClientUsername').value = clientName;
                document.getElementById('modalOldExposureLimit').value = Number(oldLimit || 0).toFixed(2);
                
                const modal = document.getElementById('exposureModal');
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
            function closeExposureModal() {
                const modal = document.getElementById('exposureModal');
                modal.classList.remove('flex');
                modal.classList.add('hidden');
            }

            function openCreditModal(clientName, oldCredit) {
                document.getElementById('modalCreditClientUsername').value = clientName;
                document.getElementById('modalOldCredit').value = Number(oldCredit || 0).toFixed(2);
                
                const modal = document.getElementById('creditModal');
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
            function closeCreditModal() {
                const modal = document.getElementById('creditModal');
                modal.classList.remove('flex');
                modal.classList.add('hidden');
            }

            function openPasswordModal(clientName) {
                document.getElementById('modalPasswordClientUsername').value = clientName;
                const modal = document.getElementById('passwordModal');
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
            function closePasswordModal() {
                const modal = document.getElementById('passwordModal');
                modal.classList.remove('flex');
                modal.classList.add('hidden');
            }

            function openStatusModal(clientName, userActive, betActive) {
                document.getElementById('modalStatusClientUsername').value = clientName;
                document.getElementById('modalStatusDisplayClient').textContent = clientName;
                
                setUserActiveState(userActive);
                setBetActiveState(betActive);

                const modal = document.getElementById('statusModal');
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
            function closeStatusModal() {
                const modal = document.getElementById('statusModal');
                modal.classList.remove('flex');
                modal.classList.add('hidden');
            }

            let isUserActive = true;
            let isBetActive = true;

            function setUserActiveState(state) {
                isUserActive = state;
                document.getElementById('inputUserActive').value = state ? "true" : "false";
                const btn = document.getElementById('btnUserActive');
                const txt = document.getElementById('textUserActive');
                const dot = document.getElementById('dotUserActive');

                if (state) {
                    btn.className = "w-16 h-7 bg-[#0088cc] text-white rounded-full font-bold text-[10px] relative transition-colors cursor-pointer shadow-inner";
                    txt.textContent = "ON";
                    txt.className = "absolute left-2.5 top-1";
                    dot.style.right = "4px";
                    dot.style.left = "auto";
                } else {
                    btn.className = "w-16 h-7 bg-gray-400 text-white rounded-full font-bold text-[10px] relative transition-colors cursor-pointer shadow-inner";
                    txt.textContent = "OFF";
                    txt.className = "absolute right-2.5 top-1";
                    dot.style.left = "4px";
                    dot.style.right = "auto";
                }
            }

            function setBetActiveState(state) {
                isBetActive = state;
                document.getElementById('inputBetActive').value = state ? "true" : "false";
                const btn = document.getElementById('btnBetActive');
                const txt = document.getElementById('textBetActive');
                const dot = document.getElementById('dotBetActive');

                if (state) {
                    btn.className = "w-16 h-7 bg-[#0088cc] text-white rounded-full font-bold text-[10px] relative transition-colors cursor-pointer shadow-inner";
                    txt.textContent = "ON";
                    txt.className = "absolute left-2.5 top-1";
                    dot.style.right = "4px";
                    dot.style.left = "auto";
                } else {
                    btn.className = "w-16 h-7 bg-gray-400 text-white rounded-full font-bold text-[10px] relative transition-colors cursor-pointer shadow-inner";
                    txt.textContent = "OFF";
                    txt.className = "absolute right-2.5 top-1";
                    dot.style.left = "4px";
                    dot.style.right = "auto";
                }
            }

            function toggleUserStatus() {
                setUserActiveState(!isUserActive);
            }

            function toggleBetStatus() {
                setBetActiveState(!isBetActive);
            }

            function toggleSummaryBanner() {
                const banner = document.getElementById('summaryBannerContent');
                const arrowIcon = document.getElementById('summaryArrowIcon');
                if (banner.classList.contains('hidden')) {
                    banner.classList.remove('hidden');
                    arrowIcon.className = "fa-solid fa-chevron-up text-xs";
                } else {
                    banner.classList.add('hidden');
                    arrowIcon.className = "fa-solid fa-chevron-down text-xs";
                }
            }

            window.addEventListener('popstate', function() {
                closeDepositModal();
                closeWithdrawModal();
                closeExposureModal();
                closeCreditModal();
                closePasswordModal();
                closeStatusModal();
                closeMarketAnalysisModal();
            });
        </script>
    `;
}

// API TO SEARCH USERS REALTIME
app.get('/api/search-users', async (req, res) => {
    const q = (req.query.q || '').trim().toLowerCase();
    const loggedInUser = req.query.loggedInUser || 'Soniexchange';

    if (!q) return res.json([]);

    try {
        let usersList = [];
        if (loggedInUser === 'Soniexchange') {
            const querySnapshot = await getDocs(collection(db, "users"));
            querySnapshot.forEach((docItem) => {
                if (docItem.id !== 'Soniexchange') {
                    usersList.push({ username: docItem.id, ...docItem.data() });
                }
            });
        } else {
            const queryRef = query(collection(db, "users"), where("createdBy", "==", loggedInUser));
            const querySnapshot = await getDocs(queryRef);
            querySnapshot.forEach((docItem) => {
                usersList.push({ username: docItem.id, ...docItem.data() });
            });
        }

        const filtered = usersList.filter(u => u.username.toLowerCase().includes(q));
        res.json(filtered);
    } catch(err) {
        console.error(err);
        res.json([]);
    }
});

// API TO GET SINGLE USER DETAIL FOR MARKET ANALYSIS MODAL
app.get('/api/user-detail', async (req, res) => {
    const username = (req.query.username || '').trim();
    if (!username) return res.json({ success: false });

    try {
        const userRef = doc(db, 'users', username);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            return res.json({ success: true, user: docSnap.data() });
        }
        res.json({ success: false });
    } catch(err) {
        console.error(err);
        res.json({ success: false });
    }
});

// 1. SIGN IN PAGE
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sign In</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-[#116491] min-h-screen flex flex-col items-center justify-center p-6 text-white font-sans">
            <div class="flex flex-col items-center justify-center w-full max-w-sm">
                <div class="bg-white text-gray-800 rounded-lg shadow-2xl p-6 w-full">
                    <div class="flex items-center justify-center mb-6">
                        <div class="border-t border-gray-300 flex-grow mr-3"></div>
                        <span class="text-gray-600 text-sm font-semibold">Sign In</span>
                        <div class="border-t border-gray-300 flex-grow ml-3"></div>
                    </div>
                    <form action="/login-process" method="POST" class="space-y-4" autocomplete="off">
                        <div>
                            <input type="text" name="username" required placeholder="Username" class="w-full bg-gray-50 border border-gray-300 rounded p-2.5 text-xs text-gray-800 focus:outline-none focus:border-cyan-500">
                        </div>
                        <div>
                            <input type="password" name="password" required placeholder="Password" class="w-full bg-gray-50 border border-gray-300 rounded p-2.5 text-xs text-gray-800 focus:outline-none focus:border-cyan-500">
                        </div>
                        <button type="submit" class="w-full bg-[#0088cc] hover:bg-[#006699] text-white font-bold py-2.5 rounded text-xs transition shadow">
                            Login →
                        </button>
                    </form>
                </div>
            </div>
        </body>
        </html>
    `);
});

// 2. LOGIN PROCESS
app.post('/login-process', async (req, res) => {
    let { username, password } = req.body;
    username = username ? username.trim() : '';
    password = password ? password.trim() : '';

    try {
        const userRef = doc(db, 'users', username);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
            return res.send("<script>alert('Invalid Username or Password!'); window.history.back();</script>");
        }

        const user = docSnap.data();
        const isMatch = (password === user.password) || (await bcrypt.compare(password, user.password).catch(() => false));

        if (!isMatch) {
            return res.send("<script>alert('Invalid Username or Password!'); window.history.back();</script>");
        }

        if (user.mustChangePassword) {
            return res.redirect(`/change-password?username=${encodeURIComponent(user.username)}`);
        }

        res.redirect(`/dashboard?username=${encodeURIComponent(user.username)}`);
    } catch(err) {
        console.error(err);
        res.send("<script>alert('Login Error'); window.history.back();</script>");
    }
});

// 3. FIRST TIME PASSWORD CHANGE PAGE
app.get('/change-password', (req, res) => {
    const username = req.query.username || '';
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Change Password & Get Transaction Password</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-[#116491] min-h-screen flex items-center justify-center p-4 text-xs">
            <div class="bg-white p-6 rounded shadow-lg max-w-md w-full text-gray-800">
                <h2 class="font-bold text-base mb-3 text-[#0077b6] border-b pb-1">Change Temporary Password</h2>
                <p class="text-gray-600 mb-4 text-[11px]">For security reasons, please update your password. Upon updating, your unique 6-digit transaction password will be generated.</p>
                <form action="/api/update-password" method="POST" class="space-y-3">
                    <input type="hidden" name="username" value="${username}">
                    <div>
                        <label class="block font-semibold mb-1">New Password:</label>
                        <input type="password" name="newPassword" required class="w-full border p-2 rounded bg-gray-50 text-xs">
                    </div>
                    <div>
                        <label class="block font-semibold mb-1">Confirm New Password:</label>
                        <input type="password" name="confirmPassword" required class="w-full border p-2 rounded bg-gray-50 text-xs">
                    </div>
                    <button type="submit" class="w-full bg-[#0077b6] text-white font-bold py-2 rounded">Update Password</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

// 4. UPDATE PASSWORD API
app.post('/api/update-password', async (req, res) => {
    const { username, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
        return res.send("<script>alert('Passwords do not match!'); window.history.back();</script>");
    }

    try {
        const userRef = doc(db, 'users', username);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
            return res.send("<script>alert('User not found!'); window.location='/';</script>");
        }

        const txnPass = Math.floor(100000 + Math.random() * 900000).toString();

        await updateDoc(userRef, {
            password: newPassword,
            mustChangePassword: false,
            txnPassword: txnPass
        });

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Transaction Password Generated</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-[#116491] min-h-screen flex items-center justify-center p-4 text-xs font-sans">
                <div class="bg-white p-6 rounded shadow-lg max-w-lg w-full text-center space-y-4">
                    <h2 class="text-green-600 font-bold text-lg">Success! आपका password बदला जा चुका है।</h2>
                    <div class="bg-gray-100 p-4 rounded border">
                        <p class="font-semibold text-gray-700 mb-1">Your transaction password is:</p>
                        <p class="text-2xl font-black text-blue-600 tracking-wider">${txnPass}</p>
                    </div>
                    <p class="text-gray-600 text-[11px] leading-relaxed">
                        Remember this transaction password, from now on all transactions can be done only with this password.<br>
                        लेन-देन के पासवर्ड को याद रखें, अब से वेबसाइट के सभी हस्तांतरण इसी से किए जा सकते हैं।
                    </p>
                    <a href="/" class="inline-block bg-[#0077b6] text-white font-bold px-6 py-2 rounded text-xs">Back to Login</a>
                </div>
            </body>
            </html>
        `);
    } catch(err) {
        console.error(err);
        res.send("<script>alert('Error updating password'); window.history.back();</script>");
    }
});

// 5. DASHBOARD ROUTE
app.get('/dashboard', async (req, res) => {
    const loggedInUser = req.query.username || 'Soniexchange';
    try {
        const userRef = doc(db, 'users', loggedInUser);
        const docSnap = await getDoc(userRef);
        const role = docSnap.exists() ? docSnap.data().role : 'ADMIN';

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Dashboard</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <style>body { font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; }</style>
            </head>
            <body class="min-h-screen flex flex-col text-xs">
                ${getHeaderAndSidebar(loggedInUser, role)}
                <main class="flex-1 p-4 max-w-7xl mx-auto w-full">
                    <div class="bg-white p-4 rounded border shadow-xs">
                        <h2 class="text-sm font-bold text-gray-800 mb-2">Welcome, ${loggedInUser}</h2>
                        <p class="text-gray-600 text-[11px]">Click on <strong>Soni</strong> in top header for exact Account List view, or <strong>List of Clients</strong> for standard view.</p>
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

// 6. ORIGINAL ACCOUNT LIST PAGE (/users)
app.get('/users', async (req, res) => {
    const loggedInUser = req.query.username || 'Soniexchange';
    try {
        const userRef = doc(db, 'users', loggedInUser);
        const docSnap = await getDoc(userRef);
        const currentUser = docSnap.exists() ? docSnap.data() : { role: 'ADMIN', points: 100000000 };

        let usersList = [];
        if (loggedInUser === 'Soniexchange') {
            const querySnapshot = await getDocs(collection(db, "users"));
            querySnapshot.forEach((docItem) => {
                if (docItem.id !== 'Soniexchange') {
                    usersList.push({ id: docItem.id, ...docItem.data() });
                }
            });
        } else {
            const q = query(collection(db, "users"), where("createdBy", "==", loggedInUser));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((docItem) => {
                usersList.push({ id: docItem.id, ...docItem.data() });
            });
        }

        let tableRows = usersList.length === 0 ? `
            <tr><td colspan="8" class="text-center p-4 text-gray-500">No clients found. Click "Add Account" to create one.</td></tr>
        ` : usersList.map(u => `
            <tr class="border-b bg-white text-[11px] hover:bg-gray-50">
                <td class="p-2 border-r">
                    <span class="bg-[#2b3a4a] text-white px-2 py-1 rounded-xs font-bold inline-block text-[10px] tracking-wide">${u.username}</span>
                </td>
                <td class="p-2 border-r text-right font-semibold">${Number(u.creditRef || u.points || 0).toLocaleString()}</td>
                <td class="p-2 border-r text-center">
                    <div class="inline-flex items-center justify-center w-4 h-4 ${u.userActive !== false ? 'bg-black text-white' : 'bg-red-500 text-white'} rounded-xs text-[10px] font-bold">
                        ${u.userActive !== false ? '✓' : '✕'}
                    </div>
                </td>
                <td class="p-2 border-r text-center">
                    <div class="inline-flex items-center justify-center w-4 h-4 ${u.betActive !== false ? 'bg-black text-white' : 'bg-red-500 text-white'} rounded-xs text-[10px] font-bold">
                        ${u.betActive !== false ? '✓' : '✕'}
                    </div>
                </td>
                <td class="p-2 border-r text-right">${Number(u.exposureLimit || 0).toLocaleString()}</td>
                <td class="p-2 border-r text-center">${u.defaultPct || 0}</td>
                <td class="p-2 border-r text-center">${u.role || 'User'}</td>
                <td class="p-1.5 text-center">
                    <div class="flex items-center justify-center space-x-1">
                        <button type="button" onclick="openDepositModal('${u.username}', ${u.points || 0}, ${currentUser.points || 0})" class="bg-[#343a40] hover:bg-black text-white px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer">D</button>
                        <button type="button" onclick="openWithdrawModal('${u.username}', ${u.points || 0}, ${currentUser.points || 0})" class="bg-[#343a40] hover:bg-black text-white px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer">W</button>
                        <button type="button" onclick="openExposureModal('${u.username}', ${u.exposureLimit || 0})" class="bg-[#343a40] hover:bg-black text-white px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer">L</button>
                        <button type="button" onclick="openCreditModal('${u.username}', ${u.creditRef || u.points || 0})" class="bg-[#343a40] hover:bg-black text-white px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer">C</button>
                        <button type="button" onclick="openPasswordModal('${u.username}')" class="bg-[#343a40] hover:bg-black text-white px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer">P</button>
                        <button type="button" onclick="openStatusModal('${u.username}', ${u.userActive !== false}, ${u.betActive !== false})" class="bg-[#343a40] hover:bg-black text-white px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer">S</button>
                        <button class="bg-[#343a40] hover:bg-black text-white px-2 py-0.5 rounded text-[10px] font-bold">MORE</button>
                    </div>
                </td>
            </tr>
        `).join('');

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Account List</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; }
                    .modal-bg-overlay { background-color: rgba(0, 0, 0, 0.45); }
                </style>
            </head>
            <body class="min-h-screen flex flex-col text-xs">
                ${getHeaderAndSidebar(loggedInUser, currentUser.role)}

                <main class="flex-1 p-3 max-w-7xl mx-auto w-full">
                    <div class="flex justify-between items-center mb-3">
                        <h2 class="text-base font-bold text-gray-800">Account List</h2>
                        <a href="/insertuser?username=${encodeURIComponent(loggedInUser)}" class="bg-[#0088cc] hover:bg-[#006699] text-white px-3 py-1 rounded text-xs font-semibold shadow-xs">Add Account</a>
                    </div>

                    <div class="bg-white border rounded shadow-xs overflow-x-auto">
                        <table id="accountTable" class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-gray-100 text-gray-700 text-[11px] border-b-2 border-gray-400 font-bold">
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
                            <tbody>
                                ${tableRows}
                            </tbody>
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

// 7. EXACT NEW SCREENSHOT VIEW (/soni-view)
app.get('/soni-view', async (req, res) => {
    const loggedInUser = req.query.username || 'Soniexchange';
    const tab = req.query.tab || 'active';

    try {
        const userRef = doc(db, 'users', loggedInUser);
        const docSnap = await getDoc(userRef);
        const currentUser = docSnap.exists() ? docSnap.data() : { role: 'ADMIN', points: 100000000 };

        let allUsersList = [];
        if (loggedInUser === 'Soniexchange') {
            const querySnapshot = await getDocs(collection(db, "users"));
            querySnapshot.forEach((docItem) => {
                if (docItem.id !== 'Soniexchange') {
                    allUsersList.push({ id: docItem.id, ...docItem.data() });
                }
            });
        } else {
            const q = query(collection(db, "users"), where("createdBy", "==", loggedInUser));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((docItem) => {
                allUsersList.push({ id: docItem.id, ...docItem.data() });
            });
        }

        let usersList = allUsersList.filter(u => {
            const isActive = u.userActive !== false;
            return tab === 'active' ? isActive : !isActive;
        });

        usersList.sort((a, b) => Number(b.points || 0) - Number(a.points || 0));

        let totalCR = 0;
        let totalBalance = 0;
        let totalPL = 0;
        let totalExposure = 0;
        let totalAvailBal = 0;
        let totalExpLimit = 0;

        usersList.forEach(u => {
            const cr = Number(u.creditRef || 0);
            const bal = Number(u.points || 0);
            const pl = bal - cr;
            const exp = Number(u.exposure || 0);
            const avail = bal - exp;
            const limit = Number(u.exposureLimit || 0);

            totalCR += cr;
            totalBalance += Math.abs(bal);
            totalPL += pl;
            totalExposure += exp;
            totalAvailBal += avail;
            totalExpLimit += limit;
        });

        let tableRows = usersList.length === 0 ? `
            <tr><td colspan="12" class="text-center p-4 text-gray-500">No ${tab} users found.</td></tr>
        ` : usersList.map(u => {
            const cr = Number(u.creditRef || 0);
            const rawBal = Number(u.points || 0);
            const bal = Math.abs(rawBal);
            const pl = rawBal - cr;
            const exp = Number(u.exposure || 0);
            const avail = rawBal - exp;

            return `
            <tr class="border-b bg-white text-[11px] hover:bg-gray-50">
                <td class="p-2 border-r">
                    <span class="bg-[#2b3a4a] text-white px-2 py-1 rounded-xs font-bold inline-block text-[10px] tracking-wide">${u.username}</span>
                </td>
                <td class="p-2 border-r text-right font-semibold">${cr.toLocaleString()}</td>
                <td class="p-2 border-r text-right font-semibold">${bal.toLocaleString()}</td>
                <td class="p-2 border-r text-right font-semibold ${pl < 0 ? 'text-red-600' : 'text-gray-800'}">${pl.toLocaleString()}</td>
                <td class="p-2 border-r text-right">${exp.toLocaleString()}</td>
                <td class="p-2 border-r text-right font-semibold ${avail < 0 ? 'text-red-600' : ''}">${avail.toLocaleString()}</td>
                <td class="p-2 border-r text-center">
                    <div class="inline-flex items-center justify-center w-4 h-4 ${u.userActive !== false ? 'bg-black text-white' : 'bg-red-500 text-white'} rounded-xs text-[10px] font-bold">
                        ${u.userActive !== false ? '✓' : '✕'}
                    </div>
                </td>
                <td class="p-2 border-r text-center">
                    <div class="inline-flex items-center justify-center w-4 h-4 ${u.betActive !== false ? 'bg-black text-white' : 'bg-red-500 text-white'} rounded-xs text-[10px] font-bold">
                        ${u.betActive !== false ? '✓' : '✕'}
                    </div>
                </td>
                <td class="p-2 border-r text-right">${Number(u.exposureLimit || 0).toLocaleString()}</td>
                <td class="p-2 border-r text-center">${u.defaultPct || 0}</td>
                <td class="p-2 border-r text-center">${u.role || 'User'}</td>
                <td class="p-1.5 text-center">
                    <div class="flex items-center justify-center space-x-1">
                        <button type="button" onclick="openDepositModal('${u.username}', ${rawBal}, ${currentUser.points || 0})" class="bg-[#343a40] hover:bg-black text-white px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer">D</button>
                        <button type="button" onclick="openWithdrawModal('${u.username}', ${rawBal}, ${currentUser.points || 0})" class="bg-[#343a40] hover:bg-black text-white px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer">W</button>
                        <button type="button" onclick="openExposureModal('${u.username}', ${u.exposureLimit || 0})" class="bg-[#343a40] hover:bg-black text-white px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer">L</button>
                        <button type="button" onclick="openCreditModal('${u.username}', ${cr})" class="bg-[#343a40] hover:bg-black text-white px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer">C</button>
                        <button type="button" onclick="openPasswordModal('${u.username}')" class="bg-[#343a40] hover:bg-black text-white px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer">P</button>
                        <button type="button" onclick="openStatusModal('${u.username}', ${u.userActive !== false}, ${u.betActive !== false})" class="bg-[#343a40] hover:bg-black text-white px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer">S</button>
                        <button class="bg-[#343a40] hover:bg-black text-white px-2 py-0.5 rounded text-[10px] font-bold">MORE</button>
                    </div>
                </td>
            </tr>`;
        }).join('');

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Account List - Soni View</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; }
                    .modal-bg-overlay { background-color: rgba(0, 0, 0, 0.45); }
                    .tab-active-box { background-color: #ffffff; border-top: 1px solid #d1d5db; border-left: 1px solid #d1d5db; border-right: 1px solid #d1d5db; border-bottom: 1px solid #ffffff; color: #1f2937; font-weight: 600; margin-bottom: -1px; z-index: 10; }
                    .tab-inactive-link { background-color: transparent; border: 1px solid transparent; color: #0077b6; font-weight: 600; }
                </style>
            </head>
            <body class="min-h-screen flex flex-col text-xs">
                ${getHeaderAndSidebar(loggedInUser, currentUser.role)}

                <main class="flex-1 p-3 max-w-7xl mx-auto w-full">
                    <div class="flex justify-between items-center mb-2">
                        <h2 class="text-base font-bold text-gray-800">Account List</h2>
                        <a href="/insertuser?username=${encodeURIComponent(loggedInUser)}" class="bg-[#0088cc] hover:bg-[#006699] text-white px-3 py-1 rounded text-xs font-semibold shadow-xs">Add Account</a>
                    </div>

                    <div class="relative flex items-center border-b border-gray-300 mb-3 text-[11px]">
                        <a href="/soni-view?username=${encodeURIComponent(loggedInUser)}&tab=active" class="px-3 py-1.5 rounded-t-xs cursor-pointer ${tab === 'active' ? 'tab-active-box' : 'tab-inactive-link'}">
                            Active Users
                        </a>
                        <a href="/soni-view?username=${encodeURIComponent(loggedInUser)}&tab=deactive" class="px-3 py-1.5 rounded-t-xs cursor-pointer ${tab === 'deactive' ? 'tab-active-box' : 'tab-inactive-link'}">
                            Deactive Users
                        </a>
                    </div>

                    <div class="bg-white border rounded shadow-xs overflow-x-auto">
                        <table id="soniAccountTable" class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-gray-100 text-gray-700 text-[10px] border-b-2 border-gray-400 font-bold">
                                    <th class="p-2 border-r">User Name</th>
                                    <th class="p-2 border-r text-right">CR</th>
                                    <th class="p-2 border-r text-right">Balance <span class="text-xs">🞁</span></th>
                                    <th class="p-2 border-r text-right">Client(P/L)</th>
                                    <th class="p-2 border-r text-right">Exposure</th>
                                    <th class="p-2 border-r text-right">Available Balance</th>
                                    <th class="p-2 border-r text-center">U st</th>
                                    <th class="p-2 border-r text-center">B st</th>
                                    <th class="p-2 border-r text-right">Exposure Limit</th>
                                    <th class="p-2 border-r text-center">Default(%)</th>
                                    <th class="p-2 border-r text-center">Account Type</th>
                                    <th class="p-2 text-center">Action</th>
                                </tr>
                                <tr class="bg-gray-200 text-gray-900 text-[11px] font-bold border-b border-gray-300">
                                    <td class="p-2 border-r">Total</td>
                                    <td class="p-2 border-r text-right">${totalCR.toLocaleString()}</td>
                                    <td class="p-2 border-r text-right">${totalBalance.toLocaleString()}</td>
                                    <td class="p-2 border-r text-right ${totalPL < 0 ? 'text-red-600' : 'text-gray-900'}">${totalPL.toLocaleString()}</td>
                                    <td class="p-2 border-r text-right">${totalExposure.toLocaleString()}</td>
                                    <td class="p-2 border-r text-right">${totalAvailBal.toLocaleString()}</td>
                                    <td class="p-2 border-r text-center"></td>
                                    <td class="p-2 border-r text-center"></td>
                                    <td class="p-2 border-r text-right">${totalExpLimit.toLocaleString()}</td>
                                    <td class="p-2 border-r text-center"></td>
                                    <td class="p-2 border-r text-center"></td>
                                    <td class="p-2 text-center"></td>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    </div>
                </main>

                ${getModalsHTML(loggedInUser)}
                ${getModalScriptsJS()}
            </body>
            </html>
        `);
    } catch(err) {
        console.error(err);
        res.redirect('/');
    }
});

// 8. ADD ACCOUNT FORM PAGE
app.get('/insertuser', async (req, res) => {
    const loggedInUser = req.query.username || 'Soniexchange';
    try {
        const userRef = doc(db, 'users', loggedInUser);
        const docSnap = await getDoc(userRef);
        const currentUser = docSnap.exists() ? docSnap.data() : { points: 100000000, role: 'ADMIN' };

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Add Account</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; }
                    .blue-box-title { background-color: #0077b6; color: #ffffff; padding: 5px 10px; font-weight: bold; font-size: 12px; }
                </style>
            </head>
            <body class="min-h-screen flex flex-col text-xs">
                ${getHeaderAndSidebar(loggedInUser, currentUser.role)}

                <main class="flex-1 p-3 max-w-6xl mx-auto w-full">
                    <h2 class="text-base font-bold text-gray-800 mb-3">Add Account</h2>
                    <form action="/api/clients/create" method="POST" class="space-y-4">
                        <input type="hidden" name="createdBy" value="${loggedInUser}">
                        <div class="border bg-white rounded-xs p-3">
                            <div class="grid grid-cols-2 gap-2">
                                <div><label class="block font-semibold">Client Name:</label><input type="text" name="clientName" required class="w-full border p-1 rounded"></div>
                                <div><label class="block font-semibold">User Password:</label><input type="password" name="password" required class="w-full border p-1 rounded"></div>
                            </div>
                        </div>
                        <button type="submit" class="bg-[#0077b6] text-white px-4 py-1.5 rounded font-bold">Create Account</button>
                    </form>
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

// 9. CREATE ACCOUNT API
app.post('/api/clients/create', async (req, res) => {
    const { clientName, password, createdBy, txnPassword, accountType, creditRef } = req.body;
    const pointsToGive = Number(creditRef) || 0;

    try {
        const creatorRef = doc(db, 'users', createdBy);
        const creatorSnap = await getDoc(creatorRef);
        if (!creatorSnap.exists()) return res.send(`<script>alert('Creator session error!'); window.location='/';</script>`);

        const creator = creatorSnap.data();
        if (creator.txnPassword && creator.txnPassword !== txnPassword) {
            return res.send(`<script>alert('Invalid Transaction Password!'); window.history.back();</script>`);
        }

        const newClientRef = doc(db, 'users', clientName);
        const newClientSnap = await getDoc(newClientRef);

        if (newClientSnap.exists()) {
            return res.send(`<script>alert('Client already exists!'); window.location='/insertuser?username=${encodeURIComponent(createdBy)}';</script>`);
        }

        await updateDoc(creatorRef, { points: (creator.points || 0) - pointsToGive });
        await setDoc(newClientRef, {
            username: clientName,
            password: password,
            role: accountType || 'Client',
            points: pointsToGive,
            creditRef: pointsToGive,
            exposure: 0,
            exposureLimit: 0,
            userActive: true,
            betActive: true,
            createdBy: createdBy,
            mustChangePassword: true,
            txnPassword: null,
            createdAt: new Date().toISOString()
        });

        res.send(`<script>alert('Account created successfully!'); window.location='/soni-view?username=${encodeURIComponent(createdBy)}';</script>`);
    } catch(err) {
        console.error(err);
        res.send(`<script>alert('Error creating account'); window.history.back();</script>`);
    }
});

// OTHER APIS (DEPOSIT, WITHDRAW, ETC.)
app.post('/api/deposit', async (req, res) => {
    const { loggedInUser, clientUsername, amount, txnPassword } = req.body;
    const depositAmount = Number(amount) || 0;
    try {
        const uploaderRef = doc(db, 'users', loggedInUser);
        const uploaderSnap = await getDoc(uploaderRef);
        const uploader = uploaderSnap.data();

        if (uploader.txnPassword && uploader.txnPassword !== txnPassword) {
            return res.send(`<script>alert('Invalid Transaction Password!'); window.history.back();</script>`);
        }

        const clientRef = doc(db, 'users', clientUsername);
        const clientSnap = await getDoc(clientRef);
        const clientData = clientSnap.data();

        await updateDoc(uploaderRef, { points: Number(uploader.points || 0) - depositAmount });
        await updateDoc(clientRef, { points: Number(clientData.points || 0) + depositAmount });

        res.send(`<script>alert('Deposit successful!'); window.location='/soni-view?username=${encodeURIComponent(loggedInUser)}';</script>`);
    } catch(err) {
        res.send(`<script>alert('Deposit error occurred'); window.history.back();</script>`);
    }
});

app.post('/api/withdraw', async (req, res) => {
    const { loggedInUser, clientUsername, amount, txnPassword } = req.body;
    const withdrawAmount = Number(amount) || 0;
    try {
        const uploaderRef = doc(db, 'users', loggedInUser);
        const uploaderSnap = await getDoc(uploaderRef);
        const uploader = uploaderSnap.data();

        if (uploader.txnPassword && uploader.txnPassword !== txnPassword) {
            return res.send(`<script>alert('Invalid Transaction Password!'); window.history.back();</script>`);
        }

        const clientRef = doc(db, 'users', clientUsername);
        const clientSnap = await getDoc(clientRef);
        const clientData = clientSnap.data();

        await updateDoc(clientRef, { points: Number(clientData.points || 0) - withdrawAmount });
        await updateDoc(uploaderRef, { points: Number(uploader.points || 0) + withdrawAmount });

        res.send(`<script>alert('Withdraw successful!'); window.location='/soni-view?username=${encodeURIComponent(loggedInUser)}';</script>`);
    } catch(err) {
        res.send(`<script>alert('Withdraw error occurred'); window.history.back();</script>`);
    }
});

app.post('/api/exposure-limit', async (req, res) => {
    const { loggedInUser, clientUsername, newLimit, txnPassword } = req.body;
    try {
        const uploaderRef = doc(db, 'users', loggedInUser);
        const uploaderSnap = await getDoc(uploaderRef);
        if (uploaderSnap.data().txnPassword !== txnPassword) {
            return res.send(`<script>alert('Invalid Transaction Password!'); window.history.back();</script>`);
        }
        await updateDoc(doc(db, 'users', clientUsername), { exposureLimit: Number(newLimit) || 0 });
        res.send(`<script>alert('Exposure limit updated!'); window.location='/soni-view?username=${encodeURIComponent(loggedInUser)}';</script>`);
    } catch(err) {
        res.send(`<script>alert('Error updating limit'); window.history.back();</script>`);
    }
});

app.post('/api/credit-update', async (req, res) => {
    const { loggedInUser, clientUsername, newCredit, txnPassword } = req.body;
    try {
        const uploaderRef = doc(db, 'users', loggedInUser);
        const uploaderSnap = await getDoc(uploaderRef);
        if (uploaderSnap.data().txnPassword !== txnPassword) {
            return res.send(`<script>alert('Invalid Transaction Password!'); window.history.back();</script>`);
        }
        await updateDoc(doc(db, 'users', clientUsername), { creditRef: Number(newCredit) || 0 });
        res.send(`<script>alert('Credit reference updated!'); window.location='/soni-view?username=${encodeURIComponent(loggedInUser)}';</script>`);
    } catch(err) {
        res.send(`<script>alert('Error updating credit'); window.history.back();</script>`);
    }
});

app.post('/api/client-password-update', async (req, res) => {
    const { loggedInUser, clientUsername, newPassword, confirmPassword, txnPassword } = req.body;
    if (newPassword !== confirmPassword) return res.send(`<script>alert('Passwords do not match!'); window.history.back();</script>`);
    try {
        const uploaderRef = doc(db, 'users', loggedInUser);
        const uploaderSnap = await getDoc(uploaderRef);
        if (uploaderSnap.data().txnPassword !== txnPassword) {
            return res.send(`<script>alert('Invalid Transaction Password!'); window.history.back();</script>`);
        }
        await updateDoc(doc(db, 'users', clientUsername), { password: newPassword, mustChangePassword: false });
        res.send(`<script>alert('Password updated successfully!'); window.location='/soni-view?username=${encodeURIComponent(loggedInUser)}';</script>`);
    } catch(err) {
        res.send(`<script>alert('Error updating password'); window.history.back();</script>`);
    }
});

app.post('/api/change-status', async (req, res) => {
    const { loggedInUser, clientUsername, userActive, betActive, txnPassword } = req.body;
    try {
        const uploaderRef = doc(db, 'users', loggedInUser);
        const uploaderSnap = await getDoc(uploaderRef);
        if (uploaderSnap.data().txnPassword !== txnPassword) {
            return res.send(`<script>alert('Invalid Transaction Password!'); window.history.back();</script>`);
        }
        await updateDoc(doc(db, 'users', clientUsername), {
            userActive: userActive === 'true',
            betActive: betActive === 'true'
        });
        res.send(`<script>alert('Status updated successfully!'); window.location='/soni-view?username=${encodeURIComponent(loggedInUser)}';</script>`);
    } catch(err) {
        res.send(`<script>alert('Error updating status'); window.history.back();</script>`);
    }
});

app.get('/logout', (req, res) => res.redirect('/'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
