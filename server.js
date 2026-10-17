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
        mustChangePassword: false,
        txnPassword: '745398',
        createdAt: new Date().toISOString()
      });
      console.log('Master Admin Soniexchange created in Firebase!');
    }
  } catch (err) {
    console.error('Error initializing Master Admin:', err);
  }
}
initMasterAdmin();

// TOP HEADER BAR
function getHeaderAndSidebar(loggedInUser, userRole) {
    return `
        <!-- TOP NAVBAR -->
        <header class="bg-[#0077b6] text-white px-3 py-1.5 flex items-center justify-between text-[11px] whitespace-nowrap overflow-x-auto relative shadow-sm" style="z-index: 50; min-height: 40px;">
            <div class="flex items-center space-x-3">
                <span class="font-bold text-sm tracking-wide text-white">Soni</span>
                <button type="button" id="sidebarToggleBtn" class="text-white hover:bg-black/20 px-1.5 py-0.5 rounded focus:outline-none cursor-pointer">
                    <i class="fa-solid fa-bars text-sm pointer-events-none"></i>
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

            <div class="flex items-center space-x-3 ml-4">
                <span class="font-normal text-white text-[11px]">${loggedInUser} ▾</span>
                <a href="/logout" class="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded text-[10px] font-bold">Logout</a>
                <form onsubmit="return handleClientSearch(event)" class="relative ml-1 flex items-center">
                    <input type="text" id="headerSearchInput" placeholder="Soni" class="text-black bg-white px-2 py-0.5 pr-6 rounded-xs text-[11px] w-28 focus:outline-none border border-gray-300">
                    <button type="submit" class="absolute right-1.5 text-gray-600 text-[11px]">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </button>
                </form>
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
            });

            function handleClientSearch(e) {
                e.preventDefault();
                const q = document.getElementById('headerSearchInput').value;
                if(q) {
                    alert('Searching: ' + q);
                }
            }
        </script>
    `;
}

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
                        Remember this transaction password, from now on all transactions can be done only with this password. Do not share this password with anyone.<br>
                        लेन-देन के पासवर्ड को याद रखें, अब से वेबसाइट के सभी हस्तांतरण इसी से किए जा सकते हैं और इस पासवर्ड को किसी के साथ साझा न करें।
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
                <main class="flex-1 p-3"></main>
            </body>
            </html>
        `);
    } catch(err) {
        res.redirect('/');
    }
});

// 6. ACCOUNT LIST PAGE (/users)
app.get('/users', async (req, res) => {
    const loggedInUser = req.query.username || 'Soniexchange';
    try {
        const userRef = doc(db, 'users', loggedInUser);
        const docSnap = await getDoc(userRef);
        const currentUser = docSnap.exists() ? docSnap.data() : { role: 'ADMIN' };

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
                <td class="p-2 border-r text-right font-semibold">${Number(u.points || 0).toLocaleString()}</td>
                <td class="p-2 border-r text-center">
                    <div class="inline-flex items-center justify-center w-4 h-4 bg-black text-white rounded-xs text-[10px] font-bold">✓</div>
                </td>
                <td class="p-2 border-r text-center">
                    <div class="inline-flex items-center justify-center w-4 h-4 bg-black text-white rounded-xs text-[10px] font-bold">✓</div>
                </td>
                <td class="p-2 border-r text-right">${Number(u.exposure || 0).toLocaleString()}</td>
                <td class="p-2 border-r text-center">${u.defaultPct || 0}</td>
                <td class="p-2 border-r text-center">${u.role || 'User'}</td>
                <td class="p-1.5 text-center">
                    <div class="flex items-center justify-center space-x-1">
                        <button class="bg-[#343a40] hover:bg-black text-white px-1.5 py-0.5 rounded text-[10px] font-bold">D</button>
                        <button class="bg-[#343a40] hover:bg-black text-white px-1.5 py-0.5 rounded text-[10px] font-bold">W</button>
                        <button class="bg-[#343a40] hover:bg-black text-white px-1.5 py-0.5 rounded text-[10px] font-bold">L</button>
                        <button class="bg-[#343a40] hover:bg-black text-white px-1.5 py-0.5 rounded text-[10px] font-bold">C</button>
                        <button class="bg-[#343a40] hover:bg-black text-white px-1.5 py-0.5 rounded text-[10px] font-bold">P</button>
                        <button class="bg-[#343a40] hover:bg-black text-white px-1.5 py-0.5 rounded text-[10px] font-bold">S</button>
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
                <style>body { font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; }</style>
            </head>
            <body class="min-h-screen flex flex-col text-xs">
                ${getHeaderAndSidebar(loggedInUser, currentUser.role)}

                <main class="flex-1 p-3 max-w-7xl mx-auto w-full">
                    <div class="flex justify-between items-center mb-3">
                        <h2 class="text-base font-bold text-gray-800">Account List</h2>
                        <a href="/insertuser?username=${encodeURIComponent(loggedInUser)}" class="bg-[#0088cc] hover:bg-[#006699] text-white px-3 py-1 rounded text-xs font-semibold shadow-xs">Add Account</a>
                    </div>

                    <div class="flex space-x-1 mb-3">
                        <button class="bg-[#dc3545] text-white px-2.5 py-1 rounded-xs text-[11px] font-bold flex items-center space-x-1">
                            <i class="fa-regular fa-file-pdf"></i> <span>PDF</span>
                        </button>
                        <button class="bg-[#28a745] text-white px-2.5 py-1 rounded-xs text-[11px] font-bold flex items-center space-x-1">
                            <i class="fa-regular fa-file-excel"></i> <span>Excel</span>
                        </button>
                    </div>

                    <div class="flex flex-col sm:flex-row justify-between items-center mb-3 gap-2 text-[11px]">
                        <div class="flex items-center space-x-1">
                            <span>Show</span>
                            <select class="border rounded p-1 bg-white text-xs focus:outline-none">
                                <option>10</option>
                                <option>25</option>
                                <option>50</option>
                                <option>100</option>
                            </select>
                            <span>entries</span>
                        </div>

                        <div class="flex items-center space-x-1">
                            <span class="font-semibold">Search:</span>
                            <input type="text" placeholder="Search..." class="border p-1 rounded bg-white text-xs focus:outline-none w-36">
                            <button class="bg-[#0088cc] text-white px-2.5 py-1 rounded-xs font-semibold">Load</button>
                            <button class="bg-[#6c757d] text-white px-2.5 py-1 rounded-xs font-semibold">Reset</button>
                        </div>
                    </div>

                    <div class="bg-white border rounded shadow-xs overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-gray-100 text-gray-700 text-[11px] border-b font-bold">
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
            </body>
            </html>
        `);
    } catch(err) {
        console.error(err);
        res.redirect('/');
    }
});

