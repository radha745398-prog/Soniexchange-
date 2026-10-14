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
                    username: 'SuperAdmin',
                    password: 'password123',
                    mustChangePassword: false,
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
        <body class="bg-[#116491] min-h-screen flex flex-col items-center justify-between p-6 text-white font-sans">
            <div class="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
                <h1 class="text-5xl font-serif font-bold tracking-widest mb-8 text-white">Soni</h1>
                <div class="bg-white text-gray-800 rounded-lg shadow-2xl p-6 w-full">
                    <div class="flex items-center justify-center mb-6">
                        <div class="border-t border-gray-300 flex-grow mr-3"></div>
                        <span class="text-gray-600 text-sm font-semibold">Sign In</span>
                        <div class="border-t border-gray-300 flex-grow ml-3"></div>
                    </div>
                    <form action="/login-process" method="POST" class="space-y-4">
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

// LOGIN PROCESS
app.post('/login-process', (req, res) => {
    const { username, password } = req.body;
    const db = readDB();
    let user = db.users.find(u => u.username === username);
    
    if (!user) {
        db.users.push({ username, password, mustChangePassword: true, role: 'USER', points: 1000, createdBy: 'System' });
        writeDB(db);
        return res.redirect(`/change-password?username=${encodeURIComponent(username)}`);
    }

    if (user.mustChangePassword) {
        return res.redirect(`/change-password?username=${encodeURIComponent(username)}`);
    }

    res.redirect('/dashboard');
});

