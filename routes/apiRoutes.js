
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { doc, getDoc, collection, getDocs, query, where } = require('firebase/firestore');
const { getHeaderAndSidebar, getModalsHTML, getModalScriptsJS } = require('../frontend/uiComponents');

function setupApiRoutes(db) {
    // SEARCH USERS API (REALTIME)
    router.get('/api/search-users', async (req, res) => {
        const q = (req.query.q || '').trim().toLowerCase();
        const loggedInUser = req.query.loggedInUser || 'Soniexchange';

        if (!q) return res.json([]);

        try {
            let usersList = [];
            if (loggedInUser === 'Soniexchange') {
                const querySnapshot = await getDocs(collection(db, "users"));
                querySnapshot.forEach((docItem) => {
                    if (docItem.id !== 'Soniexchange') {
                        usersList.push({ username: docItem.id, ...docItem.data() });
                    }
                });
            } else {
                const queryRef = query(collection(db, "users"), where("createdBy", "==", loggedInUser));
                const querySnapshot = await getDocs(queryRef);
                querySnapshot.forEach((docItem) => {
                    usersList.push({ username: docItem.id, ...docItem.data() });
                });
            }

            const filtered = usersList.filter(u => u.username.toLowerCase().includes(q));
            res.json(filtered);
        } catch(err) {
            console.error(err);
            res.json([]);
        }
    });

    // GET USER DETAIL FOR MARKET ANALYSIS MODAL
    router.get('/api/user-detail', async (req, res) => {
        const username = (req.query.username || '').trim();
        if (!username) return res.json({ success: false });

        try {
            const userRef = doc(db, 'users', username);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                return res.json({ success: true, user: docSnap.data() });
            }
            res.json({ success: false });
        } catch(err) {
            console.error(err);
            res.json({ success: false });
        }
    });

    // LIVE MARKET TRIAL API ROUTE
    router.get('/live-market', async (req, res) => {
        const loggedInUser = req.query.username || 'Soniexchange';
        try {
            const userRef = doc(db, 'users', loggedInUser);
            const docSnap = await getDoc(userRef);
            const currentUser = docSnap.exists() ? docSnap.data() : { role: 'ADMIN' };

            let apiData = [];
            try {
                const response = await axios.get('http://103.189.172.254:8887/get-series-redis', { timeout: 5000 });
                apiData = response.data;
            } catch (apiErr) {
                console.error("Trial API fetch error:", apiErr.message);
            }

            let contentHTML = '';
            if (Array.isArray(apiData) && apiData.length > 0) {
                contentHTML = apiData.map(item => `
                    <div class="bg-white p-3 rounded shadow-xs border border-gray-200 flex justify-between items-center text-xs">
                        <div>
                            <span class="font-bold text-[#0077b6]">Sport:</span> ${item.sportName || 'N/A'} (ID: ${item.sportId || '-'})<br>
                            <span class="font-semibold text-gray-700">Competition:</span> ${item.competitionName || 'N/A'} (ID: ${item.competitionId || '-'})
                        </div>
                        <div class="text-right">
                            <span class="bg-gray-100 px-2 py-1 rounded text-[10px] font-bold">Region: ${item.competitionRegion || 'GLOBAL'}</span><br>
                            <span class="text-gray-500 text-[10px]">Market Count: ${item.marketCount || 0}</span>
                        </div>
                    </div>
                `).join('');
            } else {
                contentHTML = `<div class="p-4 bg-white text-center text-gray-500 rounded border">No live market data available right now from trial API or API is offline.</div>`;
            }

            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Live Market - Soniexchange</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                    <style>body { font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; }</style>
                </head>
                <body class="min-h-screen flex flex-col text-xs">
                    ${getHeaderAndSidebar(loggedInUser, currentUser.role)}
                    <main class="flex-1 p-4 max-w-6xl mx-auto w-full space-y-3">
                        <div class="flex justify-between items-center mb-2">
                            <h2 class="text-base font-bold text-gray-800"><i class="fa-solid fa-satellite-dish text-[#0077b6] mr-1"></i> Live Market Trial Feed</h2>
                            <a href="/live-market?username=${encodeURIComponent(loggedInUser)}" class="bg-[#0077b6] text-white px-3 py-1 rounded text-xs font-bold shadow-xs">Refresh Feed</a>
                        </div>
                        <div class="space-y-2">
                            ${contentHTML}
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

    return router;
}

module.exports =  setupApiRoutes ;
