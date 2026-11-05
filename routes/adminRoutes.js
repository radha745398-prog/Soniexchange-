const express = require('express');
const router = express.Router();
const { doc, getDoc, collection, getDocs, query, where } = require('firebase/firestore');
const { getHeaderAndSidebar, getModalsHTML, getModalScriptsJS } = require('./adminTemplates');
const adminController = require('./adminController');

function setupAdminRoutes(db) {

    router.get('/dashboard', async (req, res) => {
        const loggedInUser = req.query.username || 'Soniexchange';
        try {
            const docSnap = await getDoc(doc(db, 'users', loggedInUser));
            if (!docSnap.exists()) return res.redirect('/');
            const user = docSnap.data();

            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8"><title>Dashboard</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                </head>
                <body class="min-h-screen flex flex-col text-xs bg-[#f4f6f8]">
                    ${getHeaderAndSidebar(loggedInUser, user.role)}
                    <main class="flex-1 p-4 max-w-7xl mx-auto w-full"></main>
                    ${getModalsHTML(loggedInUser, user.points)}
                    ${getModalScriptsJS()}
                </body>
                </html>
            `);
        } catch(err) { res.redirect('/'); }
    });

    router.get('/soni-view', async (req, res) => {
        const loggedInUser = req.query.username || 'Soniexchange';
        const tab = req.query.tab || 'active';

        try {
            const docSnap = await getDoc(doc(db, 'users', loggedInUser));
            const currentUser = docSnap.exists() ? docSnap.data() : { role: 'ADMIN', points: 100000000 };

            let allUsersList = [];
            if (loggedInUser === 'Soniexchange') {
                const querySnapshot = await getDocs(collection(db, "users"));
                querySnapshot.forEach((docItem) => { if (docItem.id !== 'Soniexchange') allUsersList.push({ id: docItem.id, ...docItem.data() }); });
            } else {
                const q = query(collection(db, "users"), where("createdBy", "==", loggedInUser));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((docItem) => allUsersList.push({ id: docItem.id, ...docItem.data() }));
            }

            let usersList = allUsersList.filter(u => tab === 'active' ? (u.userActive !== false) : (u.userActive === false));
            usersList.sort((a, b) => Number(b.points || 0) - Number(a.points || 0));

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
                    <meta charset="UTF-8"><title>Account List - Soni View</title>
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
                        <div class="relative flex items-center border-b border-gray-300 mb-3 text-[11px]">
                            <a href="/soni-view?username=${encodeURIComponent(loggedInUser)}&tab=active" class="px-3 py-1.5 rounded-t-xs cursor-pointer ${tab === 'active' ? 'bg-white font-bold border-t border-x' : 'text-[#0077b6]'}">Active Users</a>
                            <a href="/soni-view?username=${encodeURIComponent(loggedInUser)}&tab=deactive" class="px-3 py-1.5 rounded-t-xs cursor-pointer ${tab === 'deactive' ? 'bg-white font-bold border-t border-x' : 'text-[#0077b6]'}">Deactive Users</a>
                        </div>
                        <div class="bg-white border rounded shadow-xs overflow-x-auto">
                            <table id="soniAccountTable" class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-gray-100 text-gray-700 text-[10px] border-b-2 border-gray-400 font-bold">
                                        <th class="p-2 border-r">User Name</th><th class="p-2 border-r text-right">CR</th><th class="p-2 border-r text-right">Balance</th><th class="p-2 border-r text-right">Client(P/L)</th><th class="p-2 border-r text-right">Exposure</th><th class="p-2 border-r text-right">Available Balance</th><th class="p-2 border-r text-center">U st</th><th class="p-2 border-r text-center">B st</th><th class="p-2 border-r text-right">Exposure Limit</th><th class="p-2 border-r text-center">Default(%)</th><th class="p-2 border-r text-center">Account Type</th><th class="p-2 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>${tableRows}</tbody>
                            </table>
                        </div>
                    </main>
                    ${getModalsHTML(loggedInUser, currentUser.points)}
                    ${getModalScriptsJS()}
                </body>
                </html>
            `);
        } catch(err) { res.redirect('/'); }
    });

    // API Endpoints linked to controller
    router.post('/api/deposit', (req, res) => adminController.handleDeposit(req, res, db));
    router.post('/api/withdraw', (req, res) => adminController.handleWithdraw(req, res, db));
    router.post('/api/exposure-limit', (req, res) => adminController.handleExposureLimit(req, res, db));
    router.post('/api/credit-ref', (req, res) => adminController.handleCreditRef(req, res, db));
    router.post('/api/change-password', (req, res) => adminController.handlePasswordChange(req, res, db));
    router.post('/api/change-status', (req, res) => adminController.handleStatusChange(req, res, db));

    return router;
}

module.exports = setupAdminRoutes;
