const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const DB_FILE = './database.json';

function readDB() {
    if (!fs.existsSync(DB_FILE)) {
        const initialData = {
            users: [
                {
                    username: 'Soniexchange',
                    password: 'Lyy@5656',
                    role: 'ADMIN',
                    points: 100000000,
                    usedPoints: 0,
                    createdBy: 'SYSTEM',
                    mustChangePassword: false,
                    txnPassword: '745398' // Aapka official transaction password
                }
            ]
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_FILE));
}

function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

readDB();

// 1. SIGN IN PAGE
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Soni - Sign In</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-[#116491] min-h-screen flex flex-col items-center justify-center p-6 text-white font-sans">
            <div class="flex flex-col items-center justify-center w-full max-w-sm">
                <h1 class="text-5xl font-serif font-bold tracking-widest mb-8 text-white">Soni</h1>
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

// 2. LOGIN PROCESS & FIRST-TIME PASSWORD CHECK
app.post('/login-process', (req, res) => {
    let { username, password } = req.body;
    username = username ? username.trim() : '';
    password = password ? password.trim() : '';

    const db = readDB();
    let user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user || user.password !== password) {
        return res.send("<script>alert('Invalid Username or Password!'); window.history.back();</script>");
    }

    if (user.mustChangePassword) {
        return res.redirect(`/change-password?username=${encodeURIComponent(user.username)}`);
    }

    res.redirect(`/dashboard?username=${encodeURIComponent(user.username)}`);
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

// 4. UPDATE PASSWORD API & 6-DIGIT TXN PASSWORD GENERATOR
app.post('/api/update-password', (req, res) => {
    const { username, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
        return res.send("<script>alert('Passwords do not match!'); window.history.back();</script>");
    }

    const db = readDB();
    let user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
        return res.send("<script>alert('User not found!'); window.location='/';</script>");
    }

    const txnPass = Math.floor(100000 + Math.random() * 900000).toString();

    user.password = newPassword;
    user.mustChangePassword = false;
    user.txnPassword = txnPass;
    writeDB(db);

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
                    Remember this transaction password, from now on all transactions can be done only with this password. Do not share this password with anyone.<br>
                    लेन-देन के पासवर्ड को याद रखें, अब से वेबसाइट के सभी हस्तांतरण इसी से किए जा सकते हैं और इस पासवर्ड को किसी के साथ साझा न करें।
                </p>
                <a href="/" class="inline-block bg-[#0077b6] text-white font-bold px-6 py-2 rounded text-xs">Back to Login</a>
            </div>
        </body>
        </html>
    `);
});

// COMMON HEADER & 39 SPORTS SIDEBAR
function getHeaderAndSidebar(loggedInUser, userRole) {
    return `
        <!-- TOP NAVBAR -->
        <header class="bg-[#0077b6] text-white px-3 py-1.5 flex items-center justify-between shadow-md text-[11px] whitespace-nowrap overflow-x-auto relative" style="z-index: 50;">
            <div class="flex items-center space-x-3">
                <span class="font-serif font-black text-xl tracking-wider text-white">Soni</span>
                <button type="button" id="sidebarToggleBtn" class="text-white hover:bg-black/25 px-2 py-1 rounded focus:outline-none cursor-pointer">
                    <i class="fa-solid fa-bars text-base pointer-events-none"></i>
                </button>
                <nav class="flex items-center space-x-2 font-medium">
                    <a href="/dashboard?username=${encodeURIComponent(loggedInUser)}" class="hover:bg-black/20 px-2 py-1 rounded">Dashboard</a>
                    <a href="/insertuser?username=${encodeURIComponent(loggedInUser)}" class="hover:bg-black/20 px-2 py-1 rounded">List of Clients</a>
                    <a href="#" class="hover:bg-black/20 px-2 py-1 rounded">Assign Agent</a>
                    <a href="#" class="hover:bg-black/20 px-2 py-1 rounded">Market Analysis</a>
                    <a href="#" class="hover:bg-black/20 px-2 py-1 rounded">Live Market ▾</a>
                    <a href="#" class="hover:bg-black/20 px-2 py-1 rounded">Live Virtual Market ▾</a>
                    <a href="#" class="hover:bg-black/20 px-2 py-1 rounded">Reports ▾</a>
                    <a href="#" class="hover:bg-black/20 px-2 py-1 rounded">Multi Login</a>
                </nav>
            </div>

            <div class="flex items-center space-x-2 ml-4">
                <span class="font-semibold text-white">${loggedInUser} (${userRole}) ▾</span>
                <a href="/" class="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded text-[10px] font-bold">Logout</a>
                <div class="relative ml-1">
                    <input type="text" placeholder="All Client" class="text-black bg-white px-2 py-0.5 pr-6 rounded text-[11px] w-28 focus:outline-none">
                    <i class="fa-solid fa-magnifying-glass absolute right-1.5 top-1.5 text-gray-500 text-[10px]"></i>
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
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Badminton</span> 
