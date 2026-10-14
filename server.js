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

// 2. STRICT LOGIN PROCESS (GALAT DALNE PAR ERROR HI AAYEGA)
app.post('/login-process', (req, res) => {
    let { username, password } = req.body;
    username = username.trim();
    password = password.trim();

    const db = readDB();
    let user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());

    // Agar user nahi mila ya password galat hai toh yahin rok do
    if (!user || user.password !== password) {
        return res.send("<script>alert('Invalid Username or Password!'); window.history.back();</script>");
    }

    // Sab theek hai toh seedha dashboard par jao
    res.redirect(`/dashboard?username=${encodeURIComponent(user.username)}`);
});

// 3. MAIN DASHBOARD PAGE
app.get('/dashboard', (req, res) => {
    const loggedInUser = req.query.username || 'Soniexchange';

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

            <!-- TOP NAVBAR -->
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
                    <span class="font-semibold text-white cursor-pointer">${loggedInUser} ▾</span>
                    <a href="/" class="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded text-[10px] font-bold">Logout</a>
                    <div class="relative ml-1">
                        <input type="text" placeholder="All Client" class="text-black bg-white px-2 py-0.5 pr-6 rounded text-[11px] w-28 focus:outline-none">
                        <i class="fa-solid fa-magnifying-glass absolute right-1.5 top-1.5 text-gray-500 text-[10px]"></i>
                    </div>
                </div>
            </header>

            <div class="flex flex-1 relative overflow-hidden">
                <!-- 39 SPORTS SIDEBAR -->
                <aside id="sportsSidebar" class="w-64 bg-white text-gray-800 flex flex-col absolute inset-y-0 left-0 transform -translate-x-full transition-transform duration-200 ease-in-out z-40 shadow-2xl border-r">
                    <div class="p-2.5 bg-gray-100 border-b flex justify-between items-center">
                        <span class="font-bold text-sm text-gray-800">Sports</span>
                        <button onclick="toggleSidebar()" class="text-gray-600 hover:text-black"><i class="fa-solid fa-xmark text-sm"></i></button>
                    </div>
                    <div class="flex-1 overflow-y-auto p-2 space-y-1.5 text-[11px] font-semibold text-gray-700">
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Football</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Tennis</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Mixed Martial Arts</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Cricket</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Golf</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Boxing</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Beach Volleyball</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Table Tennis</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Futsal</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Horse Racing</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>E Games</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Basketball</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>MotoGP</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Chess</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Volleyball</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Ice Hockey</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Badminton</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Cycling</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Motorbikes</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Athletics</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Basketball 3X3</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Sumo</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Virtual sports</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Handball</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Politics</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Motor Sports</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Baseball</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Rugby Union</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Rugby League</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Darts</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>American Football</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Snooker</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Soccer</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Esports</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Greyhound Racing</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Kabaddi</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Boat Racing</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Esoccer</span> <span>+</span></div>
                        <div class="flex justify-between items-center py-1 px-1.5 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Wrestling</span> <span>+</span></div>
                    </div>
                </aside>

                <div id="sidebarOverlay" onclick="toggleSidebar()" class="fixed inset-0 bg-black/40 hidden z-30"></div>

                <main class="flex-1 p-4">
                    <!-- Clean Dashboard -->
                </main>
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running!'));
