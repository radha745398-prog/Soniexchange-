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
                        <a href="/soni-view?username=${encodeURIComponent(loggedInUser)}" class="hover:underline py-0.5 px-1 font-semibold">List of Clients</a>
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
                </div>
            </header>

            <aside id="sportsSidebar" class="w-64 bg-white text-gray-800 flex flex-col fixed inset-y-0 left-0 transform -translate-x-full transition-transform duration-300 ease-in-out shadow-2xl border-r" style="z-index: 999999;">
                <div class="p-3 bg-[#0077b6] text-white flex justify-between items-center">
                    <span class="font-bold text-sm">Sports</span>
                    <button type="button" id="sidebarCloseBtn" class="text-white hover:text-gray-200 cursor-pointer"><i class="fa-solid fa-xmark text-base pointer-events-none"></i></button>
                </div>
                <div class="p-2 border-b">
                    <input type="text" placeholder="Search Event" class="w-full border p-1 rounded text-xs focus:outline-none">
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
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Darts</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Horse Racing</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>E-Sports</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Basketball</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Motor Sports</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Chess</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Volleyball</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Ice Hockey</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Badminton</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Cycling</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Motorbikes</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Athletics</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Basketball 3x3</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Virtual Sports</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Politics</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Water Sports</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Baseball</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Rugby Union</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Rugby League</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Gaelic</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>American Football</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Snooker</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Soccer</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Esports</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Greyhound Racing</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Kabaddi</span> <span>+</span></div>
                    <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Boat Racing</span> <span>+</span></div>
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

    function getModalsHTML(loggedInUser, currentUserPoints) {
        return `
            <!-- DEPOSIT MODAL -->
            <div id="depositModal" class="fixed inset-0 bg-black/45 hidden items-start justify-center pt-12 z-50">
                <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300 p-4">
                    <div class="flex justify-between items-center border-b pb-2 mb-3">
                        <span class="font-bold text-sm">Deposit</span>
                        <div class="flex items-center space-x-2">
                            <span class="bg-[#f0f2f5] text-gray-700 text-[10px] px-2 py-0.5 rounded border font-semibold flex items-center space-x-1 cursor-pointer"><i class="fa-solid fa-cloud-arrow-up"></i> <span>Back up now</span></span>
                            <button type="button" onclick="closeDepositModal()" class="cursor-pointer text-xs font-bold bg-[#343a40] text-white px-2 py-0.5 rounded">✕</button>
                        </div>
                    </div>
                    <form action="/api/deposit" method="POST" class="space-y-3 text-xs">
                        <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                        <input type="hidden" name="clientUsername" id="modalClientUsername">
                        
                        <div class="grid grid-cols-2 gap-2">
                            <div class="bg-gray-100 border p-1.5 rounded font-semibold text-gray-700 flex items-center" id="modalAdminName">${loggedInUser}</div>
                            <div class="grid grid-cols-2 gap-1">
                                <div class="bg-gray-100 border p-1.5 rounded text-right font-semibold flex items-center justify-end" id="modalAdminCurrent">${Number(currentUserPoints || 0).toLocaleString()}</div>
                                <div class="bg-gray-100 border p-1.5 rounded text-right font-semibold flex items-center justify-end text-gray-600" id="modalAdminTotal">${Number(currentUserPoints || 0).toLocaleString()}</div>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-2">
                            <div class="bg-gray-100 border p-1.5 rounded font-semibold text-gray-700 flex items-center" id="modalClientDisplay">Client</div>
                            <div class="grid grid-cols-2 gap-1">
                                <div class="bg-gray-100 border p-1.5 rounded text-right font-semibold flex items-center justify-end" id="modalClientCurrent">0</div>
                                <div class="bg-gray-100 border p-1.5 rounded text-right font-semibold flex items-center justify-end text-gray-600" id="modalClientTotal">0</div>
                            </div>
                        </div>

                        <div>
                            <label class="block font-semibold text-gray-700 mb-1">Amount</label>
                            <input type="number" name="amount" id="depositAmountInput" oninput="calculateDepositTotal()" required placeholder="Amount" class="w-full border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                        </div>

                        <div>
                            <label class="block font-semibold text-gray-700 mb-1">Remark</label>
                            <input type="text" name="remark" placeholder="Remark" class="w-full border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                        </div>

                        <div>
                            <label class="block font-semibold text-gray-700 mb-1">Transaction Password</label>
                            <input type="password" name="txnPassword" required placeholder="Transaction Password" class="w-full border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                        </div>

                        <div class="flex justify-between items-center pt-2">
                            <button type="button" onclick="closeDepositModal()" class="bg-[#2b3a4a] hover:bg-black text-white px-4 py-1.5 rounded font-bold cursor-pointer flex items-center space-x-1">
                                <i class="fa-solid fa-arrow-left"></i> <span>BACK</span>
                            </button>
                            <button type="submit" class="bg-[#2b3a4a] hover:bg-black text-white px-5 py-1.5 rounded font-bold cursor-pointer flex items-center space-x-1">
                                <span>submit</span> <i class="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- WITHDRAW MODAL -->
            <div id="withdrawModal" class="fixed inset-0 bg-black/45 hidden items-start justify-center pt-12 z-50">
                <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300 p-4">
                    <div class="flex justify-between items-center border-b pb-2 mb-3">
                        <span class="font-bold text-sm">Withdraw</span>
                        <div class="flex items-center space-x-2">
                            <span class="bg-[#f0f2f5] text-gray-700 text-[10px] px-2 py-0.5 rounded border font-semibold flex items-center space-x-1 cursor-pointer"><i class="fa-solid fa-cloud-arrow-up"></i> <span>Back up now</span></span>
                            <button type="button" onclick="closeWithdrawModal()" class="cursor-pointer text-xs font-bold bg-[#343a40] text-white px-2 py-0.5 rounded">✕</button>
                        </div>
                    </div>
                    <form action="/api/withdraw" method="POST" class="space-y-3 text-xs">
                        <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                        <input type="hidden" name="clientUsername" id="withdrawClientUsername">
                        
                        <div class="grid grid-cols-2 gap-2">
                            <div class="bg-gray-100 border p-1.5 rounded font-semibold text-gray-700 flex items-center" id="withdrawAdminDisplay">${loggedInUser}</div>
                            <div class="grid grid-cols-2 gap-1">
                                <div class="bg-gray-100 border p-1.5 rounded text-right font-semibold flex items-center justify-end" id="withdrawAdminCurrent">${Number(currentUserPoints || 0).toLocaleString()}</div>
                                <div class="bg-gray-100 border p-1.5 rounded text-right font-semibold flex items-center justify-end text-gray-600" id="withdrawAdminTotal">${Number(currentUserPoints || 0).toLocaleString()}</div>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-2">
                            <div class="bg-gray-100 border p-1.5 rounded font-semibold text-gray-700 flex items-center" id="withdrawClientDisplay">Client</div>
                            <div class="grid grid-cols-2 gap-1">
                                <div class="bg-gray-100 border p-1.5 rounded text-right font-semibold flex items-center justify-end" id="withdrawClientCurrent">0</div>
                                <div class="bg-gray-100 border p-1.5 rounded text-right font-semibold flex items-center justify-end text-gray-600" id="withdrawClientTotal">0</div>
                            </div>
                        </div>

                        <div>
                            <label class="block font-semibold text-gray-700 mb-1">Amount</label>
                            <input type="number" name="amount" id="withdrawAmountInput" oninput="calculateWithdrawTotal()" required placeholder="Amount" class="w-full border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                        </div>

                        <div>
                            <label class="block font-semibold text-gray-700 mb-1">Remark</label>
                            <input type="text" name="remark" placeholder="Remark" class="w-full border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                        </div>

                        <div>
                            <label class="block font-semibold text-gray-700 mb-1">Transaction Password</label>
                            <input type="password" name="txnPassword" required placeholder="Transaction Password" class="w-full border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                        </div>

                        <div class="flex justify-between items-center pt-2">
                            <button type="button" onclick="closeWithdrawModal()" class="bg-[#2b3a4a] hover:bg-black text-white px-4 py-1.5 rounded font-bold cursor-pointer flex items-center space-x-1">
                                <i class="fa-solid fa-arrow-left"></i> <span>BACK</span>
                            </button>
                            <button type="submit" class="bg-[#2b3a4a] hover:bg-black text-white px-5 py-1.5 rounded font-bold cursor-pointer flex items-center space-x-1">
                                <span>submit</span> <i class="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- EXPOSURE LIMIT MODAL ('L' BUTTON) -->
            <div id="exposureModal" class="fixed inset-0 bg-black/45 hidden items-start justify-center pt-16 z-50">
                <div class="bg-white rounded-md shadow-2xl w-full max-w-md mx-3 overflow-hidden text-gray-800 border border-gray-300 p-4">
                    <div class="flex justify-between items-center border-b pb-2 mb-3">
                        <span class="font-bold text-sm">Exposure Limit</span>
                        <button type="button" onclick="closeExposureModal()" class="cursor-pointer text-xs font-bold bg-[#0077b6] text-white w-5 h-5 rounded-full flex items-center justify-center">✕</button>
                    </div>
                    <form action="/api/exposure-limit" method="POST" class="space-y-3 text-xs">
                        <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                        <input type="hidden" name="clientUsername" id="exposureClientUsername">
                        
                        <div class="grid grid-cols-3 items-center gap-2">
                            <label class="font-semibold text-gray-700">Old Limit</label>
                            <div class="col-span-2 bg-gray-200 border border-gray-300 p-1.5 rounded text-gray-600 font-semibold" id="exposureOldLimitDisplay">0.00</div>
                        </div>

                        <div class="grid grid-cols-3 items-center gap-2">
                            <label class="font-semibold text-gray-700">New Limit</label>
                            <input type="number" step="any" name="newLimit" required placeholder="New Limit" class="col-span-2 border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                        </div>

                        <div class="grid grid-cols-3 items-center gap-2">
                            <label class="font-semibold text-gray-700">Transaction Password</label>
                            <input type="password" name="txnPassword" required placeholder="Transaction Password" class="col-span-2 border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                        </div>

                        <div class="flex justify-end items-center space-x-2 pt-3 border-t mt-2">
                            <button type="button" onclick="closeExposureModal()" class="bg-[#2b3a4a] hover:bg-black text-white px-3 py-1.5 rounded font-bold cursor-pointer flex items-center space-x-1">
                                <i class="fa-solid fa-arrow-left"></i> <span>BACK</span>
                            </button>
                            <button type="submit" class="bg-[#0077b6] hover:bg-[#005f92] text-white px-4 py-1.5 rounded font-bold cursor-pointer flex items-center space-x-1">
                                <span>submit</span> <i class="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- CREDIT REFERENCE MODAL ('C' BUTTON) -->
            <div id="creditModal" class="fixed inset-0 bg-black/45 hidden items-start justify-center pt-16 z-50">
                <div class="bg-white rounded-md shadow-2xl w-full max-w-md mx-3 overflow-hidden text-gray-800 border border-gray-300 p-4">
                    <div class="flex justify-between items-center border-b pb-2 mb-3">
                        <span class="font-bold text-sm">Credit</span>
                        <button type="button" onclick="closeCreditModal()" class="cursor-pointer text-xs font-bold bg-[#0077b6] text-white w-5 h-5 rounded-full flex items-center justify-center">✕</button>
                    </div>
                    <form action="/api/credit-ref" method="POST" class="space-y-3 text-xs">
                        <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                        <input type="hidden" name="clientUsername" id="creditClientUsername">
                        
                        <div class="grid grid-cols-3 items-center gap-2">
                            <label class="font-semibold text-gray-700">Old Credit</label>
                            <div class="col-span-2 bg-gray-200 border border-gray-300 p-1.5 rounded text-gray-600 font-semibold" id="creditOldDisplay">0.00</div>
                        </div>

                        <div class="grid grid-cols-3 items-center gap-2">
                            <label class="font-semibold text-gray-700">New Credit</label>
                            <input type="number" step="any" name="newCredit" required placeholder="New Credit" class="col-span-2 border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                        </div>

                        <div class="grid grid-cols-3 items-center gap-2">
                            <label class="font-semibold text-gray-700">Transaction Password</label>
                            <input type="password" name="txnPassword" required placeholder="Transaction Password" class="col-span-2 border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                        </div>

                        <div class="flex justify-end items-center space-x-2 pt-3 border-t mt-2">
                            <button type="button" onclick="closeCreditModal()" class="bg-[#2b3a4a] hover:bg-black text-white px-3 py-1.5 rounded font-bold cursor-pointer flex items-center space-x-1">
                                <i class="fa-solid fa-arrow-left"></i> <span>BACK</span>
                            </button>
                            <button type="submit" class="bg-[#0077b6] hover:bg-[#005f92] text-white px-4 py-1.5 rounded font-bold cursor-pointer flex items-center space-x-1">
                                <span>submit</span> <i class="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- PASSWORD CHANGE MODAL ('P' BUTTON)[span_3](start_span)[span_3](end_span) -->
            <div id="passwordModal" class="fixed inset-0 bg-black/45 hidden items-start justify-center pt-16 z-50">
                <div class="bg-white rounded-md shadow-2xl w-full max-w-md mx-3 overflow-hidden text-gray-800 border border-gray-300 p-4">
                    <div class="flex justify-between items-center border-b pb-2 mb-3">
                        <span class="font-bold text-sm">Password</span>
                        <button type="button" onclick="closePasswordModal()" class="cursor-pointer text-xs font-bold bg-[#0077b6] text-white w-5 h-5 rounded-full flex items-center justify-center">✕</button>
                    </div>
                    <form action="/api/change-password" method="POST" class="space-y-3 text-xs">
                        <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                        <input type="hidden" name="clientUsername" id="passwordClientUsername">

                        <div class="grid grid-cols-3 items-center gap-2">
                            <label class="font-semibold text-gray-700">New Password</label>
                            <input type="password" name="newPassword" required placeholder="New Password" class="col-span-2 border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                        </div>

                        <div class="grid grid-cols-3 items-center gap-2">
                            <label class="font-semibold text-gray-700">Confirm Password</label>
                            <input type="password" name="confirmPassword" required placeholder="Confirm Password" class="col-span-2 border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                        </div>

                        <div class="grid grid-cols-3 items-center gap-2">
                            <label class="font-semibold text-gray-700">Transaction Password</label>
                            <input type="password" name="txnPassword" required placeholder="Transaction Password" class="col-span-2 border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                        </div>

                        <div class="flex justify-end items-center space-x-2 pt-3 border-t mt-2">
                            <button type="button" onclick="closePasswordModal()" class="bg-[#2b3a4a] hover:bg-black text-white px-3 py-1.5 rounded font-bold cursor-pointer flex items-center space-x-1">
                                <i class="fa-solid fa-arrow-left"></i> <span>BACK</span>
                            </button>
                            <button type="submit" class="bg-[#0077b6] hover:bg-[#005f92] text-white px-4 py-1.5 rounded font-bold cursor-pointer flex items-center space-x-1">
                                <span>submit</span> <i class="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            ${loggedInUser === 'Soniexchange' ? `
            <div id="adminBalanceModal" class="fixed inset-0 bg-black/45 hidden items-start justify-center pt-16 z-50">
                <div class="bg-white rounded-md shadow-2xl w-full max-w-sm mx-3 overflow-hidden text-gray-800 border border-gray-300 p-4">
                    <div class="flex justify-between items-center border-b pb-2 mb-2 bg-[#0077b6] text-white p-2 rounded-t">
                        <span class="font-bold text-xs">Update / Generate Master Points</span>
                        <button type="button" onclick="closeAdminBalanceModal()" class="cursor-pointer text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded">✕</button>
                    </div>
                    <form action="/api/admin/update-balance" method="POST" class="space-y-3 text-xs pt-2">
                        <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                        <div>
                            <label class="block font-semibold text-gray-700 mb-1">New Points Amount</label>
                            <input type="number" name="newBalance" required placeholder="Enter points" class="w-full border border-gray-300 p-1.5 rounded text-xs focus:outline-none">
                        </div>
                        <div>
                            <label class="block font-semibold text-gray-700 mb-1">Transaction Password</label>
                            <input type="password" name="txnPassword" required placeholder="Transaction Password" class="w-full border border-gray-300 p-1.5 rounded text-xs focus:outline-none">
                        </div>
                        <div class="flex justify-end space-x-2 pt-2">
                            <button type="button" onclick="closeAdminBalanceModal()" class="bg-gray-500 text-white px-3 py-1 rounded font-bold cursor-pointer">Cancel</button>
                            <button type="submit" class="bg-[#0099db] hover:bg-[#007cb3] text-white px-3 py-1 rounded font-bold cursor-pointer">Update Points</button>
                        </div>
                    </form>
                </div>
            </div>
            ` : ''}
        `;
    }

    function getModalScriptsJS() {
        return `
            <script>
                let baseAdminPoints = 0;
                let baseClientPoints = 0;

                function toggleSummaryBanner() {
                    const banner = document.getElementById('summaryBannerContent');
                    const arrowIcon = document.getElementById('summaryArrowIcon');
                    if (banner.classList.contains('hidden')) {
                        banner.classList.remove('hidden');
                        arrowIcon.className = "fa-solid fa-chevron-up text-xs";
                    } else {
                        banner.classList.add('hidden');
                        arrowIcon.className = "fa-solid fa-chevron-down text-xs";
                    }
                }

                function openDepositModal(clientName, clientPoints) {
                    baseClientPoints = Number(clientPoints || 0);
                    document.getElementById('modalClientUsername').value = clientName;
                    document.getElementById('modalClientDisplay').innerText = clientName;
                    document.getElementById('modalClientCurrent').innerText = baseClientPoints.toLocaleString();
                    document.getElementById('modalClientTotal').innerText = baseClientPoints.toLocaleString();
                    document.getElementById('depositAmountInput').value = '';
                    const modal = document.getElementById('depositModal');
                    if(modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
                }

                function calculateDepositTotal() {
                    const amtVal = Number(document.getElementById('depositAmountInput').value || 0);
                    const newClientTotal = baseClientPoints + amtVal;
                    document.getElementById('modalClientTotal').innerText = newClientTotal.toLocaleString();
                }

                function closeDepositModal() {
                    const modal = document.getElementById('depositModal');
                    if(modal) { modal.classList.remove('flex'); modal.classList.add('hidden'); }
                }

                function openWithdrawModal(clientName, clientPoints) {
                    baseClientPoints = Number(clientPoints || 0);
                    document.getElementById('withdrawClientUsername').value = clientName;
                    document.getElementById('withdrawClientDisplay').innerText = clientName;
                    document.getElementById('withdrawClientCurrent').innerText = baseClientPoints.toLocaleString();
                    document.getElementById('withdrawClientTotal').innerText = baseClientPoints.toLocaleString();
                    document.getElementById('withdrawAmountInput').value = '';
                    const modal = document.getElementById('withdrawModal');
                    if(modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
                }

                function calculateWithdrawTotal() {
                    const amtVal = Number(document.getElementById('withdrawAmountInput').value || 0);
                    const newClientTotal = baseClientPoints - amtVal;
                    document.getElementById('withdrawClientTotal').innerText = newClientTotal.toLocaleString();
                }

                function closeWithdrawModal() {
                    const modal = document.getElementById('withdrawModal');
                    if(modal) { modal.classList.remove('flex'); modal.classList.add('hidden'); }
                }

                function openExposureModal(clientName, exposureLimit) {
                    document.getElementById('exposureClientUsername').value = clientName;
                    document.getElementById('exposureOldLimitDisplay').innerText = Number(exposureLimit || 0).toLocaleString();
                    const modal = document.getElementById('exposureModal');
                    if(modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
                }

                function closeExposureModal() {
                    const modal = document.getElementById('exposureModal');
                    if(modal) { modal.classList.remove('flex'); modal.classList.add('hidden'); }
                }

                function openCreditModal(clientName, creditRef) {
                    document.getElementById('creditClientUsername').value = clientName;
                    document.getElementById('creditOldDisplay').innerText = Number(creditRef || 0).toLocaleString();
                    const modal = document.getElementById('creditModal');
                    if(modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
                }

                function closeCreditModal() {
                    const modal = document.getElementById('creditModal');
                    if(modal) { modal.classList.remove('flex'); modal.classList.add('hidden'); }
                }

                // --- PASSWORD MODAL SCRIPTS ('P' BUTTON)[span_4](start_span)[span_4](end_span) ---
                function openPasswordModal(clientName) {
                    document.getElementById('passwordClientUsername').value = clientName;
                    const modal = document.getElementById('passwordModal');
                    if(modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
                }

                function closePasswordModal() {
                    const modal = document.getElementById('passwordModal');
                    if(modal) { modal.classList.remove('flex'); modal.classList.add('hidden'); }
                }

                function openAdminBalanceModal() {
                    const modal = document.getElementById('adminBalanceModal');
                    if(modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
                }
                function closeAdminBalanceModal() {
                    const modal = document.getElementById('adminBalanceModal');
                    if(modal) { modal.classList.remove('flex'); modal.classList.add('hidden'); }
                }
                function filterTableBySearch() {
                    const q = (document.getElementById('tableSearchInput')?.value || '').toLowerCase();
                    const rows = document.querySelectorAll('#soniAccountTable tbody tr');
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

    router.get('/dashboard', async (req, res) => {
        const loggedInUser = req.query.username || 'Soniexchange';
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
                    <title>Dashboard</title>
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
        } catch(err) {
            res.redirect('/');
        }
    });

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

            let usersList = allUsersList.filter(u => {
                const isActive = u.userActive !== false;
                return tab === 'active' ? isActive : !isActive;
            });

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
                            <button class="bg-[#343a40] text-white px-1.5 py-0.5 rounded text-[10px] font-bold">S</button>
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

                    <!-- EXPANDABLE SUMMARY BANNER (DEFAULT HIDDEN) -->
                    <div class="bg-[#0077b6] text-white shadow-md">
                        <div class="flex justify-center items-center py-1 cursor-pointer hover:bg-black/10 transition" onclick="toggleSummaryBanner()">
                            <button type="button" class="text-white text-xs focus:outline-none cursor-pointer">
                                <i id="summaryArrowIcon" class="fa-solid fa-chevron-down text-xs pointer-events-none"></i>
                            </button>
                        </div>
                        <div id="summaryBannerContent" class="hidden px-4 pb-3 pt-1 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1.5 text-[11px] border-t border-white/20">
                            <div class="flex justify-between py-0.5"><span>Upper Level Credit Reference:</span><span class="font-semibold">0</span></div>
                            <div class="flex justify-between py-0.5"><span>Down level Occupy Balance:</span><span class="font-semibold">0</span></div>
                            <div class="flex justify-between py-0.5"><span>Down Level Credit Reference:</span><span class="font-semibold">100</span></div>
                            <div class="flex justify-between py-0.5">
                                <span>Total Master Balance:</span>
                                <span class="font-semibold flex items-center space-x-1">
                                    <span>${Number(currentUser.points || 0).toLocaleString()}</span>
                                    ${loggedInUser === 'Soniexchange' ? `
                                    <button type="button" onclick="openAdminBalanceModal()" class="ml-1 bg-white text-[#0077b6] hover:bg-gray-100 font-bold text-[9px] px-1.5 py-0.2 rounded shadow-xs cursor-pointer">Update</button>
                                    ` : ''}
                                </span>
                            </div>
                            <div class="flex justify-between py-0.5"><span>Upper Level:</span><span class="font-semibold">-1000</span></div>
                            <div class="flex justify-between py-0.5"><span>Down Level Profit/Loss:</span><span class="font-semibold">-100</span></div>
                            <div class="flex justify-between py-0.5">
                                <span>Available Balance:</span>
                                <span class="font-semibold flex items-center space-x-1">
                                    <span>${Number(currentUser.points || 0).toLocaleString()}</span>
                                    ${loggedInUser === 'Soniexchange' ? `
                                    <button type="button" onclick="openAdminBalanceModal()" class="ml-1 bg-white text-[#0077b6] hover:bg-gray-100 font-bold text-[9px] px-1.5 py-0.2 rounded shadow-xs cursor-pointer">Update</button>
                                    ` : ''}
                                </span>
                            </div>
                            <div class="flex justify-between py-0.5"><span>Available Balance With Profit/Loss:</span><span class="font-semibold">1000</span></div>
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

    router.post('/api/admin/update-balance', async (req, res) => {
        const { loggedInUser, newBalance, txnPassword } = req.body;
        const amount = Number(newBalance);

        if (isNaN(amount) || amount < 0 || loggedInUser !== 'Soniexchange') {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        }

        try {
            const userRef = doc(db, 'users', 'Soniexchange');
            const docSnap = await getDoc(userRef);

            if (!docSnap.exists()) return res.redirect('/');
            const user = docSnap.data();

            if (user.txnPassword && user.txnPassword !== txnPassword) {
                return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
            }

            await updateDoc(userRef, {
                points: amount,
                creditRef: amount
            });

            res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        } catch(err) {
            console.error(err);
            res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
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

    router.post('/api/clients/create', async (req, res) => {
        const { createdBy, clientName, password, creditRef, accountType, txnPassword } = req.body;
        
        if (!clientName || !password) {
            return res.redirect('/soni-view?username=' + encodeURIComponent(createdBy || 'Soniexchange'));
        }

        try {
            const userRef = doc(db, 'users', clientName.trim());
            const docSnap = await getDoc(userRef);
            
            if (docSnap.exists()) {
                return res.redirect('/soni-view?username=' + encodeURIComponent(createdBy || 'Soniexchange'));
            }

            await setDoc(userRef, {
                username: clientName.trim(),
                password: password,
                creditRef: Number(creditRef || 0),
                points: Number(creditRef || 0),
                exposure: 0,
                exposureLimit: Number(creditRef || 0),
                role: accountType || 'Client',
                createdBy: createdBy || 'Soniexchange',
                userActive: true,
                betActive: true,
                defaultPct: 0,
                txnPassword: txnPassword || '',
                createdAt: new Date().toISOString()
            });

            res.redirect('/soni-view?username=' + encodeURIComponent(createdBy || 'Soniexchange'));
        } catch(err) {
            console.error(err);
            res.redirect('/soni-view?username=' + encodeURIComponent(createdBy || 'Soniexchange'));
        }
    });

    // --- DEPOSIT API ROUTE ---
    router.post('/api/deposit', async (req, res) => {
        const { loggedInUser, clientUsername, amount, txnPassword } = req.body;
        const depositAmount = Number(amount);

        if (isNaN(depositAmount) || depositAmount <= 0 || !clientUsername) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
        }

        try {
            const adminRef = doc(db, 'users', loggedInUser || 'Soniexchange');
            const adminSnap = await getDoc(adminRef);

            if (!adminSnap.exists()) return res.redirect('/');
            const adminData = adminSnap.data();

            if (adminData.txnPassword && adminData.txnPassword !== txnPassword) {
                return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
            }

            const clientRef = doc(db, 'users', clientUsername.trim());
            const clientSnap = await getDoc(clientRef);

            if (!clientSnap.exists()) {
                return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
            }
            const clientData = clientSnap.data();

            const updatedClientPoints = Number(clientData.points || 0) + depositAmount;
            const updatedAdminPoints = Number(adminData.points || 0) - depositAmount;

            await updateDoc(clientRef, { points: updatedClientPoints });
            await updateDoc(adminRef, { points: updatedAdminPoints });

            res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        } catch (err) {
            console.error("Deposit Error:", err);
            res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
        }
    });

    // --- WITHDRAW API ROUTE ---
    router.post('/api/withdraw', async (req, res) => {
        const { loggedInUser, clientUsername, amount, txnPassword } = req.body;
        const withdrawAmount = Number(amount);

        if (isNaN(withdrawAmount) || withdrawAmount <= 0 || !clientUsername) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
        }

        try {
            const adminRef = doc(db, 'users', loggedInUser || 'Soniexchange');
            const adminSnap = await getDoc(adminRef);

            if (!adminSnap.exists()) return res.redirect('/');
            const adminData = adminSnap.data();

            if (adminData.txnPassword && adminData.txnPassword !== txnPassword) {
                return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
            }

            const clientRef = doc(db, 'users', clientUsername.trim());
            const clientSnap = await getDoc(clientRef);

            if (!clientSnap.exists()) {
                return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
            }
            const clientData = clientSnap.data();

            const updatedClientPoints = Number(clientData.points || 0) - withdrawAmount;
            const updatedAdminPoints = Number(adminData.points || 0) + withdrawAmount;

            await updateDoc(clientRef, { points: updatedClientPoints });
            await updateDoc(adminRef, { points: updatedAdminPoints });

            res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        } catch (err) {
            console.error("Withdraw Error:", err);
            res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
        }
    });

    // --- EXPOSURE LIMIT API ROUTE ('L' BUTTON) ---
    router.post('/api/exposure-limit', async (req, res) => {
        const { loggedInUser, clientUsername, newLimit, txnPassword } = req.body;
        const limitAmount = Number(newLimit);

        if (isNaN(limitAmount) || limitAmount < 0 || !clientUsername) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
        }

        try {
            const adminRef = doc(db, 'users', loggedInUser || 'Soniexchange');
            const adminSnap = await getDoc(adminRef);

            if (!adminSnap.exists()) return res.redirect('/');
            const adminData = adminSnap.data();

            if (adminData.txnPassword && adminData.txnPassword !== txnPassword) {
                return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
            }

            const clientRef = doc(db, 'users', clientUsername.trim());
            const clientSnap = await getDoc(clientRef);

            if (!clientSnap.exists()) {
                return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
            }

            await updateDoc(clientRef, { exposureLimit: limitAmount });

            res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        } catch (err) {
            console.error("Exposure Limit Error:", err);
            res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
        }
    });

    // --- CREDIT REFERENCE API ROUTE ('C' BUTTON) ---
    router.post('/api/credit-ref', async (req, res) => {
        const { loggedInUser, clientUsername, newCredit, txnPassword } = req.body;
        const creditAmount = Number(newCredit);

        if (isNaN(creditAmount) || creditAmount < 0 || !clientUsername) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
        }

        try {
            const adminRef = doc(db, 'users', loggedInUser || 'Soniexchange');
            const adminSnap = await getDoc(adminRef);

            if (!adminSnap.exists()) return res.redirect('/');
            const adminData = adminSnap.data();

            if (adminData.txnPassword && adminData.txnPassword !== txnPassword) {
                return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
            }

            const clientRef = doc(db, 'users', clientUsername.trim());
            const clientSnap = await getDoc(clientRef);

            if (!clientSnap.exists()) {
                return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
            }

            await updateDoc(clientRef, { creditRef: creditAmount });

            res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        } catch (err) {
            console.error("Credit Reference Error:", err);
            res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
        }
    });

    // --- PASSWORD CHANGE API ROUTE ('P' BUTTON)[span_5](start_span)[span_5](end_span) ---
    router.post('/api/change-password', async (req, res) => {
        const { loggedInUser, clientUsername, newPassword, confirmPassword, txnPassword } = req.body;

        if (!clientUsername || !newPassword || newPassword !== confirmPassword) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
        }

        try {
            const adminRef = doc(db, 'users', loggedInUser || 'Soniexchange');
            const adminSnap = await getDoc(adminRef);

            if (!adminSnap.exists()) return res.redirect('/');
            const adminData = adminSnap.data();

            if (adminData.txnPassword && adminData.txnPassword !== txnPassword) {
                return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
            }

            const clientRef = doc(db, 'users', clientUsername.trim());
            const clientSnap = await getDoc(clientRef);

            if (!clientSnap.exists()) {
                return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
            }

            await updateDoc(clientRef, { password: newPassword });

            res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        } catch (err) {
            console.error("Password Change Error:", err);
            res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
        }
    });

    return router;
}

module.exports = setupAdminRoutes;
