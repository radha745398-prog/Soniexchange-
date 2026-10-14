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

// --- DIRECT FRESH DASHBOARD (NO LOGIN, NO PASSWORD) ---
app.get('/', (req, res) => {
    const db = readDB();
    let usersListHtml = db.users.map(u => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-weight: bold;">${u.username}</td>
            <td style="padding: 10px;"><span style="background: #0088cc; color:white; padding:3px 8px; border-radius:4px; font-size:11px;">${u.role}</span></td>
            <td style="padding: 10px; font-weight: bold; color: #0b3c5d;">${u.points} Points</td>
            <td style="padding: 10px; color: #666;">${u.createdBy}</td>
        </tr>
    `).join('');

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Soni Exchange - Fresh Dashboard</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        </head>
        <body class="bg-gray-100 min-h-screen flex flex-col font-sans">

            <!-- TOP NAVBAR -->
            <header class="bg-[#0b3c5d] text-white p-3 flex justify-between items-center shadow-md text-xs">
                <div class="flex items-center space-x-3">
                    <button onclick="toggleSidebar()" class="text-white text-base focus:outline-none px-2 py-1 bg-black/20 rounded">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                    <span class="font-black text-sm tracking-wider text-cyan-400">SONI EXCHANGE (FRESH START)</span>
                </div>
                <div>
                    <span class="bg-blue-900 px-3 py-1 rounded font-bold border border-blue-700">Admin Panel</span>
                </div>
            </header>

            <div class="flex flex-1 relative overflow-hidden">
                
                <!-- 39 SPORTS SIDEBAR -->
                <aside id="sportsSidebar" class="w-64 bg-white text-gray-800 flex flex-col absolute inset-y-0 left-0 transform -translate-x-full transition-transform duration-300 ease-in-out z-30 shadow-2xl border-r">
                    <div class="p-3 bg-[#0b3c5d] text-white flex justify-between items-center">
                        <span class="font-bold text-xs uppercase tracking-wider">Sports (39)</span>
                        <button onclick="toggleSidebar()" class="text-white"><i class="fa-solid fa-xmark text-sm"></i></button>
                    </div>
                    <div class="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
                        <div class="px-2 py-1.5 hover:bg-gray-100 rounded border-b">Football</div>
                        <div class="px-2 py-1.5 hover:bg-gray-100 rounded border-b">Tennis</div>
                        <div class="px-2 py-1.5 hover:bg-gray-100 rounded border-b">Cricket</div>
                        <div class="px-2 py-1.5 hover:bg-gray-100 rounded border-b">Horse Racing</div>
                        <div class="px-2 py-1.5 hover:bg-gray-100 rounded border-b">Basketball</div>
                        <div class="px-2 py-1.5 hover:bg-gray-100 rounded border-b">Kabaddi</div>
                        <div class="px-2 py-1.5 hover:bg-gray-100 rounded border-b">Soccer</div>
                        <div class="px-2 py-1.5 hover:bg-gray-100 rounded border-b">Esports</div>
                    </div>
                </aside>

                <!-- OVERLAY -->
                <div id="sidebarOverlay" onclick="toggleSidebar()" class="fixed inset-0 bg-black/50 hidden z-20"></div>

                <!-- MAIN CONTENT -->
                <main class="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto">
                    <div class="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 class="font-bold text-sm text-gray-800 uppercase mb-4 border-b pb-2"><i class="fa-solid fa-user-plus mr-1 text-green-600"></i> Add New Account</h2>
                        <form action="/api/users/create" method="POST" class="space-y-4 text-xs">
                            <div>
                                <label class="block font-semibold text-gray-700 mb-1">Username / Client ID:</label>
                                <input type="text" name="username" required placeholder="e.g. Master123" class="w-full border p-2 rounded">
                            </div>
                            <div>
                                <label class="block font-semibold text-gray-700 mb-1">Initial Points:</label>
                                <input type="number" name="points" value="1000" class="w-full border p-2 rounded">
                            </div>
                            <button type="submit" class="w-full bg-[#0088cc] hover:bg-[#006699] text-white font-bold py-2.5 rounded shadow transition">CREATE ACCOUNT</button>
                        </form>
                    </div>

                    <div class="bg-white rounded-lg shadow p-6">
                        <h2 class="font-bold text-sm text-gray-800 uppercase mb-4"><i class="fa-solid fa-address-book mr-1 text-cyan-600"></i> Account List</h2>
                        <table class="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr class="bg-gray-100 border-b border-gray-300 text-gray-700">
                                    <th class="p-2">Username</th>
                                    <th class="p-2">Role</th>
                                    <th class="p-2">Points Balance</th>
                                    <th class="p-2">Created By</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${usersListHtml}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>

            <script>
                function toggleSidebar() {
                    const sidebar = document.getElementById('sportsSidebar');
                    const overlay = document.getElementById('sidebarOverlay');
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
        return res.send("<script>alert('User already exists!'); window.location='/';</script>");
    }
    db.users.push({ username, role: 'USER', points: Number(points) || 0, createdBy: 'SuperAdmin', createdAt: new Date() });
    writeDB(db);
    res.send("<script>alert('Account created successfully!'); window.location='/';</script>");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Fresh Dashboard Server running on port ${PORT}!`));