// 2. CHANGE PASSWORD PAGE
app.get('/change-password', (req, res) => {
    const username = req.query.username || 'User';
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Soni - Change Password</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-[#116491] min-h-screen flex flex-col items-center justify-center p-6 text-white font-sans">
            <h1 class="text-5xl font-serif font-bold tracking-widest mb-8 text-white italic">Soni</h1>
            <div class="bg-white text-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-sm">
                <div class="text-center font-bold text-gray-700 text-base mb-4 flex items-center justify-center">
                    Login 🔐
                </div>
                <form action="/update-password" method="POST" class="space-y-3 text-xs">
                    <input type="hidden" name="username" value="${username}">
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Current Password:</label>
                        <input type="password" name="currentPassword" required placeholder="Enter Current password" class="w-full bg-gray-50 border border-gray-300 rounded p-2.5 text-gray-800 focus:outline-none focus:border-cyan-500">
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">New Password:</label>
                        <input type="password" name="newPassword" required placeholder="Enter New Password" class="w-full bg-gray-50 border border-gray-300 rounded p-2.5 text-gray-800 focus:outline-none focus:border-cyan-500">
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Confirm Password:</label>
                        <input type="password" name="confirmPassword" required placeholder="Confirm New Password" class="w-full bg-gray-50 border border-gray-300 rounded p-2.5 text-gray-800 focus:outline-none focus:border-cyan-500">
                    </div>
                    <button type="submit" class="w-full bg-[#1b3d4f] hover:bg-[#122834] text-white font-bold py-2.5 rounded transition shadow mt-3">
                        Change Password
                    </button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.post('/update-password', (req, res) => {
    const { username, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
        return res.send("<script>alert('New Password and Confirm Password do not match!'); window.history.back();</script>");
    }
    const db = readDB();
    let user = db.users.find(u => u.username === username);
    if (user) {
        user.password = newPassword;
        user.mustChangePassword = false;
        writeDB(db);
    }
    res.redirect('/dashboard');
});

// 3. EXACT HUBUHU DASHBOARD PAGE
app.get('/dashboard', (req, res) => {
    const db = readDB();
    let usersListHtml = db.users.map(u => `
        <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 6px 8px; font-weight: bold; color: #0088cc;">${u.username}</td>
            <td style="padding: 6px 8px;">0.00</td>
            <td style="padding: 6px 8px; text-align: center;"><input type="checkbox" checked class="w-3 h-3"></td>
            <td style="padding: 6px 8px; text-align: center;"><input type="checkbox" checked class="w-3 h-3"></td>
            <td style="padding: 6px 8px; font-weight: bold;">${u.points}</td>
            <td style="padding: 6px 8px;">0</td>
            <td style="padding: 6px 8px;">${u.role}</td>
            <td style="padding: 6px 8px; text-align: center;">
                <div class="inline-flex space-x-1">
                    <button class="bg-gray-200 text-gray-800 px-1.5 py-0.5 text-[10px] rounded font-bold">D</button>
                    <button class="bg-gray-200 text-gray-800 px-1.5 py-0.5 text-[10px] rounded font-bold">W</button>
                    <button class="bg-gray-200 text-gray-800 px-1.5 py-0.5 text-[10px] rounded font-bold">L</button>
                    <button class="bg-gray-200 text-gray-800 px-1.5 py-0.5 text-[10px] rounded font-bold">C</button>
                    <button class="bg-gray-200 text-gray-800 px-1.5 py-0.5 text-[10px] rounded font-bold">P</button>
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
            <title>Soni Exchange - Admin Panel</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                body { font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; }
            </style>
        </head>
        <body class="bg-gray-100 min-h-screen flex flex-col text-xs">

            <!-- TOP BLUE HEADER NAVBAR -->
            <header class="bg-[#0077b6] text-white px-3 py-1.5 flex items-center justify-between shadow-md text-[11px] whitespace-nowrap overflow-x-auto">
                <div class="flex items-center space-x-3">
                    <span class="font-serif font-black text-xl tracking-wider text-white">Soni</span>
                    <button onclick="toggleSidebar()" class="text-white hover:bg-black/20 px-2 py-1 rounded focus:outline-none">
                        <i class="fa-solid fa-bars text-sm"></i>
                    </button>
                    <nav class="flex items-center space-x-2 font-medium">
                        <a href="#" class="hover:bg-black/20 px-2 py-1 rounded">List of Clients</a>
                        <a href="#" class="hover:bg-black/20 px-2 py-1 rounded">Assign Agent</a>
                        <a href="#" class="hover:bg-black/20 px-2 py-1 rounded">Market Analysis</a>
                        <a href="#" class="hover:bg-black/20 px-2 py-1 rounded">Live Market ▾</a>
                        <a href="#" class="hover:bg-black/20 px-2 py-1 rounded">Live Virtual Market ▾</a>
                        <a href="#" class="hover:bg-black/20 px-2 py-1 rounded">Reports ▾</a>
                        <a href="#" class="hover:bg-black/20 px-2 py-1 rounded">Multi Login</a>
                    </nav>
                </div>

                <div class="flex items-center space-x-2 ml-4">
                    <span class="font-semibold text-white">29demo ▾</span>
                    <div class="relative">
                        <input type="text" placeholder="All Client" class="text-black bg-white px-2 py-0.5 pr-6 rounded text-[11px] w-28 focus:outline-none">
                        <i class="fa-solid fa-magnifying-glass absolute right-1.5 top-1.5 text-gray-500 text-[10px]"></i>
                    </div>
                </div>
            </header>

            <div class="flex flex-1 relative overflow-hidden">
                
                <!-- EXACT 39 SPORTS SIDEBAR (SCREENSHOT WALA) -->
                <aside id="sportsSidebar" class="w-64 bg-white text-gray-800 flex flex-col absolute inset-y-0 left-0 transform -translate-x-full transition-transform duration-200 ease-in-out z-40 shadow-2xl border-r">
                    <div class="p-2.5 bg-gray-100 border-b flex justify-between items-center">
                        <span class="font-bold text-sm text-gray-800">Sports</span>
                        <button onclick="toggleSidebar()" class="text-gray-600 hover:text-black"><i class="fa-solid fa-xmark text-sm"></i></button>
                    </div>
                    <div class="flex-1 overflow-y-auto p-2 space-y-1.5 text-[11px] font-semibold text-gray-700">
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Football</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Tennis</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Mixed Martial Arts</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Cricket</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Golf</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Boxing</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Beach Volleyball</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Table Tennis</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Futsal</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Horse Racing</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>E Games</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Basketball</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>MotoGP</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Chess</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Volleyball</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Ice Hockey</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Badminton</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Cycling</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Motorbikes</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Athletics</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Basketball 3X3</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Sumo</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Virtual sports</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Handball</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Politics</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Motor Sports</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Baseball</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Rugby Union</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Rugby League</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Darts</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>American Football</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Snooker</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Soccer</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Esports</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Greyhound Racing</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Kabaddi</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Boat Racing</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Esoccer</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"><span>Wrestling</span> <span>+</span></div>
                    </div>
                </aside>

                <!-- OVERLAY -->
                <div id="sidebarOverlay" onclick="toggleSidebar()" class="fixed inset-0 bg-black/40 hidden z-30"></div>

                <!-- MAIN CONTENT AREA -->
                <main class="flex-1 p-3 overflow-y-auto">
                    
                    <!-- TOP SUB BAR / ACTION BUTTONS -->
                    <div class="flex justify-between items-center mb-3">
                        <div class="flex space-x-2">
                            <button onclick="document.getElementById('addAccountModal').classList.remove('hidden')" class="bg-gray-200 hover:bg-gray-300 font-bold px-3 py-1 rounded text-gray-700">Add Account</button>
                        </div>
                    </div>

                    <!-- CLIENTS TABLE -->
                    <div class="bg-white rounded border shadow-sm overflow-x-auto">
                        <table class="w-full text-left border-collapse text-[11px]">
                            <thead>
                                <tr class="bg-gray-100 border-b text-gray-700 font-bold">
                                    <th class="p-2 border-r">Account</th>
                                    <th class="p-2 border-r">Credit Ref.</th>
                                    <th class="p-2 border-r text-center">Partnership</th>
                                    <th class="p-2 border-r text-center">Status</th>
                                    <th class="p-2 border-r">Balance</th>
                                    <th class="p-2 border-r">Exposure</th>
                                    <th class="p-2 border-r">Type</th>
                                    <th class="p-2 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${usersListHtml}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>

            <!-- ADD ACCOUNT MODAL POPUP -->
            <div id="addAccountModal" class="fixed inset-0 bg-black/50 hidden z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-lg shadow-xl p-5 w-full max-w-sm">
                    <div class="flex justify-between items-center mb-3 border-b pb-2">
                        <h3 class="font-bold text-gray-800">Add Account</h3>
                        <button onclick="document.getElementById('addAccountModal').classList.add('hidden')" class="text-gray-500 font-bold">&times;</button>
                    </div>
                    <form action="/api/users/create" method="POST" class="space-y-3">
                        <div>
                            <label class="block font-semibold mb-1">Username:</label>
                            <input type="text" name="username" required placeholder="Enter Username" class="w-full border p-2 rounded">
                        </div>
                        <div>
                            <label class="block font-semibold mb-1">Points:</label>
                            <input type="number" name="points" value="1000" class="w-full border p-2 rounded">
                        </div>
                        <button type="submit" class="w-full bg-[#0077b6] text-white font-bold py-2 rounded">Create Account</button>
                    </form>
                </div>
            </div>

            <script>
                function toggleSidebar() {
                    let sidebar = document.getElementById('sportsSidebar');
                    let overlay = document.getElementById('sidebarOverlay');
                    if(sidebar) sidebar.classList.toggle('-translate-x-full');
                    if(overlay) overlay.classList.toggle('hidden');
                }
            </script>
        </body>
        </html>
    `);
});

app.post('/api/users/create', (req, res) => {
    const { username, points } = req.body;
    const db = readDB();
    if (db.users.find(u => u.username === username)) {
        return res.send("<script>alert('User already exists!'); window.location='/dashboard';</script>");
    }
    db.users.push({ username, password: 'password123', mustChangePassword: true, role: 'USER', points: Number(points) || 0, createdBy: 'SuperAdmin', createdAt: new Date() });
    writeDB(db);
    res.send("<script>alert('Account created successfully!'); window.location='/dashboard';</script>");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running!'));
