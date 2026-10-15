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
                    createdBy: 'SYSTEM'
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

// 2. LOGIN PROCESS
app.post('/login-process', (req, res) => {
    let { username, password } = req.body;
    username = username ? username.trim() : '';
    password = password ? password.trim() : '';

    const db = readDB();
    let user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user || user.password !== password) {
        return res.send("<script>alert('Invalid Username or Password!'); window.history.back();</script>");
    }

    res.redirect(`/dashboard?username=${encodeURIComponent(user.username)}`);
});

// COMMON HEADER & 39 SPORTS SIDEBAR WITH ABSOLUTE RELIABLE JS
function getHeaderAndSidebar(loggedInUser) {
    return `
        <!-- TOP NAVBAR -->
        <header class="bg-[#0077b6] text-white px-3 py-1.5 flex items-center justify-between shadow-md text-[11px] whitespace-nowrap overflow-x-auto relative" style="z-index: 50;">
            <div class="flex items-center space-x-3">
                <span class="font-serif font-black text-xl tracking-wider text-white">Soni</span>
                <button type="button" id="sidebarToggleBtn" class="text-white hover:bg-black/25 px-2 py-1 rounded focus:outline-none cursor-pointer">
                    <i class="fa-solid fa-bars text-base pointer-events-none"></i>
                </button>
                <nav class="flex items-center space-x-2 font-medium">
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
                <span class="font-semibold text-white">${loggedInUser} ▾</span>
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

                if (toggleBtn) {
                    toggleBtn.onclick = openSidebar;
                }
                if (closeBtn) {
                    closeBtn.onclick = closeSidebar;
                }
                if (overlay) {
                    overlay.onclick = closeSidebar;
                }
            });
        </script>
    `;
}

