const express = require('express');
const router = express.Router();
const { db, bot } = require('../config/firebase');
const { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc } = require('firebase/firestore');

// --- TOP HEADER BAR & SIDEBAR FUNCTION ---
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

                <!-- HEADER SEARCH BOX -->
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

        <!-- SPORTS SIDEBAR MENU -->
        <aside id="sportsSidebar" class="w-64 bg-white text-gray-800 flex flex-col fixed inset-y-0 left-0 transform -translate-x-full transition-transform duration-300 ease-in-out shadow-2xl border-r" style="z-index: 999999;">
            <div class="p-3 bg-[#0077b6] text-white flex justify-between items-center">
                <span class="font-bold text-sm">Sports</span>
                <button type="button" id="sidebarCloseBtn" class="text-white hover:text-gray-200 cursor-pointer"><i class="fa-solid fa-xmark text-base pointer-events-none"></i></button>
            </div>
            <div class="flex-1 overflow-y-auto p-2 space-y-1 text-[11px] font-semibold text-gray-700">
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Football</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Tennis</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Cricket</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Basketball</span> <span>+</span></div>
            </div>
        </aside>
        <div id="sidebarOverlay" class="fixed inset-0 bg-black/50 hidden" style="z-index: 999998;"></div>
    `;
}

// --- LOGIN ROUTE ---
router.get('/', (req, res) => {
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

// --- LOGIN PROCESS ROUTE ---
router.post('/login-process', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userRef = doc(db, 'users', username);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists() || docSnap.data().password !== password) {
            return res.send(`<script>alert('Invalid Username or Password'); window.location.href='/';</script>`);
        }

        const userData = docSnap.data();
        req.session.user = username;
        req.session.role = userData.role || 'CLIENT';

        res.redirect(`/soni-view?username=${encodeURIComponent(username)}`);
    } catch (err) {
        console.error("Login error:", err);
        res.send(`<script>alert('Login failed. Please try again.'); window.location.href='/';</script>`);
    }
});

// --- LOGOUT ROUTE ---
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

module.exports = router;

