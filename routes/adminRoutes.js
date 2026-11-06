const express = require('express');
const router = express.Router();
const { doc, getDoc, collection, getDocs, query, where } = require('firebase/firestore');
const { getHeaderAndSidebar, getModalsHTML, getModalScriptsJS } = require('./adminTemplates');
const adminController = require('./adminController');

function setupAdminRoutes(db) {

    // 1. CLEAN DASHBOARD (Login ke turant baad ab yeh khulega, client list nahi)
    router.get('/dashboard', async (req, res) => {
        const loggedInUser = req.query.username || req.session.loggedInUser || 'Soniexchange';
        try {
            const userRef = doc(db, 'users', loggedInUser);
            const docSnap = await getDoc(userRef);
            if (!docSnap.exists()) return res.redirect('/');
            const user = docSnap.data();

            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Dashboard - Soniexchange</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                </head>
                <body class="min-h-screen flex flex-col text-xs bg-[#f4f6f8]">
                    ${getHeaderAndSidebar(loggedInUser, user.role)}
                    <main class="flex-1 p-6 max-w-7xl mx-auto w-full">
                        <div class="bg-white border rounded p-6 shadow-sm space-y-3">
                            <h2 class="text-base font-bold text-[#0077b6]">Welcome to Dashboard, ${loggedInUser}!</h2>
                            <p class="text-gray-600 text-xs">Aapka login safal raha. Upar menu mein <a href="/soni-view?username=${encodeURIComponent(loggedInUser)}" class="text-blue-600 font-bold underline">List of Clients</a> par click karke aap client list dekh sakte hain.</p>
                        </div>
                    </main>
                    ${getModalsHTML(loggedInUser, user.points)}
                    ${getModalScriptsJS()}
                </body>
                </html>
            `);
        } catch(err) {
            console.error("Dashboard error:", err);
            res.redirect('/');
        }
    });

    // 2. CLIENT LIST VIEW (Jab user specifically click karega tabhi dikhegi)
    router.get('/soni-view', async (req, res) => {
        const loggedInUser = req.query.username || req.session.loggedInUser || 'Soniexchange';
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

            let usersList = allUsersList.filter(u => {
                const isActive = u.userActive !== false;
                return tab === 'active' ? isActive : !isActive;
            });

            usersList.sort((a, b) => Number(b.points || 0) - Number(a.points || 0));

            // Calculate Totals for Footer and Summary Banner
            let totalCreditRef = 0;
            let totalPoints = 0;
            let totalExposure = 0;

            usersList.forEach(u => {
                totalCreditRef += Number(u.creditRef || 0);
                totalPoints += Number(u.points || 0);
                totalExposure += Number(u.exposure || 0);
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
                        <div class="flex items-center justify-center space-x-1">
                            <button type="button" onclick="openDepositModal('${u.username}', '${u.points || 0}')" class="bg-[#343a40] text-white px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer">D</button>
                            <button type="button" onclick="openWithdrawModal('${u.username}', '${u.points || 0}')" class="bg-[#343a40] text-white px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer">W</button>
                            <button type="button" onclick="openExposureModal('${u.username}', '${u.exposureLimit || 0}')" class="bg-[#343a40] text-white px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer">L</button>
                            <button type="button" onclick="openCreditModal('${u.username}', '${u.creditRef || 0}')" class="bg-[#343a40] text-white px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer">C</button>
                            <button type="button" onclick="openPasswordModal('${u.username}')" class="bg-[#343a40] text-white px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer">P</button>
                            <button type="button" onclick="openStatusModal('${u.username}', '${u.userActive !== false}', '${u.betActive !== false}')" class="bg-[#343a40] text-white px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer">S</button>
                        </div>
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
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"></script>
                    <style>
                        .tab-active-box {
                            background-color: #ffffff;
                            border-top: 1px solid #d1d5db;
                            border-left: 1px solid #d1d5db;
                            border-right: 1px solid #d1d5db;
                            border-bottom: 1px solid #ffffff;
                            color: #1f2937;
                            font-weight: 600;
                            margin-bottom: -1px;
                            z-index: 10;
                        }
                        .tab-inactive-link {
                            background-color: transparent;
                            border: 1px solid transparent;
                            color: #0077b6;
                            font-weight: 600;
                        }
                    </style>
                </head>
                <body class="min-h-screen flex flex-col text-xs bg-[#f4f6f8]">
                    ${getHeaderAndSidebar(loggedInUser, currentUser.role)}

                    <!-- EXPANDABLE SUMMARY BANNER -->
                    <div class="bg-[#0077b6] text-white shadow-md">
                        <div class="flex justify-center items-center py-1 cursor-pointer hover:bg-black/10 transition" onclick="toggleSummaryBanner()">
                            <button type="button" class="text-white text-xs focus:outline-none cursor-pointer">
                                <i id="summaryArrowIcon" class="fa-solid fa-chevron-down text-xs pointer-events-none"></i>
                            </button>
                        </div>
                        <div id="summaryBannerContent" class="hidden px-4 pb-3 pt-1 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1.5 text-[11px] border-t border-white/20">
                            <div class="flex justify-between py-0.5"><span>Upper Level Credit Reference:</span><span class="font-semibold">0</span></div>
                            <div class="flex justify-between py-0.5"><span>Down level Occupy Balance:</span><span class="font-semibold">0</span></div>
                            <div class="flex justify-between py-0.5"><span>Down Level Credit Reference:</span><span class="font-semibold">${totalCreditRef.toLocaleString()}</span></div>
                            <div class="flex justify-between py-0.5">
                                <span>Total Master Balance:</span>
                                <span class="font-semibold flex items-center space-x-1">
                                    <span>${Number(currentUser.points || 0).toLocaleString()}</span>
                                    ${loggedInUser === 'Soniexchange' ? `
                                    <button type="button" onclick="openAdminBalanceModal()" class="ml-1 bg-white text-[#0077b6] hover:bg-gray-100 font-bold text-[9px] px-1.5 py-0.2 rounded shadow-xs cursor-pointer">Update</button>
                                    ` : ''}
                                </span>
                            </div>
                            <div class="flex justify-between py-0.5"><span>Upper Level:</span><span class="font-semibold">0</span></div>
                            <div class="flex justify-between py-0.5"><span>Down Level Profit/Loss:</span><span class="font-semibold">${totalPoints.toLocaleString()}</span></div>
                            <div class="flex justify-between py-0.5">
                                <span>Available Balance:</span>
                                <span class="font-semibold flex items-center space-x-1">
                                    <span>${Number(currentUser.points || 0).toLocaleString()}</span>
                                    ${loggedInUser === 'Soniexchange' ? `
                                    <button type="button" onclick="openAdminBalanceModal()" class="ml-1 bg-white text-[#0077b6] hover:bg-gray-100 font-bold text-[9px] px-1.5 py-0.2 rounded shadow-xs cursor-pointer">Update</button>
                                    ` : ''}
                                </span>
                            </div>
                            <div class="flex justify-between py-0.5"><span>Available Balance With Profit/Loss:</span><span class="font-semibold">${(Number(currentUser.points || 0) + totalPoints).toLocaleString()}</span></div>
                            <div class="flex justify-between py-0.5"><span>My Profit/Loss:</span><span class="font-semibold">0</span></div>
                        </div>
                    </div>

                    <main class="flex-1 p-3 max-w-7xl mx-auto w-full">
                        <div class="flex justify-between items-center mb-2">
                            <h2 class="text-base font-bold text-gray-800">Account List</h2>
                            <a href="/insertuser?username=${encodeURIComponent(loggedInUser)}" class="bg-[#0088cc] text-white px-3 py-1 rounded text-xs font-semibold">Add Account</a>
                        </div>

                        <!-- ACTIVE / DEACTIVE USER TABS -->
                        <div class="relative flex items-center border-b border-gray-300 mb-3 text-[11px]">
                            <a href="/soni-view?username=${encodeURIComponent(loggedInUser)}&tab=active" class="px-3 py-1.5 rounded-t-xs cursor-pointer ${tab === 'active' ? 'tab-active-box' : 'tab-inactive-link'}">
                                Active Users
                            </a>
                            <a href="/soni-view?username=${encodeURIComponent(loggedInUser)}&tab=deactive" class="px-3 py-1.5 rounded-t-xs cursor-pointer ${tab === 'deactive' ? 'tab-active-box' : 'tab-inactive-link'}">
                                Deactive Users
                            </a>
                        </div>

                        <!-- EXCEL, PDF, & SEARCH BUTTONS -->
                        <div class="flex justify-between items-center mb-3">
                            <div class="flex space-x-1">
                                <button type="button" onclick="downloadPDF()" class="bg-[#dc3545] hover:bg-red-700 text-white px-2.5 py-1 rounded text-[11px] font-bold flex items-center space-x-1 cursor-pointer">
                                    <i class="fa-regular fa-file-pdf"></i> <span>PDF</span>
                                </button>
                                <button type="button" onclick="downloadExcel()" class="bg-[#28a745] hover:bg-green-700 text-white px-2.5 py-1 rounded text-[11px] font-bold flex items-center space-x-1 cursor-pointer">
                                    <i class="fa-regular fa-file-excel"></i> <span>Excel</span>
                                </button>
                            </div>
                            <div class="flex items-center space-x-1">
                                <input type="text" id="tableSearchInput" oninput="filterTableBySearch()" placeholder="Search..." class="border p-1 rounded bg-white text-xs focus:outline-none w-36">
                                <button onclick="resetTableSearch()" class="bg-[#6c757d] text-white px-2 py-1 rounded text-xs font-semibold">Reset</button>
                            </div>
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
                                <tfoot>
                                    <tr class="bg-gray-100 font-bold text-[11px] border-t-2 border-gray-300 text-gray-800">
                                        <td class="p-2 border-r">Total</td>
                                        <td class="p-2 border-r text-right">${totalCreditRef.toLocaleString()}</td>
                                        <td class="p-2 border-r text-right">0</td>
                                        <td class="p-2 border-r text-right">${totalPoints.toLocaleString()}</td>
                                        <td class="p-2 border-r text-right">${totalExposure.toLocaleString()}</td>
                                        <td colspan="7" class="p-2"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </main>
                    ${getModalsHTML(loggedInUser, currentUser.points)}
                    ${getModalScriptsJS()}

                    <script>
                        function downloadPDF() {
                            const { jsPDF } = window.jspdf;
                            const doc = new jsPDF();
                            doc.setFont("helvetica", "bold");
                            doc.setFontSize(14);
                            doc.text("User List (${tab})", 105, 15, { align: "center" });

                            const data = [];
                            const rows = document.querySelectorAll("#soniAccountTable tbody tr");
                            rows.forEach(row => {
                                const cells = row.querySelectorAll("td");
                                if (cells.length >= 11) {
                                    data.push([
                                        cells[0].innerText.trim(),
                                        cells[1].innerText.trim(),
                                        cells[6].innerText.includes('✓') ? 'Active' : 'Deactive',
                                        cells[7].innerText.includes('✓') ? 'Active' : 'Deactive',
                                        cells[8].innerText.trim(),
                                        cells[9].innerText.trim(),
                                        cells[10].innerText.trim()
                                    ]);
                                }
                            });

                            doc.autoTable({
                                startY: 20,
                                head: [['User Name', 'CR', 'U st', 'B st', 'Exposure Limit', 'Default %', 'Account type']],
                                body: data,
                                headStyles: { fillColor: [41, 128, 185], textColor: 255 }
                            });

                            doc.save('userlist-${tab}.pdf');
                        }

                        function downloadExcel() {
                            let csv = [];
                            const rows = document.querySelectorAll("#soniAccountTable tr");
                            rows.forEach(row => {
                                const cols = row.querySelectorAll("td, th");
                                let rowData = [];
                                cols.forEach(col => rowData.push('"' + col.innerText.replace(/"/g, '""') + '"'));
                                csv.push(rowData.join(","));
                            });
                            const csvBlob = new Blob([csv.join("\\n")], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(csvBlob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'userlist-${tab}.csv';
                            a.click();
                        }
                    </script>
                </body>
                </html>
            `);
        } catch(err) {
            console.error(err);
            res.redirect('/');
        }
    });

    router.get('/users', async (req, res) => {
        const loggedInUser = req.query.username || 'Soniexchange';
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
    });

    router.get('/insertuser', async (req, res) => {
        const loggedInUser = req.query.username || 'Soniexchange';
        try {
            const userRef = doc(db, 'users', loggedInUser);
            const docSnap = await getDoc(userRef);
            const currentUser = docSnap.exists() ? docSnap.data() : { role: 'ADMIN' };

            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Add Account</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                </head>
                <body class="min-h-screen flex flex-col text-xs bg-[#f4f6f8]">
                    ${getHeaderAndSidebar(loggedInUser, currentUser.role)}

                    <main class="flex-1 p-3 max-w-5xl mx-auto w-full">
                        <h2 class="text-base font-bold text-gray-800 mb-3">Add Account</h2>

                        <form action="/api/clients/create" method="POST" class="space-y-4 bg-white p-4 border rounded shadow-xs">
                            <input type="hidden" name="createdBy" value="${loggedInUser}">

                            <div class="border rounded overflow-hidden">
                                <div class="bg-[#2b3a4a] text-white px-3 py-1.5 font-bold text-xs">Personal Detail</div>
                                <div class="p-3 grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50/50">
                                    <div>
                                        <label class="block font-semibold text-gray-700 mb-1">Client Name:</label>
                                        <input type="text" name="clientName" required placeholder="Client Username" class="w-full border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                                    </div>
                                    <div>
                                        <label class="block font-semibold text-gray-700 mb-1">User Password:</label>
                                        <input type="password" name="password" required placeholder="Password" class="w-full border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                                    </div>
                                    <div>
                                        <label class="block font-semibold text-gray-700 mb-1">Retype Password:</label>
                                        <input type="password" name="retypePassword" required placeholder="Retype Password" class="w-full border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                                    </div>
                                    <div>
                                        <label class="block font-semibold text-gray-700 mb-1">Full Name:</label>
                                        <input type="text" name="fullName" placeholder="Full Name" class="w-full border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                                    </div>
                                    <div>
                                        <label class="block font-semibold text-gray-700 mb-1">City:</label>
                                        <input type="text" name="city" placeholder="City" class="w-full border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                                    </div>
                                    <div>
                                        <label class="block font-semibold text-gray-700 mb-1">Phone:</label>
                                        <input type="text" name="phone" placeholder="Phone Number" class="w-full border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                                    </div>
                                </div>
                            </div>

                            <div class="border rounded overflow-hidden">
                                <div class="bg-[#2b3a4a] text-white px-3 py-1.5 font-bold text-xs">Account Detail</div>
                                <div class="p-3 grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50/50">
                                    <div>
                                        <label class="block font-semibold text-gray-700 mb-1">Account Type:</label>
                                        <select name="accountType" class="w-full border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                                            <option value="Client">Client</option>
                                            <option value="Master">Master</option>
                                            <option value="Super">Super Master</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block font-semibold text-gray-700 mb-1">Credit Reference:</label>
                                        <input type="number" name="creditRef" required placeholder="Credit Reference" class="w-full border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                                    </div>
                                </div>
                            </div>

                            <div class="border rounded overflow-hidden">
                                <div class="bg-[#2b3a4a] text-white px-3 py-1.5 font-bold text-xs">Commission Settings</div>
                                <div class="p-3 space-y-2 bg-gray-50/50">
                                    <div class="flex justify-between items-center border-b pb-1.5">
                                        <span class="font-semibold text-gray-700">Upline</span>
                                        <span class="text-gray-600 font-semibold">0</span>
                                    </div>
                                    <div class="flex justify-between items-center border-b pb-1.5">
                                        <span class="font-semibold text-gray-700">Downline</span>
                                        <input type="number" name="downlineComm" value="0" class="border border-gray-300 p-1 rounded w-24 text-right bg-white">
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="font-semibold text-gray-700">Our</span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>

                            <div class="border rounded overflow-hidden">
                                <div class="bg-[#2b3a4a] text-white px-3 py-1.5 font-bold text-xs">Partnership</div>
                                <div class="p-3 space-y-2 bg-gray-50/50">
                                    <div class="flex justify-between items-center border-b pb-1.5">
                                        <span class="font-semibold text-gray-700">Upline</span>
                                        <span class="text-gray-600 font-semibold">0</span>
                                    </div>
                                    <div class="flex justify-between items-center border-b pb-1.5">
                                        <span class="font-semibold text-gray-700">Downline</span>
                                        <input type="number" name="downlinePartner" value="0" class="border border-gray-300 p-1 rounded w-24 text-right bg-white">
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="font-semibold text-gray-700">Our</span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex flex-col items-end space-y-2 pt-2">
                                <div class="w-full md:w-72">
                                    <label class="block font-semibold text-gray-700 mb-1">Transaction Password:</label>
                                    <input type="password" name="txnPassword" required placeholder="Transaction Password" class="w-full border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                                </div>
                                <button type="submit" class="bg-[#0077b6] hover:bg-[#005f92] text-white px-5 py-2 rounded font-bold cursor-pointer shadow-sm">
                                    Create Account
                                </button>
                            </div>
                        </form>
                    </main>
                </body>
                </html>
            `);
        } catch(err) {
            console.error(err);
            res.redirect('/soni-view?username=' + encodeURIComponent(loggedInUser));
        }
    });

    // API Endpoints linked to controller
    router.post('/api/clients/create', (req, res) => adminController.handleCreateClient(req, res, db));
    router.post('/api/admin/update-balance', (req, res) => adminController.handleUpdateAdminBalance(req, res, db));
    router.post('/api/deposit', (req, res) => adminController.handleDeposit(req, res, db));
    router.post('/api/withdraw', (req, res) => adminController.handleWithdraw(req, res, db));
    router.post('/api/exposure-limit', (req, res) => adminController.handleExposureLimit(req, res, db));
    router.post('/api/credit-ref', (req, res) => adminController.handleCreditRef(req, res, db));
    router.post('/api/change-password', (req, res) => adminController.handlePasswordChange(req, res, db));
    router.post('/api/change-status', (req, res) => adminController.handleStatusChange(req, res, db));

    return router;
}

module.exports = setupAdminRoutes;