// 3. MAIN DASHBOARD PAGE (BLANK SCREEN BY DEFAULT)
app.get('/dashboard', (req, res) => {
    const loggedInUser = req.query.username || 'Soniexchange';

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Soni Exchange - Dashboard</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>body { font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; }</style>
        </head>
        <body class="min-h-screen flex flex-col text-xs">
            ${getHeaderAndSidebar(loggedInUser)}
            <main class="flex-1 p-3"></main>
        </body>
        </html>
    `);
});

// 4. ADD ACCOUNT FORM (ON "List of Clients" CLICK)
app.get('/insertuser', (req, res) => {
    const loggedInUser = req.query.username || 'Soniexchange';

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Soni Exchange - Add Account</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>body { font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; }</style>
        </head>
        <body class="min-h-screen flex flex-col text-xs">
            ${getHeaderAndSidebar(loggedInUser)}

            <main class="flex-1 p-3 overflow-y-auto max-w-5xl mx-auto w-full">
                <div class="bg-white border rounded shadow-sm p-4">
                    <h2 class="font-bold text-gray-800 text-base mb-3 border-b pb-1">Add Account</h2>
                    
                    <form action="/api/clients/create" method="POST" onsubmit="return validateForm()" class="space-y-4">
                        <input type="hidden" name="createdBy" value="${loggedInUser}">
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Personal Detail Box -->
                            <div class="border rounded p-3 bg-white shadow-xs">
                                <div class="bg-[#2c3e50] text-white px-2 py-1 font-bold text-[11px] mb-3 rounded-sm">Personal Detail</div>
                                <div class="space-y-2.5">
                                    <div>
                                        <label class="block text-gray-700 font-semibold mb-0.5">Client Name:</label>
                                        <input type="text" id="clientName" name="clientName" required placeholder="ATOM3" class="w-full border border-gray-300 p-1.5 rounded bg-gray-50 text-xs focus:outline-none focus:border-cyan-500">
                                        <p id="nameError" class="text-red-500 text-[10px] mt-0.5 hidden">The username field must start with a Capital character!</p>
                                    </div>
                                    <div>
                                        <label class="block text-gray-700 font-semibold mb-0.5">User Password:</label>
                                        <input type="password" id="password" name="password" required placeholder="••••••••••••" class="w-full border border-gray-300 p-1.5 rounded bg-gray-50 text-xs focus:outline-none focus:border-cyan-500">
                                    </div>
                                    <div>
                                        <label class="block text-gray-700 font-semibold mb-0.5">Retype Password:</label>
                                        <input type="password" id="retypePassword" name="retypePassword" required placeholder="Retype Password" class="w-full border border-gray-300 p-1.5 rounded bg-gray-50 text-xs focus:outline-none focus:border-cyan-500">
                                        <p id="passError" class="text-red-500 text-[10px] mt-0.5 hidden">Password must start with Capital letter and contain special character ($ ¢ ¥ @ #)!</p>
                                    </div>
                                    <div>
                                        <label class="block text-gray-700 font-semibold mb-0.5">Full Name:</label>
                                        <input type="text" name="fullName" placeholder="Full Name" class="w-full border border-gray-300 p-1.5 rounded bg-gray-50 text-xs">
                                    </div>
                                    <div>
                                        <label class="block text-gray-700 font-semibold mb-0.5">City:</label>
                                        <input type="text" name="city" placeholder="City" class="w-full border border-gray-300 p-1.5 rounded bg-gray-50 text-xs">
                                    </div>
                                    <div>
                                        <label class="block text-gray-700 font-semibold mb-0.5">Phone:</label>
                                        <input type="text" name="phone" placeholder="Phone Number" class="w-full border border-gray-300 p-1.5 rounded bg-gray-50 text-xs">
                                    </div>
                                </div>
                            </div>

                            <!-- Account Detail Box -->
                            <div class="border rounded p-3 bg-white shadow-xs">
                                <div class="bg-[#2c3e50] text-white px-2 py-1 font-bold text-[11px] mb-3 rounded-sm">Account Detail</div>
                                <div class="space-y-2.5">
                                    <div>
                                        <label class="block text-gray-700 font-semibold mb-0.5">Account Type:</label>
                                        <select name="accountType" class="w-full border border-gray-300 p-1.5 rounded bg-gray-50 text-xs">
                                            <option value="">Select Account Type</option>
                                            <option value="Super">Super</option>
                                            <option value="Master">Master</option>
                                            <option value="Client">Client</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-gray-700 font-semibold mb-0.5">Credit Reference:</label>
                                        <input type="number" name="creditRef" placeholder="Credit Reference" class="w-full border border-gray-300 p-1.5 rounded bg-gray-50 text-xs">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Commission Settings -->
                        <div class="border rounded p-3 bg-white shadow-xs">
                            <div class="bg-[#2c3e50] text-white px-2 py-1 font-bold text-[11px] mb-3 rounded-sm">Commission Settings</div>
                            <div class="grid grid-cols-3 gap-2 text-gray-600 font-semibold bg-gray-100 p-2 rounded text-[11px]">
                                <div>Upline: <span class="font-normal text-gray-800">0</span></div>
                                <div>Downline: <span class="font-normal text-gray-800">0</span></div>
                                <div>Our: <span class="font-normal text-gray-800">0</span></div>
                            </div>
                        </div>

                        <!-- Partnership -->
                        <div class="border rounded p-3 bg-white shadow-xs">
                            <div class="bg-[#2c3e50] text-white px-2 py-1 font-bold text-[11px] mb-3 rounded-sm">Partnership</div>
                            <div class="grid grid-cols-3 gap-2 text-gray-600 font-semibold bg-gray-100 p-2 rounded text-[11px]">
                                <div>Upline: <span class="font-normal text-gray-800">0</span></div>
                                <div>Downline: <span class="font-normal text-gray-800">0</span></div>
                                <div>Our: <span class="font-normal text-gray-800">0</span></div>
                            </div>
                        </div>

                        <!-- Transaction Password & Button -->
                        <div class="flex flex-col items-end space-y-2 pt-2">
                            <div class="w-full sm:w-64">
                                <label class="block text-gray-700 font-semibold mb-0.5">Transaction Password:</label>
                                <input type="password" name="txnPassword" required placeholder="Transaction Password" class="w-full border border-gray-300 p-1.5 rounded bg-gray-50 text-xs">
                            </div>
                            <button type="submit" class="bg-[#0077b6] hover:bg-[#005f9e] text-white font-bold px-4 py-2 rounded text-xs shadow transition">Create Account</button>
                        </div>
                    </form>
                </div>
            </main>

            <script>
                function validateForm() {
                    let clientName = document.getElementById('clientName').value;
                    let password = document.getElementById('password').value;
                    let retypePassword = document.getElementById('retypePassword').value;
                    
                    let nameError = document.getElementById('nameError');
                    let passError = document.getElementById('passError');

                    let valid = true;

                    let firstLetterName = clientName.charAt(0);
                    if (firstLetterName !== firstLetterName.toUpperCase() || firstLetterName === firstLetterName.toLowerCase()) {
                        nameError.classList.remove('hidden');
                        valid = false;
                    } else {
                        nameError.classList.add('hidden');
                    }

                    let firstLetterPass = password.charAt(0);
                    let hasSpecialChar = /[$¢¥@#!%*?&^()_+\-=\[\]{};':\"\\\\|,.<>\/?]/.test(password);

                    if (firstLetterPass !== firstLetterPass.toUpperCase() || firstLetterPass === firstLetterPass.toLowerCase() || !hasSpecialChar) {
                        passError.classList.remove('hidden');
                        valid = false;
                    } else {
                        passError.classList.add('hidden');
                    }

                    if (password !== retypePassword) {
                        alert('Passwords do not match!');
                        valid = false;
                    }

                    if (!valid) {
                        alert('Rule Error: Client Name & Password ka pehla letter Capital hona chahiye aur Password mein special character ($ ¢ ¥ @ #) hona zaroori hai!');
                    }

                    return valid;
                }
            </script>
        </body>
        </html>
    `);
});

// CREATE CLIENT API
app.post('/api/clients/create', (req, res) => {
    const { clientName, createdBy } = req.body;
    const db = readDB();

    if (db.users.find(u => u.username.toLowerCase() === clientName.toLowerCase())) {
        return res.send(`<script>alert('Client already exists!'); window.location='/insertuser?username=${encodeURIComponent(createdBy || 'Soniexchange')}';</script>`);
    }

    db.users.push({
        username: clientName,
        password: req.body.password,
        role: req.body.accountType || 'USER',
        points: Number(req.body.creditRef) || 0,
        createdBy: createdBy || 'Soniexchange',
        createdAt: new Date()
    });
    writeDB(db);
    res.send(`<script>alert('Account created successfully!'); window.location='/dashboard?username=${encodeURIComponent(createdBy || 'Soniexchange')}';</script>`);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running!'));
