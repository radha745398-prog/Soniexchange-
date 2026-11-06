const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { doc, getDoc, updateDoc } = require('firebase/firestore');

function setupAuthRoutes(db, getBotInstance) {
    // 1. SIGN IN PAGE
    router.get('/', (req, res) => {
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Sign In - Soniexchange</title>
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
                            <button type="submit" class="w-full bg-[#0088cc] hover:bg-[#006699] text-white font-bold py-2.5 rounded text-xs transition shadow cursor-pointer">
                                Login →
                            </button>
                        </form>
                    </div>
                </div>
            </body>
            </html>
        `);
    });

    // 2. SECURE AUTH & TELEGRAM VERIFICATION PAGE
    router.get('/admin/secureauth', async (req, res) => {
        const loggedInUser = req.query.username || req.session.loggedInUser || 'Soniexchange';
        try {
            const userRef = doc(db, 'users', loggedInUser);
            const docSnap = await getDoc(userRef);
            const currentUser = docSnap.exists() ? docSnap.data() : { role: 'ADMIN' };

            let secretBase32 = currentUser.gauthSecret;
            if (!secretBase32) {
                const secret = speakeasy.generateSecret({ name: `Soniexchange (${loggedInUser})` });
                secretBase32 = secret.base32;
                await updateDoc(userRef, { gauthSecret: secretBase32 });
            }

            const otpauthUrl = speakeasy.otpauthURL({
                secret: secretBase32,
                label: `Soniexchange:${loggedInUser}`,
                encoding: 'base32'
            });

            const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
            const isAuthEnabled = currentUser.gauthEnabled === true || currentUser.telegramEnabled === true;

            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Secure Auth Verification - Soniexchange</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                </head>
                <body class="min-h-screen flex flex-col text-xs bg-[#f4f6f8]">
                    <main class="flex-1 p-6 max-w-xl mx-auto w-full">
                        <div class="bg-white border rounded p-6 shadow-xs text-center space-y-4">
                            <h2 class="text-sm font-bold">Secure Auth Verification Status: <span class="${isAuthEnabled ? 'text-green-600' : 'text-red-500'}">${isAuthEnabled ? 'Enabled' : 'Disabled'}</span></h2>
                            <p class="text-gray-600">Telegram connection code: <b class="text-blue-600">${currentUser.telegramCode || 'Not Generated'}</b></p>
                            <div class="flex justify-center my-3">
                                <img src="${qrCodeDataUrl}" alt="QR Code" class="w-36 h-36 border p-1 bg-white">
                            </div>
                            <a href="/dashboard?username=${encodeURIComponent(loggedInUser)}" class="inline-block bg-[#0077b6] text-white px-4 py-1.5 rounded font-bold cursor-pointer">Back to Dashboard</a>
                        </div>
                    </main>
                </body>
                </html>
            `);
        } catch(err) {
            console.error("Secure auth error:", err);
            res.redirect('/');
        }
    });

    // 3. LOGIN PROCESS & ROLE-BASED CHECK
    router.post('/login-process', async (req, res) => {
        let { username, password } = req.body;
        username = username ? username.trim() : '';
        password = password ? password.trim() : '';

        try {
            const userRef = doc(db, 'users', username);
            const docSnap = await getDoc(userRef);

            if (!docSnap.exists()) {
                return res.redirect('/');
            }

            const user = docSnap.data();
            const isMatch = (password === user.password) || (await bcrypt.compare(password, user.password).catch(() => false));

            if (!isMatch) {
                return res.redirect('/');
            }

            // CRITICAL: Check if password change is mandatory on first login
            if (user.mustChangePassword === true) {
                return res.redirect(`/change-temporary-password?username=${encodeURIComponent(user.username)}`);
            }

            if (user.gauthEnabled === true || user.telegramEnabled === true) {
                req.session.pendingAuthUser = user.username;
                const bot = getBotInstance ? getBotInstance() : null;

                if (user.telegramEnabled && user.telegramChatId && bot) {
                    const teleOtp = Math.floor(100000 + Math.random() * 900000).toString();
                    req.session.pendingTelegramOtp = teleOtp;
                    try {
                        await bot.sendMessage(user.telegramChatId, `🔐 Your Soniexchange Login OTP code is: *${teleOtp}*. Valid for this login attempt.`, { parse_mode: 'Markdown' });
                    } catch (err) {
                        console.error("Failed to send telegram OTP:", err);
                    }
                }

                return res.redirect(`/login/verify-otp?username=${encodeURIComponent(user.username)}`);
            }

            req.session.loggedInUser = user.username;
            req.session.userRole = user.role || 'Client';

            if (user.role === 'ADMIN' || user.role === 'Super' || user.role === 'Master' || user.username === 'Soniexchange') {
                req.session.masterAdmin = user.username;
            }

            res.redirect(`/dashboard?username=${encodeURIComponent(user.username)}`);
        } catch(err) {
            console.error("Login process error:", err);
            res.redirect('/');
        }
    });

    // 4. MASTER IMPERSONATION ROUTE
    router.get('/admin/impersonate/:targetUser', async (req, res) => {
        const loggedInUser = req.session.loggedInUser;
        const masterAdmin = req.session.masterAdmin;
        const userRole = req.session.userRole;
        const targetUser = req.params.targetUser;

        try {
            const isMasterAuthorized = (masterAdmin === 'Soniexchange') || 
                                       (loggedInUser === 'Soniexchange') || 
                                       (userRole === 'ADMIN' || userRole === 'Super' || userRole === 'Master') || 
                                       (req.query.admin === 'Soniexchange');

            if (!isMasterAuthorized) {
                return res.redirect('/');
            }

            const targetRef = doc(db, 'users', targetUser);
            const targetSnap = await getDoc(targetRef);

            if (!targetSnap.exists()) {
                return res.redirect(`/dashboard?username=${encodeURIComponent(masterAdmin || 'Soniexchange')}`);
            }

            req.session.loggedInUser = targetUser;
            req.session.userRole = targetSnap.data().role || 'Client';
            req.session.masterAdmin = masterAdmin || 'Soniexchange';

            res.redirect(`/dashboard?username=${encodeURIComponent(targetUser)}`);
        } catch(err) {
            console.error("Impersonation error:", err);
            res.redirect(`/dashboard?username=Soniexchange`);
        }
    });

    // 5. LOGIN OTP VERIFICATION PAGE
    router.get('/login/verify-otp', async (req, res) => {
        const username = req.query.username || '';
        let hasGauth = false;
        let hasTelegram = false;

        try {
            if (username) {
                const userRef = doc(db, 'users', username);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    hasGauth = docSnap.data().gauthEnabled === true;
                    hasTelegram = docSnap.data().telegramEnabled === true;
                }
            }
        } catch (e) {
            console.error(e);
        }

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Two-Factor Authentication - Soniexchange</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-[#116491] min-h-screen flex flex-col items-center justify-center p-6 text-white font-sans">
                <div class="flex flex-col items-center justify-center w-full max-w-sm">
                    <div class="bg-white text-gray-800 rounded-lg shadow-2xl p-6 w-full text-center">
                        <h2 class="text-sm font-bold text-gray-800 mb-2">Security Verification</h2>
                        <p class="text-gray-600 text-[11px] mb-4">
                            ${hasGauth && hasTelegram ? 'Please enter your Google Authenticator 6-digit code or request an OTP via Telegram.' : 
                              hasTelegram ? 'Please enter the OTP sent to your connected Telegram account.' : 
                              'Please enter the 6-digit code from your Google Authenticator app.'}
                        </p>
                        
                        <form action="/api/login/verify-otp" method="POST" class="space-y-4" autocomplete="off">
                            <input type="hidden" name="username" value="${username}">
                            <div>
                                <input type="text" name="token" required placeholder="Enter verification code" maxlength="6" class="w-full bg-gray-50 border border-gray-300 rounded p-2.5 text-sm text-center font-bold tracking-widest text-gray-800 focus:outline-none focus:border-cyan-500">
                            </div>
                            <button type="submit" class="w-full bg-[#0088cc] hover:bg-[#006699] text-white font-bold py-2.5 rounded text-xs transition shadow cursor-pointer">
                                Verify & Login →
                            </button>
                        </form>

                        ${hasTelegram ? `
                            <div class="mt-4 pt-3 border-t border-gray-200">
                                <form action="/api/login/resend-telegram-otp" method="POST">
                                    <input type="hidden" name="username" value="${username}">
                                    <button type="submit" class="text-blue-600 hover:underline text-[11px] font-semibold bg-transparent border-0 cursor-pointer">
                                        📩 Resend / Send OTP via Telegram
                                    </button>
                                </form>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </body>
            </html>
        `);
    });

    // 6. RESEND TELEGRAM OTP ROUTE
    router.post('/api/login/resend-telegram-otp', async (req, res) => {
        const { username } = req.body;
        try {
            const userRef = doc(db, 'users', username);
            const docSnap = await getDoc(userRef);
            const bot = getBotInstance ? getBotInstance() : null;
            if (docSnap.exists() && docSnap.data().telegramChatId && bot) {
                const teleOtp = Math.floor(100000 + Math.random() * 900000).toString();
                req.session.pendingTelegramOtp = teleOtp;
                await bot.sendMessage(docSnap.data().telegramChatId, `🔐 Your Soniexchange Login OTP code is: *${teleOtp}*.`, { parse_mode: 'Markdown' });
            }
        } catch (e) {
            console.error(e);
        }
        res.redirect(`/login/verify-otp?username=${encodeURIComponent(username)}`);
    });

    // 7. LOGIN OTP VERIFICATION API
    router.post('/api/login/verify-otp', async (req, res) => {
        const { username, token } = req.body;
        try {
            const userRef = doc(db, 'users', username);
            const docSnap = await getDoc(userRef);

            if (!docSnap.exists()) {
                return res.redirect('/');
            }

            const user = docSnap.data();
            let verified = false;

            if (user.gauthEnabled && user.gauthSecret) {
                verified = speakeasy.totp.verify({
                    secret: user.gauthSecret,
                    encoding: 'base32',
                    token: token,
                    window: 1
                });
            }

            if (!verified && user.telegramEnabled && req.session.pendingTelegramOtp) {
                if (token.trim() === req.session.pendingTelegramOtp.trim()) {
                    verified = true;
                    delete req.session.pendingTelegramOtp;
                }
            }

            if (!verified) {
                return res.redirect(`/login/verify-otp?username=${encodeURIComponent(username)}&error=invalid`);
            }

            if (user.mustChangePassword === true) {
                return res.redirect(`/change-temporary-password?username=${encodeURIComponent(user.username)}`);
            }

            req.session.loggedInUser = user.username;
            req.session.userRole = user.role || 'Client';
            if (user.role === 'ADMIN' || user.role === 'Super' || user.role === 'Master' || user.username === 'Soniexchange') {
                req.session.masterAdmin = user.username;
            }
            delete req.session.pendingAuthUser;

            res.redirect(`/dashboard?username=${encodeURIComponent(user.username)}`);
        } catch (err) {
            console.error(err);
            res.redirect('/');
        }
    });

    // 8. FIRST TIME TEMPORARY PASSWORD CHANGE PAGE (MATCHING SCREENSHOT 1)
    router.get('/change-temporary-password', (req, res) => {
        const username = req.query.username || '';
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Change Password - Soniexchange</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            </head>
            <body class="bg-[#116491] min-h-screen flex items-center justify-center p-4 font-sans">
                <div class="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full text-gray-800">
                    <div class="flex items-center justify-center mb-6">
                        <div class="border-t border-gray-300 flex-grow mr-3"></div>
                        <span class="text-gray-700 text-sm font-bold flex items-center gap-1.5">Login <i class="fa-solid fa-lock text-xs"></i></span>
                        <div class="border-t border-gray-300 flex-grow ml-3"></div>
                    </div>
                    <form action="/api/update-temporary-password" method="POST" class="space-y-4" autocomplete="off">
                        <input type="hidden" name="username" value="${username}">
                        <div>
                            <label class="block text-xs font-semibold text-gray-700 mb-1">Current Password:</label>
                            <input type="password" name="currentPassword" required placeholder="Enter Current password" class="w-full bg-gray-50 border border-gray-300 rounded p-2.5 text-xs text-gray-800 focus:outline-none focus:border-cyan-500">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-700 mb-1">New Password:</label>
                            <input type="password" name="newPassword" required placeholder="Enter New Password" class="w-full bg-gray-50 border border-gray-300 rounded p-2.5 text-xs text-gray-800 focus:outline-none focus:border-cyan-500">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-700 mb-1">Confirm Password:</label>
                            <input type="password" name="confirmPassword" required placeholder="Confirm New Password" class="w-full bg-gray-50 border border-gray-300 rounded p-2.5 text-xs text-gray-800 focus:outline-none focus:border-cyan-500">
                        </div>
                        <button type="submit" class="w-full bg-[#1b3b4b] hover:bg-[#132a36] text-white font-bold py-2.5 rounded text-xs transition shadow cursor-pointer">
                            Change Password
                        </button>
                    </form>
                </div>
            </body>
            </html>
        `);
    });

    // 9. API FOR FIRST TIME PASSWORD & 30-SEC TRANSACTION PASSWORD DISPLAY (MATCHING SCREENSHOT 2)
    router.post('/api/update-temporary-password', async (req, res) => {
        const { username, currentPassword, newPassword, confirmPassword } = req.body;
        
        if (newPassword !== confirmPassword) {
            return res.redirect(`/change-temporary-password?username=${encodeURIComponent(username)}&error=mismatch`);
        }

        try {
            const userRef = doc(db, 'users', username);
            const docSnap = await getDoc(userRef);

            if (!docSnap.exists()) {
                return res.redirect('/');
            }

            const userData = docSnap.data();
            
            // Verify current password matches temporary password
            const isMatch = (currentPassword === userData.password) || (await bcrypt.compare(currentPassword, userData.password).catch(() => false));
            if (!isMatch) {
                return res.redirect(`/change-temporary-password?username=${encodeURIComponent(username)}&error=invalid_current`);
            }

            const userRole = userData.role || 'Client';
            // Check if user is a client (supporting both 'Client' and 'User')
            const isClient = (userRole === 'Client' || userRole === 'User');

            // IF CLIENT: Update password, remove flag, and redirect straight to login page
            if (isClient) {
                await updateDoc(userRef, {
                    password: newPassword,
                    mustChangePassword: false
                });
                return res.redirect('/');
            }

            // IF ADMIN / SUPER / MASTER: Generate transaction password, remove flag, and show 30-sec screen
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
                    <title>Transaction Password Generated - Soniexchange</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                </head>
                <body class="min-h-screen flex items-center justify-center p-4 text-xs font-sans bg-white">
                    <div class="p-6 max-w-xl w-full text-center space-y-4 text-gray-800 border border-gray-300 rounded shadow-lg bg-gray-50">
                        <div class="space-y-1">
                            <p class="text-green-700 font-bold text-sm">Success! Your password has been updated successfully.</p>
                            <p class="text-green-700 font-bold text-xs">Success! आपका पासवर्ड बदला जा चुका है।</p>
                            <p class="text-red-600 font-bold text-xs pt-1">
                                Redirecting to Sign In in <span id="countdown" class="text-base text-black underline">30</span> seconds...
                            </p>
                        </div>

                        <div class="bg-white p-4 border border-blue-200 rounded shadow-inner my-2">
                            <p class="text-gray-800 font-semibold text-[11px]">Your transaction password is <span class="text-blue-600 font-bold text-xl tracking-wider">${txnPass}</span>.</p>
                            <p class="text-gray-800 font-semibold text-[11px] mt-0.5">आपका लेनदेन पासवर्ड <span class="text-blue-600 font-bold text-xl tracking-wider">${txnPass}</span> है।</p>
                        </div>

                        <div class="text-gray-700 text-[11px] leading-relaxed space-y-1 px-4">
                            <p>Please remember this transaction password, from now on all transactions of the website can be done only with this password and keep one thing in mind, do not share this password with anyone.</p>
                            <p>कृपया इस लेन-देन के पासवर्ड को याद रखें, अब से वेबसाइट के सभी हस्तांतरण केवल इस पासवर्ड से किए जा सकते हैं और एक बात का ध्यान रखें, इस पासवर्ड को किसी के साथ साझा न करें।</p>
                        </div>

                        <div class="text-gray-600 text-[11px] pt-1 font-medium">
                            Thank you, Team Soniexchange<br>
                            धन्यवाद, टीम Soniexchange
                        </div>

                        <div class="pt-2">
                            <a href="/" class="inline-block bg-[#343a40] hover:bg-black text-white font-bold px-6 py-1.5 rounded text-xs shadow-xs transition cursor-pointer">
                                <i class="fa-solid fa-arrow-left mr-1"></i> Back
                            </a>
                        </div>
                    </div>

                    <script>
                        let seconds = 30;
                        const timer = setInterval(() => {
                            seconds--;
                            const countEl = document.getElementById('countdown');
                            if (countEl) countEl.innerText = seconds;
                            if (seconds <= 0) {
                                clearInterval(timer);
                                window.location.href = '/';
                            }
                        }, 1000);
                    </script>
                </body>
                </html>
            `);
        } catch(err) {
            console.error(err);
            res.redirect('/');
        }
    });

    // 10. SECURE LOGOUT ROUTE
    router.get('/logout', (req, res) => {
        try {
            req.session.destroy(() => {
                res.clearCookie('connect.sid', { path: '/' });
                res.redirect('/');
            });
        } catch (err) {
            res.redirect('/');
        }
    });

    return router;
}

module.exports = setupAuthRoutes;
