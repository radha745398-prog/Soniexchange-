const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } = require('firebase/firestore');

function setupAdminRoutes(db, getBotInstance) {

    // --- HTML TEMPLATE HELPERS ---
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
                        <a href="/live-market?username=${encodeURIComponent(loggedInUser)}" class="hover:underline py-0.5 px-1 font-bold text-yellow-300">Live Market ▾</a>
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
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Football</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Tennis</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Cricket</span> <span>+</span></div>
                </div>
            </aside>
            <div id="sidebarOverlay" class="fixed inset-0 bg-black/50 hidden" style="z-index: 999998;"></div>
            <script>
                document.addEventListener('DOMContentLoaded', function() {
                    const toggleBtn = document.getElementById('sidebarToggleBtn');
                    const closeBtn = document.getElementById('sidebarCloseBtn');
                    const sidebar = document.getElementById('sportsSidebar');
                    const overlay = document.getElementById('sidebarOverlay');
                    if (toggleBtn) toggleBtn.onclick = () => { sidebar.classList.remove('-translate-x-full'); overlay.classList.remove('hidden'); };
                    if (closeBtn) closeBtn.onclick = () => { sidebar.classList.add('-translate-x-full'); overlay.classList.add('hidden'); };
                    if (overlay) overlay.onclick = () => { sidebar.classList.add('-translate-x-full'); overlay.classList.add('hidden'); };

                    const userBtn = document.getElementById('userMenuBtn');
                    const userContent = document.getElementById('userMenuContent');
                    if (userBtn && userContent) {
                        userBtn.addEventListener('click', (e) => { e.stopPropagation(); userContent.classList.toggle('hidden'); });
                        document.addEventListener('click', (e) => { if (!userContent.contains(e.target) && !userBtn.contains(e.target)) userContent.classList.add('hidden'); });
                    }
                });
            </script>
        `;
    }

    function getModalsHTML(loggedInUser) {
        return `
            <div id="marketAnalysisModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-12 z-50">
                <div class="bg-white rounded-xs shadow-2xl w-full max-w-2xl mx-3 overflow-hidden text-gray-800 border border-gray-300">
                    <div class="bg-[#2b3e50] px-3 py-2 flex justify-between items-center text-white">
                        <span class="font-bold text-xs">Market Analysis</span>
                        <button type="button" onclick="closeMarketAnalysisModal()" class="w-5 h-5 bg-[#00a8e8] text-white flex items-center justify-center text-xs cursor-pointer">✕</button>
                    </div>
                    <div class="p-3 bg-gray-100 text-[11px]">
                        <div class="bg-white border p-2 space-y-1 shadow-xs">
                            <div class="flex justify-between"><span class="text-gray-600">Username:</span><span class="font-semibold" id="maUsername">-</span></div>
                            <div class="flex justify-between"><span class="text-gray-600">Role:</span><span class="font-semibold" id="maRole">-</span></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function getModalScriptsJS() {
        return `
            <script>
                function closeMarketAnalysisModal() {
                    const modal = document.getElementById('marketAnalysisModal');
                    if(modal) { modal.classList.remove('flex'); modal.classList.add('hidden'); }
                }
                function toggleSummaryBanner() {
                    const banner = document.getElementById('summaryBannerContent');
                    if(banner) banner.classList.toggle('hidden');
                }
                function filterTableBySearch() {
                    const q = (document.getElementById('tableSearchInput')?.value || '').toLowerCase();
                    const rows = document.querySelectorAll('#soniAccountTable tbody tr, #accountTable tbody tr');
                    rows.forEach(row => { row.style.display = row.innerText.toLowerCase().includes(q) ? '' : 'none'; });
                }
                function resetTableSearch() {
                    const input = document.getElementById('tableSearchInput');
                    if(input) input.value = '';
                    filterTableBySearch();
                }
            </script>
        `;
    }

    // --- 7. MAIN DASHBOARD ROUTE ---
    router.get('/dashboard', async (req, res) => {
        const loggedInUser = req.query.username || 'Soniexchange';
        try {
            const userRef = doc(db, 'users', loggedInUser);
            const docSnap = await getDoc(userRef);
            
            if (!docSnap.exists()) return res.redirect('/');
            const user = docSnap.data();

            if (user.role === 'ADMIN' || loggedInUser === 'Soniexchange') {
                return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
            }

            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Dashboard - Soniexchange</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                </head>
                <body class="min-h-screen flex flex-col text-xs bg-[#f4f6f8]">
                    ${getHeaderAndSidebar(loggedInUser, user.role)}
                    <main class="flex-1 p-4 max-w-7xl mx-auto w-full">
                        <div class="bg-white p-6 rounded shadow border border-gray-300 text-center">
                            <h2 class="text-base font-bold text-gray-800 mb-2">Welcome to Soniexchange Dashboard, ${loggedInUser}!</h2>
                            <p class="text-gray-600">Your account is active.</p>
                        </div>
                    </main>
                    ${getModalsHTML(loggedInUser)}
                    ${getModalScriptsJS()}
                </body>
                </html>
            `);
        } catch(err) {
            console.error("Dashboard error:", err);
            res.redirect('/');
        }
    });

    // --- 9. SONI VIEW (ADMIN MAIN DASHBOARD PAGE) ---
    router.get('/soni-view', async (req, res) => {
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
                    if (docItem.id !== 'Soniexchange') allUsersList.push({ id: docItem.id, ...docItem.data() });
                });
            } else {
                const q = query(collection(db, "users"), where("createdBy", "==", loggedInUser));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((docItem) => allUsersList.push({ id: docItem.id, ...docItem.data() }));
            }

            let usersList = allUsersList.filter(u => tab === 'active' ? (u.userActive !== false) : (u.userActive === false));
            usersList.sort((a, b) => Number(b.points || 0) - Number(a.points || 0));

            let totalCR = 0, totalBalance = 0, totalPL = 0, totalExposure = 0, totalAvailBal = 0, totalExpLimit = 0;
            usersList.forEach(u => {
                const cr = Number(u.creditRef || 0), bal = Number(u.points || 0), exp = Number(u.exposure || 0), limit = Number(u.exposureLimit || 0);
                totalCR += cr; totalBalance += Math.abs(bal); totalPL += (bal - cr); totalExposure += exp; totalAvailBal += (bal - exp); totalExpLimit += limit;
            });

            let tableRows = usersList.length === 0 ? `
                <tr><td colspan="12" class="text-center p-4 text-gray-500">No ${tab} users found.</td></tr>
            ` : usersList.map(u => `
                <tr class="border-b bg-white text-[11px] hover:bg-gray-50">
                    <td class="p-2 border-r flex items-center justify-between">
                        <span class="bg-[#2b3a4a] text-white px-2 py-1 rounded-xs font-bold text-[10px]">${u.username}</span>
                        <a href="/admin/impersonate/${encodeURIComponent(u.username)}?admin=${encodeURIComponent(loggedInUser)}" class="bg-green-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">Switch</a>
                    </td>
                    <td class="p-2 border-r text-right">${Number(u.creditRef || 0).toLocaleString()}</td>
                    <td class="p-2 border-r text-right">${Math.abs(Number(u.points || 0)).toLocaleString()}</td>
                    <td class="p-2 border-r text-right">${(Number(u.points || 0) - Number(u.creditRef || 0)).toLocaleString()}</td>
                    <td class="p-2 border-r text-right">${Number(u.exposure || 0).toLocaleString()}</td>
                    <td class="p-2 border-r text-right">${(Number(u.points || 0) - Number(u.exposure || 0)).toLocaleString()}</td>
                    <td class="p-2 border-r text-center">${u.userActive !== false ? '✓' : '✕'}</td>
                    <td class="p-2 border-r text-center">${u.betActive !== false ? '✓' : '✕'}</td>
                    <td class="p-2 border-r text-right">${Number(u.exposureLimit || 0).toLocaleString()}</td>
                    <td class="p-2 border-r text-center">${u.defaultPct || 0}</td>
                    <td class="p-2 border-r text-center">${u.role || 'User'}</td>
                    <td class="p-1.5 text-center">
                        <span class="text-gray-500 text-[10px] font-bold">Actions Active</span>
                    </td>
                </tr>
            `).join('');

            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Account List - Soni View</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                </head>
                <body class="min-h-screen flex flex-col text-xs bg-[#f4f6f8]">
                    ${getHeaderAndSidebar(loggedInUser, currentUser.role)}
                    <main class="flex-1 p-3 max-w-7xl mx-auto w-full">
                        <div class="flex justify-between items-center mb-2">
                            <h2 class="text-base font-bold text-gray-800">Account List</h2>
                            <a href="/insertuser?username=${encodeURIComponent(loggedInUser)}" class="bg-[#0088cc] text-white px-3 py-1 rounded text-xs font-semibold">Add Account</a>
                        </div>
                        <div class="bg-white border rounded shadow-xs overflow-x-auto">
                            <table id="soniAccountTable" class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-gray-100 text-gray-700 text-[10px] border-b-2 border-gray-400 font-bold">
                                        <th class="p-2 border-r">User Name</th>
                                        <th class="p-2 border-r text-right">CR</th>
                                        <th class="p-2 border-r text-right">Balance</th>
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
            console.error(err);
            res.redirect('/');
        }
    });

    // --- 8. USERS LIST ROUTE ---
    router.get('/users', async (req, res) => {
        const loggedInUser = req.query.username || 'Soniexchange';
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
    });

    // --- 10. INSERT USER ROUTE ---
    router.get('/insertuser', async (req, res) => {
        const loggedInUser = req.query.username || 'Soniexchange';
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Add Account</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="min-h-screen flex flex-col text-xs bg-[#f4f6f8]">
                ${getHeaderAndSidebar(loggedInUser, 'ADMIN')}
                <main class="flex-1 p-3 max-w-6xl mx-auto w-full">
                    <h2 class="text-base font-bold text-gray-800 mb-3">Add Account</h2>
                    <form action="/api/clients/create" method="POST" class="bg-white p-4 border rounded space-y-3">
                        <input type="hidden" name="createdBy" value="${loggedInUser}">
                        <div><label class="block font-semibold">Client Name:</label><input type="text" name="clientName" required class="w-full border p-1 rounded"></div>
                        <div><label class="block font-semibold">User Password:</label><input type="password" name="password" required class="w-full border p-1 rounded"></div>
                        <div><label class="block font-semibold">Credit Reference:</label><input type="number" name="creditRef" required class="w-full border p-1 rounded"></div>
                        <div><label class="block font-semibold">Transaction Password:</label><input type="password" name="txnPassword" required class="w-full border p-1 rounded"></div>
                        <button type="submit" class="bg-[#0077b6] text-white px-4 py-2 rounded font-bold">Create Account</button>
                    </form>
                </main>
            </body>
            </html>
        `);
    });

    return router;
}

module.exports = setupAdminRoutes;