// 7. ADD ACCOUNT FORM PAGE
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
                    .dark-box-title { background-color: #2b3a4a; color: #ffffff; padding: 4px 8px; font-weight: bold; font-size: 11px; }
                    .table-row-bg { background-color: #f8f9fa; }
                    
                    .input-state-red {
                        border: 1.5px solid #ef4444 !important;
                        background-color: #fef2f2 !important;
                    }
                    .input-state-green {
                        border: 1.5px solid #10b981 !important;
                        background-color: #ffffff !important;
                    }
                </style>
            </head>
            <body class="min-h-screen flex flex-col text-xs">
                ${getHeaderAndSidebar(loggedInUser, currentUser.role)}

                <main class="flex-1 p-3 max-w-6xl mx-auto w-full">
                    <h2 class="text-base font-bold text-gray-800 mb-3">Add Account</h2>

                    <form id="createAccountForm" action="/api/clients/create" method="POST" class="space-y-4">
                        <input type="hidden" name="createdBy" value="${loggedInUser}">

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="border bg-white rounded-xs shadow-xs">
                                <div class="dark-box-title">Personal Detail</div>
                                <div class="p-3 space-y-2 text-[11px]">
                                    <div class="grid grid-cols-2 gap-2">
                                        <div>
                                            <label class="block text-gray-700 font-semibold mb-0.5">Client Name:</label>
                                            <div class="relative">
                                                <input type="text" id="clientName" name="clientName" required placeholder="Client Name" class="w-full border p-1 pr-6 rounded text-xs focus:outline-none">
                                                <span id="nameIcon" class="absolute right-1.5 top-1/2 -translate-y-1/2 font-bold text-xs pointer-events-none hidden"></span>
                                            </div>
                                            <p id="nameError" class="text-red-500 text-[10px] mt-0.5 hidden"></p>
                                        </div>

                                        <div>
                                            <label class="block text-gray-700 font-semibold mb-0.5">User Password:</label>
                                            <div class="relative">
                                                <input type="password" id="password" name="password" required placeholder="User Password" class="w-full border p-1 pr-6 rounded text-xs focus:outline-none">
                                                <span id="passIcon" class="absolute right-1.5 top-1/2 -translate-y-1/2 font-bold text-xs pointer-events-none hidden"></span>
                                            </div>
                                            <p id="passError" class="text-red-500 text-[10px] mt-0.5 hidden"></p>
                                        </div>
                                    </div>

                                    <div class="grid grid-cols-2 gap-2">
                                        <div>
                                            <label class="block text-gray-700 font-semibold mb-0.5">Retype Password:</label>
                                            <input type="password" id="retypePassword" name="retypePassword" required placeholder="Retype Password" class="w-full border p-1 rounded bg-white text-xs focus:outline-none">
                                        </div>
                                        <div>
                                            <label class="block text-gray-700 font-semibold mb-0.5">Full Name:</label>
                                            <input type="text" name="fullName" placeholder="Full Name" class="w-full border p-1 rounded bg-white text-xs">
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2">
                                        <div>
                                            <label class="block text-gray-700 font-semibold mb-0.5">City:</label>
                                            <input type="text" name="city" placeholder="City" class="w-full border p-1 rounded bg-white text-xs">
                                        </div>
                                        <div>
                                            <label class="block text-gray-700 font-semibold mb-0.5">Phone:</label>
                                            <input type="text" name="phone" placeholder="Phone Number" class="w-full border p-1 rounded bg-white text-xs">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="border bg-white rounded-xs shadow-xs">
                                <div class="dark-box-title">Account Detail</div>
                                <div class="p-3 space-y-2 text-[11px]">
                                    <div class="grid grid-cols-2 gap-2">
                                        <div>
                                            <label class="block text-gray-700 font-semibold mb-0.5">Account Type:</label>
                                            <select name="accountType" id="accountType" class="w-full border p-1 rounded bg-white text-xs">
                                                <option value="">Select Account Type</option>
                                                ${currentUser.role === 'ADMIN' ? '<option value="Super">Super</option>' : ''}
                                                <option value="Master">Master</option>
                                                <option value="Client">Client</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-gray-700 font-semibold mb-0.5">Credit Reference:</label>
                                            <input type="number" id="creditRef" name="creditRef" required placeholder="Credit Reference" class="w-full border p-1 rounded bg-white text-xs">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="border bg-white rounded-xs shadow-xs">
                            <div class="dark-box-title">Commission Settings</div>
                            <div class="p-2 overflow-x-auto">
                                <table class="w-full text-left text-[11px] border border-gray-200">
                                    <tr class="table-row-bg border-b"><td class="p-1.5 font-semibold w-32 border-r">Upline</td><td class="p-1.5">0</td></tr>
                                    <tr class="border-b"><td class="p-1.5 font-semibold border-r">Downline</td><td class="p-1.5">0</td></tr>
                                    <tr class="table-row-bg"><td class="p-1.5 font-semibold border-r">Our</td><td class="p-1.5">0</td></tr>
                                </table>
                            </div>
                        </div>

                        <div class="border bg-white rounded-xs shadow-xs">
                            <div class="dark-box-title">Partnership</div>
                            <div class="p-2 overflow-x-auto">
                                <table class="w-full text-left text-[11px] border border-gray-200">
                                    <tr class="table-row-bg border-b"><td class="p-1.5 font-semibold w-32 border-r">Upline</td><td class="p-1.5">0</td></tr>
                                    <tr class="border-b"><td class="p-1.5 font-semibold border-r">Downline</td><td class="p-1.5">0</td></tr>
                                    <tr class="table-row-bg"><td class="p-1.5 font-semibold border-r">Our</td><td class="p-1.5">0</td></tr>
                                </table>
                            </div>
                        </div>

                        <div class="flex flex-col items-end space-y-2 pt-2">
                            <div class="w-full sm:w-64">
                                <label class="block text-gray-700 font-semibold mb-0.5 text-[11px]">Transaction Password:</label>
                                <input type="password" name="txnPassword" required placeholder="Transaction Password" class="w-full border p-1.5 rounded bg-white text-xs focus:outline-none">
                            </div>
                            <button type="submit" class="bg-[#0088cc] hover:bg-[#006699] text-white font-bold px-4 py-2 rounded text-xs shadow-xs transition">Create Account</button>
                        </div>
                    </form>
                </main>

                <script>
                    document.addEventListener('DOMContentLoaded', function() {
                        const nameInput = document.getElementById('clientName');
                        const nameError = document.getElementById('nameError');
                        const nameIcon = document.getElementById('nameIcon');

                        const passInput = document.getElementById('password');
                        const passError = document.getElementById('passError');
                        const passIcon = document.getElementById('passIcon');

                        let isNameValid = false;
                        let isPassValid = false;

                        function setFieldState(input, errorElement, iconElement, isValid, errorMessage) {
                            input.classList.remove('input-state-red', 'input-state-green');
                            if (isValid) {
                                input.classList.add('input-state-green');
                                errorElement.style.display = 'none';
                                iconElement.textContent = '✓';
                                iconElement.className = 'absolute right-1.5 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-sm pointer-events-none block';
                            } else {
                                input.classList.add('input-state-red');
                                errorElement.textContent = errorMessage;
                                errorElement.style.display = 'block';
                                iconElement.textContent = '✕';
                                iconElement.className = 'absolute right-1.5 top-1/2 -translate-y-1/2 text-red-500 font-bold text-xs pointer-events-none block';
                            }
                        }

                        function validateClientName() {
                            const val = nameInput.value.trim();

                            if (val === '') {
                                nameInput.classList.remove('input-state-red', 'input-state-green');
                                nameError.style.display = 'none';
                                nameIcon.style.display = 'none';
                                isNameValid = false;
                                return;
                            }
                            if (val.length < 4) {
                                setFieldState(nameInput, nameError, nameIcon, false, "The clientname field must be at least 4 characters");
                                isNameValid = false;
                                return;
                            }
                            const isFirstCapital = /^[A-Z]/.test(val);
                            const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(val);

                            if (!isFirstCapital || !isAlphanumeric) {
                                setFieldState(nameInput, nameError, nameIcon, false, "Must start with Capital letter & contain alpha-numeric characters");
                                isNameValid = false;
                                return;
                            }

                            setFieldState(nameInput, nameError, nameIcon, true, "");
                            isNameValid = true;
                        }

                        function validatePassword() {
                            const val = passInput.value;

                            if (!val || val.trim().length === 0) {
                                passInput.classList.remove('input-state-red', 'input-state-green');
                                passError.style.display = 'none';
                                passIcon.style.display = 'none';
                                isPassValid = false;
                                return;
                            }
                            if (val.length < 4) {
                                setFieldState(passInput, passError, passIcon, false, "The password field must be at least 4 characters");
                                isPassValid = false;
                                return;
                            }
                            const isFirstCapital = /^[A-Z]/.test(val);
                            const hasSpecialChar = /[$¢¥€@#!%*?&^()_+\-=\[\]{};':\"\\\\|,.<>\/?]/.test(val);

                            if (!isFirstCapital || !hasSpecialChar) {
                                setFieldState(passInput, passError, passIcon, false, "Must start with Capital letter and contain special character");
                                isPassValid = false;
                                return;
                            }

                            setFieldState(passInput, passError, passIcon, true, "");
                            isPassValid = true;
                        }

                        nameInput.addEventListener('input', validateClientName);
                        nameInput.addEventListener('keyup', validateClientName);

                        passInput.addEventListener('input', validatePassword);
                        passInput.addEventListener('keyup', validatePassword);

                        document.getElementById('createAccountForm').onsubmit = function(e) {
                            validateClientName();
                            validatePassword();

                            if (!isNameValid) {
                                alert('Please provide a valid Client Name');
                                e.preventDefault();
                                return false;
                            }

                            if (!isPassValid) {
                                alert('Please provide a valid Password');
                                e.preventDefault();
                                return false;
                            }

                            const retype = document.getElementById('retypePassword').value;
                            if (passInput.value !== retype) {
                                alert('Passwords do not match!');
                                e.preventDefault();
                                return false;
                            }

                            return true;
                        };
                    });
                </script>
            </body>
            </html>
        `);
    } catch(err) {
        res.redirect('/');
    }
});

// 8. CREATE ACCOUNT API
app.post('/api/clients/create', async (req, res) => {
    const { clientName, password, createdBy, txnPassword, accountType, creditRef } = req.body;
    const pointsToGive = Number(creditRef) || 0;

    const isFirstCapitalName = /^[A-Z]/.test(clientName);
    const isAlphanumericName = /^[a-zA-Z0-9]+$/.test(clientName);
    if (clientName.length < 4 || !isFirstCapitalName || !isAlphanumericName) {
        return res.send(`<script>alert('Client Name kam se kam 4 characters, pehla letter Capital aur alphanumeric hona chahiye!'); window.history.back();</script>`);
    }

    const isFirstCapitalPass = /^[A-Z]/.test(password);
    const hasSpecialChar = /[$¢¥€@#!%*?&^()_+\-=\[\]{};':\"\\\\|,.<>\/?]/.test(password);
    if (password.length < 4 || !isFirstCapitalPass || !hasSpecialChar) {
        return res.send(`<script>alert('Password ka pehla letter Capital aur special character hona aavashyak hai!'); window.history.back();</script>`);
    }

    try {
        const creatorRef = doc(db, 'users', createdBy);
        const creatorSnap = await getDoc(creatorRef);

        if (!creatorSnap.exists()) {
            return res.send(`<script>alert('Creator session error!'); window.location='/';</script>`);
        }

        const creator = creatorSnap.data();

        if (creator.txnPassword && creator.txnPassword !== txnPassword) {
            return res.send(`<script>alert('Invalid Transaction Password!'); window.history.back();</script>`);
        }

        const newClientRef = doc(db, 'users', clientName);
        const newClientSnap = await getDoc(newClientRef);

        if (newClientSnap.exists()) {
            return res.send(`<script>alert('Client already exists!'); window.location='/insertuser?username=${encodeURIComponent(createdBy)}';</script>`);
        }

        if (creator.role !== 'ADMIN') {
            await updateDoc(creatorRef, {
                points: (creator.points || 0) - pointsToGive
            });
        }

        await setDoc(newClientRef, {
            username: clientName,
            password: password,
            role: accountType || 'Client',
            points: pointsToGive,
            createdBy: createdBy,
            mustChangePassword: true,
            txnPassword: null,
            createdAt: new Date().toISOString()
        });

        res.send(`<script>alert('Account created successfully and saved in Firebase!'); window.location='/users?username=${encodeURIComponent(createdBy)}';</script>`);
    } catch(err) {
        console.error(err);
        res.send(`<script>alert('Error creating account'); window.history.back();</script>`);
    }
});

// LOGOUT ROUTE
app.get('/logout', (req, res) => {
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
