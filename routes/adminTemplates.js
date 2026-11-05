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

        <!-- EXPOSURE LIMIT MODAL -->
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

        <!-- CREDIT REFERENCE MODAL -->
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

        <!-- PASSWORD CHANGE MODAL -->
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

        <!-- CHANGE STATUS MODAL -->
        <div id="statusModal" class="fixed inset-0 bg-black/45 hidden items-start justify-center pt-16 z-50">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-md mx-3 overflow-hidden text-gray-800 border border-gray-300 p-4">
                <div class="flex justify-between items-center border-b pb-2 mb-3">
                    <span class="font-bold text-sm">Change Status</span>
                    <button type="button" onclick="closeStatusModal()" class="cursor-pointer text-xs font-bold bg-[#0077b6] text-white w-5 h-5 rounded-full flex items-center justify-center">✕</button>
                </div>
                <form action="/api/change-status" method="POST" class="space-y-4 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="statusClientUsername">

                    <div class="font-semibold text-[#d97706]" id="statusClientTitleDisplay">Client</div>

                    <div class="flex justify-around items-center bg-gray-50 p-3 border rounded">
                        <div class="text-center">
                            <span class="block font-semibold text-gray-700 mb-1">User Active</span>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="userActive" id="statusUserActiveCheckbox" value="true" class="sr-only peer">
                                <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0077b6]"></div>
                            </label>
                        </div>
                        <div class="text-center">
                            <span class="block font-semibold text-gray-700 mb-1">Bet Active</span>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="betActive" id="statusBetActiveCheckbox" value="true" class="sr-only peer">
                                <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0077b6]"></div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-gray-700 mb-1">Transaction Password</label>
                        <input type="password" name="txnPassword" required placeholder="Transaction Password" class="w-full border border-gray-300 p-1.5 rounded bg-white focus:outline-none">
                    </div>

                    <div class="flex justify-end items-center space-x-2 pt-3 border-t mt-2">
                        <button type="button" onclick="closeStatusModal()" class="bg-[#2b3a4a] hover:bg-black text-white px-3 py-1.5 rounded font-bold cursor-pointer flex items-center space-x-1">
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

            function openPasswordModal(clientName) {
                document.getElementById('passwordClientUsername').value = clientName;
                const modal = document.getElementById('passwordModal');
                if(modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
            }

            function closePasswordModal() {
                const modal = document.getElementById('passwordModal');
                if(modal) { modal.classList.remove('flex'); modal.classList.add('hidden'); }
            }

            function openStatusModal(clientName, userActive, betActive) {
                document.getElementById('statusClientUsername').value = clientName;
                document.getElementById('statusClientTitleDisplay').innerText = clientName;
                
                document.getElementById('statusUserActiveCheckbox').checked = (userActive !== 'false' && userActive !== false);
                document.getElementById('statusBetActiveCheckbox').checked = (betActive !== 'false' && betActive !== false);

                const modal = document.getElementById('statusModal');
                if(modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
            }

            function closeStatusModal() {
                const modal = document.getElementById('statusModal');
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

module.exports = { getHeaderAndSidebar, getModalsHTML, getModalScriptsJS };
