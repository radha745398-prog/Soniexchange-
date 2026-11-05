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
    `;
}

function getModalsHTML(loggedInUser, currentUserPoints) {
    return `
        <!-- DEPOSIT MODAL -->
        <div id="depositModal" class="fixed inset-0 bg-black/45 hidden items-start justify-center pt-12 z-50">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300 p-4">
                <div class="flex justify-between items-center border-b pb-2 mb-3">
                    <span class="font-bold text-sm">Deposit</span>
                    <button type="button" onclick="closeDepositModal()" class="cursor-pointer text-xs font-bold bg-[#343a40] text-white px-2 py-0.5 rounded">✕</button>
                </div>
                <form action="/api/deposit" method="POST" class="space-y-3 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalClientUsername">
                    <div class="grid grid-cols-2 gap-2">
                        <div class="bg-gray-100 border p-1.5 rounded font-semibold text-gray-700">${loggedInUser}</div>
                        <div class="grid grid-cols-2 gap-1">
                            <div class="bg-gray-100 border p-1.5 rounded text-right font-semibold" id="modalAdminCurrent">${Number(currentUserPoints || 0).toLocaleString()}</div>
                            <div class="bg-gray-100 border p-1.5 rounded text-right font-semibold text-gray-600" id="modalAdminTotal">${Number(currentUserPoints || 0).toLocaleString()}</div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div class="bg-gray-100 border p-1.5 rounded font-semibold text-gray-700" id="modalClientDisplay">Client</div>
                        <div class="grid grid-cols-2 gap-1">
                            <div class="bg-gray-100 border p-1.5 rounded text-right font-semibold" id="modalClientCurrent">0</div>
                            <div class="bg-gray-100 border p-1.5 rounded text-right font-semibold text-gray-600" id="modalClientTotal">0</div>
                        </div>
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-700 mb-1">Amount</label>
                        <input type="number" name="amount" id="depositAmountInput" oninput="calculateDepositTotal()" required placeholder="Amount" class="w-full border p-1.5 rounded bg-white focus:outline-none">
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-700 mb-1">Transaction Password</label>
                        <input type="password" name="txnPassword" required placeholder="Transaction Password" class="w-full border p-1.5 rounded bg-white focus:outline-none">
                    </div>
                    <div class="flex justify-between items-center pt-2">
                        <button type="button" onclick="closeDepositModal()" class="bg-[#2b3a4a] text-white px-4 py-1.5 rounded font-bold cursor-pointer">BACK</button>
                        <button type="submit" class="bg-[#2b3a4a] text-white px-5 py-1.5 rounded font-bold cursor-pointer">submit →</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- WITHDRAW MODAL -->
        <div id="withdrawModal" class="fixed inset-0 bg-black/45 hidden items-start justify-center pt-12 z-50">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300 p-4">
                <div class="flex justify-between items-center border-b pb-2 mb-3">
                    <span class="font-bold text-sm">Withdraw</span>
                    <button type="button" onclick="closeWithdrawModal()" class="cursor-pointer text-xs font-bold bg-[#343a40] text-white px-2 py-0.5 rounded">✕</button>
                </div>
                <form action="/api/withdraw" method="POST" class="space-y-3 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="withdrawClientUsername">
                    <div class="grid grid-cols-2 gap-2">
                        <div class="bg-gray-100 border p-1.5 rounded font-semibold text-gray-700">${loggedInUser}</div>
                        <div class="grid grid-cols-2 gap-1">
                            <div class="bg-gray-100 border p-1.5 rounded text-right font-semibold" id="withdrawAdminCurrent">${Number(currentUserPoints || 0).toLocaleString()}</div>
                            <div class="bg-gray-100 border p-1.5 rounded text-right font-semibold text-gray-600" id="withdrawAdminTotal">${Number(currentUserPoints || 0).toLocaleString()}</div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div class="bg-gray-100 border p-1.5 rounded font-semibold text-gray-700" id="withdrawClientDisplay">Client</div>
                        <div class="grid grid-cols-2 gap-1">
                            <div class="bg-gray-100 border p-1.5 rounded text-right font-semibold" id="withdrawClientCurrent">0</div>
                            <div class="bg-gray-100 border p-1.5 rounded text-right font-semibold text-gray-600" id="withdrawClientTotal">0</div>
                        </div>
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-700 mb-1">Amount</label>
                        <input type="number" name="amount" id="withdrawAmountInput" oninput="calculateWithdrawTotal()" required placeholder="Amount" class="w-full border p-1.5 rounded bg-white focus:outline-none">
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-700 mb-1">Transaction Password</label>
                        <input type="password" name="txnPassword" required placeholder="Transaction Password" class="w-full border p-1.5 rounded bg-white focus:outline-none">
                    </div>
                    <div class="flex justify-between items-center pt-2">
                        <button type="button" onclick="closeWithdrawModal()" class="bg-[#2b3a4a] text-white px-4 py-1.5 rounded font-bold cursor-pointer">BACK</button>
                        <button type="submit" class="bg-[#2b3a4a] text-white px-5 py-1.5 rounded font-bold cursor-pointer">submit →</button>
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
                        <div class="col-span-2 bg-gray-200 border p-1.5 rounded text-gray-600 font-semibold" id="exposureOldLimitDisplay">0.00</div>
                    </div>
                    <div class="grid grid-cols-3 items-center gap-2">
                        <label class="font-semibold text-gray-700">New Limit</label>
                        <input type="number" step="any" name="newLimit" required placeholder="New Limit" class="col-span-2 border p-1.5 rounded bg-white focus:outline-none">
                    </div>
                    <div class="grid grid-cols-3 items-center gap-2">
                        <label class="font-semibold text-gray-700">Transaction Password</label>
                        <input type="password" name="txnPassword" required placeholder="Transaction Password" class="col-span-2 border p-1.5 rounded bg-white focus:outline-none">
                    </div>
                    <div class="flex justify-end items-center space-x-2 pt-3 border-t mt-2">
                        <button type="button" onclick="closeExposureModal()" class="bg-[#2b3a4a] text-white px-3 py-1.5 rounded font-bold cursor-pointer">BACK</button>
                        <button type="submit" class="bg-[#0077b6] text-white px-4 py-1.5 rounded font-bold cursor-pointer">submit →</button>
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
                        <div class="col-span-2 bg-gray-200 border p-1.5 rounded text-gray-600 font-semibold" id="creditOldDisplay">0.00</div>
                    </div>
                    <div class="grid grid-cols-3 items-center gap-2">
                        <label class="font-semibold text-gray-700">New Credit</label>
                        <input type="number" step="any" name="newCredit" required placeholder="New Credit" class="col-span-2 border p-1.5 rounded bg-white focus:outline-none">
                    </div>
                    <div class="grid grid-cols-3 items-center gap-2">
                        <label class="font-semibold text-gray-700">Transaction Password</label>
                        <input type="password" name="txnPassword" required placeholder="Transaction Password" class="col-span-2 border p-1.5 rounded bg-white focus:outline-none">
                    </div>
                    <div class="flex justify-end items-center space-x-2 pt-3 border-t mt-2">
                        <button type="button" onclick="closeCreditModal()" class="bg-[#2b3a4a] text-white px-3 py-1.5 rounded font-bold cursor-pointer">BACK</button>
                        <button type="submit" class="bg-[#0077b6] text-white px-4 py-1.5 rounded font-bold cursor-pointer">submit →</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- PASSWORD CHANGE MODAL ('P' BUTTON) -->
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
                        <input type="password" name="newPassword" required placeholder="New Password" class="col-span-2 border p-1.5 rounded bg-white focus:outline-none">
                    </div>
                    <div class="grid grid-cols-3 items-center gap-2">
                        <label class="font-semibold text-gray-700">Confirm Password</label>
                        <input type="password" name="confirmPassword" required placeholder="Confirm Password" class="col-span-2 border p-1.5 rounded bg-white focus:outline-none">
                    </div>
                    <div class="grid grid-cols-3 items-center gap-2">
                        <label class="font-semibold text-gray-700">Transaction Password</label>
                        <input type="password" name="txnPassword" required placeholder="Transaction Password" class="col-span-2 border p-1.5 rounded bg-white focus:outline-none">
                    </div>
                    <div class="flex justify-end items-center space-x-2 pt-3 border-t mt-2">
                        <button type="button" onclick="closePasswordModal()" class="bg-[#2b3a4a] text-white px-3 py-1.5 rounded font-bold cursor-pointer">BACK</button>
                        <button type="submit" class="bg-[#0077b6] text-white px-4 py-1.5 rounded font-bold cursor-pointer">submit →</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- CHANGE STATUS MODAL ('S' BUTTON) -->
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
                        <input type="password" name="txnPassword" required placeholder="Transaction Password" class="w-full border p-1.5 rounded bg-white focus:outline-none">
                    </div>
                    <div class="flex justify-end items-center space-x-2 pt-3 border-t mt-2">
                        <button type="button" onclick="closeStatusModal()" class="bg-[#2b3a4a] text-white px-3 py-1.5 rounded font-bold cursor-pointer">BACK</button>
                        <button type="submit" class="bg-[#0077b6] text-white px-4 py-1.5 rounded font-bold cursor-pointer">submit →</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function getModalScriptsJS() {
    return `
        <script>
            let baseClientPoints = 0;
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
                document.getElementById('modalClientTotal').innerText = (baseClientPoints + amtVal).toLocaleString();
            }
            function closeDepositModal() { document.getElementById('depositModal')?.classList.replace('flex', 'hidden'); }

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
                document.getElementById('withdrawClientTotal').innerText = (baseClientPoints - amtVal).toLocaleString();
            }
            function closeWithdrawModal() { document.getElementById('withdrawModal')?.classList.replace('flex', 'hidden'); }

            function openExposureModal(clientName, exposureLimit) {
                document.getElementById('exposureClientUsername').value = clientName;
                document.getElementById('exposureOldLimitDisplay').innerText = Number(exposureLimit || 0).toLocaleString();
                const modal = document.getElementById('exposureModal');
                if(modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
            }
            function closeExposureModal() { document.getElementById('exposureModal')?.classList.replace('flex', 'hidden'); }

            function openCreditModal(clientName, creditRef) {
                document.getElementById('creditClientUsername').value = clientName;
                document.getElementById('creditOldDisplay').innerText = Number(creditRef || 0).toLocaleString();
                const modal = document.getElementById('creditModal');
                if(modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
            }
            function closeCreditModal() { document.getElementById('creditModal')?.classList.replace('flex', 'hidden'); }

            function openPasswordModal(clientName) {
                document.getElementById('passwordClientUsername').value = clientName;
                const modal = document.getElementById('passwordModal');
                if(modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
            }
            function closePasswordModal() { document.getElementById('passwordModal')?.classList.replace('flex', 'hidden'); }

            function openStatusModal(clientName, userActive, betActive) {
                document.getElementById('statusClientUsername').value = clientName;
                document.getElementById('statusClientTitleDisplay').innerText = clientName;
                document.getElementById('statusUserActiveCheckbox').checked = (userActive !== 'false' && userActive !== false);
                document.getElementById('statusBetActiveCheckbox').checked = (betActive !== 'false' && betActive !== false);
                const modal = document.getElementById('statusModal');
                if(modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
            }
            function closeStatusModal() { document.getElementById('statusModal')?.classList.replace('flex', 'hidden'); }
        </script>
    `;
}

module.exports = { getHeaderAndSidebar, getModalsHTML, getModalScriptsJS };
