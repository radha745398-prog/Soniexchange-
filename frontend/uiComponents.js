
// TOP HEADER BAR & SIDEBAR FUNCTION
function getHeaderAndSidebar(loggedInUser, userRole) {
    return `
        <!-- TOP NAVBAR -->
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

                <!-- HEADER SEARCH BOX WITH REALTIME DROPDOWN -->
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

        <!-- 39 SPORTS SIDEBAR MENU -->
        <aside id="sportsSidebar" class="w-64 bg-white text-gray-800 flex flex-col fixed inset-y-0 left-0 transform -translate-x-full transition-transform duration-300 ease-in-out shadow-2xl border-r" style="z-index: 999999;">
            <div class="p-3 bg-[#0077b6] text-white flex justify-between items-center">
                <span class="font-bold text-sm">Sports</span>
                <button type="button" id="sidebarCloseBtn" class="text-white hover:text-gray-200 cursor-pointer"><i class="fa-solid fa-xmark text-base pointer-events-none"></i></button>
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
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Futsal</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Horse Racing</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>E Games</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Basketball</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>MotoGP</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Chess</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Volleyball</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Ice Hockey</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Badminton</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Cycling</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Motorbikes</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Athletics</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Basketball 3X3</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Sumo</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Virtual sports</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Handball</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Politics</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Motor Sports</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Baseball</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Rugby Union</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Rugby League</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Darts</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>American Football</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Snooker</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Soccer</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Esports</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Greyhound Racing</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Kabaddi</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Boat Racing</span> <span>+</span></div>
                <div class="flex justify-between items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer border-b"><span>Esoccer</span> <span>+</span></div>
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

                function openSidebar(e) {
                    if (e) e.stopPropagation();
                    if (sidebar) sidebar.classList.remove('-translate-x-full');
                    if (overlay) overlay.classList.remove('hidden');
                }

                function closeSidebar(e) {
                    if (e) e.stopPropagation();
                    if (sidebar) sidebar.classList.add('-translate-x-full');
                    if (overlay) overlay.classList.add('hidden');
                }

                if (toggleBtn) toggleBtn.onclick = openSidebar;
                if (closeBtn) closeBtn.onclick = closeSidebar;
                if (overlay) overlay.onclick = closeSidebar;

                const userBtn = document.getElementById('userMenuBtn');
                const userContent = document.getElementById('userMenuContent');

                if (userBtn && userContent) {
                    userBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        userContent.classList.toggle('hidden');
                    });

                    document.addEventListener('click', function(e) {
                        if (!userContent.contains(e.target) && !userBtn.contains(e.target)) {
                            userContent.classList.add('hidden');
                        }
                    });
                }
            });

            let searchTimeout = null;
            function handleSearchInput(val) {
                clearTimeout(searchTimeout);
                const dropdown = document.getElementById('searchResultsDropdown');
                if (!val || val.trim().length === 0) {
                    dropdown.classList.add('hidden');
                    dropdown.innerHTML = '';
                    return;
                }

                searchTimeout = setTimeout(async () => {
                    try {
                        const res = await fetch('/api/search-users?q=' + encodeURIComponent(val) + '&loggedInUser=${encodeURIComponent(loggedInUser)}');
                        const data = await res.json();
                        
                        if (data && data.length > 0) {
                            dropdown.innerHTML = data.map(u => \`
                                <div onclick="openMarketAnalysisModal('\${u.username}')" class="px-2.5 py-1.5 hover:bg-[#3b5cb8] cursor-pointer font-semibold border-b border-white/10 last:border-b-0">
                                    \${u.username}
                                </div>
                            \`).join('');
                            dropdown.classList.remove('hidden');
                        } else {
                            dropdown.innerHTML = '<div class="px-2 py-1.5 text-white/80 text-[10px]">No user found</div>';
                            dropdown.classList.remove('hidden');
                        }
                    } catch (err) {
                        console.error('Search error:', err);
                    }
                }, 200);
            }

            document.addEventListener('click', function(e) {
                const searchInput = document.getElementById('headerSearchInput');
                const dropdown = document.getElementById('searchResultsDropdown');
                if (searchInput && dropdown && !searchInput.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.add('hidden');
                }
            });
        </script>
    `;
}

function getModalsHTML(loggedInUser) {
    return `
        <!-- MARKET ANALYSIS MODAL -->
        <div id="marketAnalysisModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-12 z-50" onclick="handleOverlayClick(event, 'marketAnalysisModal')">
            <div class="bg-white rounded-xs shadow-2xl w-full max-w-2xl mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-[#2b3e50] px-3 py-2 flex justify-between items-center text-white">
                    <span class="font-bold text-xs">Market Analysis</span>
                    <button type="button" onclick="closeMarketAnalysisModal()" class="w-5 h-5 bg-[#00a8e8] text-white flex items-center justify-center text-xs hover:bg-[#008bc2] transition cursor-pointer">✕</button>
                </div>
                
                <div class="p-3 bg-gray-100 grid grid-cols-1 md:grid-cols-12 gap-3 text-[11px]">
                    <div class="md:col-span-4 bg-white border border-gray-300 p-2 space-y-1 shadow-xs">
                        <div class="font-bold border-b border-gray-300 pb-1 text-gray-800 text-[11px]">Game Detail</div>
                        <div class="flex justify-between"><span class="text-gray-600">Username</span><span class="font-semibold text-gray-800" id="maUsername">-</span></div>
                        <div class="flex justify-between"><span class="text-gray-600">Account Type</span><span class="font-semibold text-gray-800" id="maRole">-</span></div>
                        <div class="flex justify-between"><span class="text-gray-600">General</span><span class="font-semibold text-gray-800" id="maGeneral">0.00</span></div>
                        <div class="flex justify-between"><span class="text-gray-600">Exposure</span><span class="font-semibold text-gray-800" id="maExposure">0.00</span></div>
                        <div class="flex justify-between"><span class="text-gray-600">Credit Reference</span><span class="font-semibold text-gray-800" id="maCreditRef">0.00</span></div>
                    </div>

                    <div class="md:col-span-4 bg-white border border-gray-300 shadow-xs">
                        <div class="font-bold p-1.5 border-b border-gray-300 text-gray-800 text-[11px]">User Lock</div>
                        <table class="w-full text-left text-[10px]">
                            <thead>
                                <tr class="bg-[#2b3e50] text-white font-bold">
                                    <th class="p-1 border-r">Master Name</th>
                                    <th class="p-1 text-center border-r">User Act</th>
                                    <th class="p-1 text-center">Bet Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="border-b">
                                    <td class="p-1 font-semibold text-gray-800" id="maMasterName">-</td>
                                    <td class="p-1 text-center"><input type="checkbox" id="maUserAct" disabled class="accent-[#2b3e50]"></td>
                                    <td class="p-1 text-center"><input type="checkbox" id="maBetAct" disabled class="accent-[#2b3e50]"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="md:col-span-4 bg-white border border-gray-300 shadow-xs">
                        <div class="font-bold p-1.5 border-b border-gray-300 text-gray-800 text-[11px]">Game Lock</div>
                        <table class="w-full text-left text-[10px]">
                            <thead>
                                <tr class="bg-[#2b3e50] text-white font-bold">
                                    <th class="p-1 border-r">S.No.</th>
                                    <th class="p-1 border-r">Master Name</th>
                                    <th class="p-1 border-r text-center">Bet Lock</th>
                                    <th class="p-1">Event Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="border-b bg-gray-50">
                                    <td colspan="4" class="p-2 text-center text-gray-500 font-semibold">No records found</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- DEPOSIT POPUP MODAL -->
        <div id="depositModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'depositModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-200">
                    <span class="font-bold text-gray-800 text-sm">Deposit</span>
                    <button type="button" onclick="closeDepositModal()" class="w-6 h-6 rounded-full bg-[#00a8e8] text-white flex items-center justify-center text-xs hover:bg-[#008bc2] transition cursor-pointer">✕</button>
                </div>
                <form action="/api/deposit" method="POST" class="p-5 space-y-3.5 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalClientUsername">
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <span id="modalUplineLabel" class="col-span-4 font-normal text-gray-700 text-[11px]">Upline</span>
                        <div class="col-span-4"><input type="text" id="modalLoggedInCredit" value="0" readonly class="w-full border border-gray-300 bg-gray-200 p-1.5 rounded-xs text-right text-gray-700 focus:outline-none"></div>
                        <div class="col-span-4"><input type="text" id="modalLoggedInPoints" readonly class="w-full border border-gray-300 bg-gray-200 p-1.5 rounded-xs text-right text-gray-700 focus:outline-none" value="0"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <span id="modalClientLabel" class="col-span-4 font-normal text-gray-700 text-[11px]">Client</span>
                        <div class="col-span-4"><input type="text" id="modalClientCredit" value="0" readonly class="w-full border border-gray-300 bg-gray-200 p-1.5 rounded-xs text-right text-gray-700 focus:outline-none"></div>
                        <div class="col-span-4"><input type="text" id="modalClientPoints" readonly class="w-full border border-gray-300 bg-gray-200 p-1.5 rounded-xs text-right text-gray-700 focus:outline-none" value="0"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Amount</label>
                        <div class="col-span-8"><input type="number" name="amount" required placeholder="Amount" class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none text-right"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Remark</label>
                        <div class="col-span-8"><input type="text" name="remark" placeholder="Remark" class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Transaction Password</label>
                        <div class="col-span-8"><input type="password" name="txnPassword" required placeholder="Transaction Password" class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none"></div>
                    </div>
                    <div class="flex justify-end space-x-2 pt-3">
                        <button type="button" onclick="closeDepositModal()" class="bg-[#2d3e50] hover:bg-[#1a2530] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <i class="fa-solid fa-rotate-left"></i> <span>BACK</span>
                        </button>
                        <button type="submit" class="bg-[#0099db] hover:bg-[#007cb3] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <span>submit</span> <i class="fa-solid fa-right-to-bracket"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- WITHDRAW POPUP MODAL -->
        <div id="withdrawModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'withdrawModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-200">
                    <span class="font-bold text-gray-800 text-sm">Withdraw</span>
                    <button type="button" onclick="closeWithdrawModal()" class="w-6 h-6 rounded-full bg-[#00a8e8] text-white flex items-center justify-center text-xs hover:bg-[#008bc2] transition cursor-pointer">✕</button>
                </div>
                <form action="/api/withdraw" method="POST" class="p-5 space-y-3.5 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalWithdrawClientUsername">
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <span id="modalWithdrawUplineLabel" class="col-span-4 font-normal text-gray-700 text-[11px]">Upline</span>
                        <div class="col-span-4"><input type="text" id="modalWithdrawLoggedInCredit" value="0" readonly class="w-full border border-gray-300 bg-gray-200 p-1.5 rounded-xs text-right text-gray-700 focus:outline-none"></div>
                        <div class="col-span-4"><input type="text" id="modalWithdrawLoggedInPoints" readonly class="w-full border border-gray-300 bg-gray-200 p-1.5 rounded-xs text-right text-gray-700 focus:outline-none" value="0"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <span id="modalWithdrawClientLabel" class="col-span-4 font-normal text-gray-700 text-[11px]">Client</span>
                        <div class="col-span-4"><input type="text" id="modalWithdrawClientCredit" value="0" readonly class="w-full border border-gray-300 bg-gray-200 p-1.5 rounded-xs text-right text-gray-700 focus:outline-none"></div>
                        <div class="col-span-4"><input type="text" id="modalWithdrawClientPoints" readonly class="w-full border border-gray-300 bg-gray-200 p-1.5 rounded-xs text-right text-gray-700 focus:outline-none" value="0"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Amount</label>
                        <div class="col-span-8"><input type="number" name="amount" required placeholder="Amount" class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none text-right"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Remark</label>
                        <div class="col-span-8"><input type="text" name="remark" placeholder="Remark" class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Transaction Password</label>
                        <div class="col-span-8"><input type="password" name="txnPassword" required placeholder="Transaction Password" class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none"></div>
                    </div>
                    <div class="flex justify-end space-x-2 pt-3">
                        <button type="button" onclick="closeWithdrawModal()" class="bg-[#2d3e50] hover:bg-[#1a2530] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <i class="fa-solid fa-rotate-left"></i> <span>BACK</span>
                        </button>
                        <button type="submit" class="bg-[#0099db] hover:bg-[#007cb3] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <span>submit</span> <i class="fa-solid fa-right-to-bracket"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- EXPOSURE LIMIT POPUP MODAL -->
        <div id="exposureModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'exposureModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-200">
                    <span class="font-bold text-gray-800 text-sm">Exposure Limit</span>
                    <button type="button" onclick="closeExposureModal()" class="w-6 h-6 rounded-full bg-[#00a8e8] text-white flex items-center justify-center text-xs hover:bg-[#008bc2] transition cursor-pointer">✕</button>
                </div>
                <form action="/api/exposure-limit" method="POST" class="p-5 space-y-3.5 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalExposureClientUsername">
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Old Limit</label>
                        <div class="col-span-8"><input type="text" id="modalOldExposureLimit" readonly class="w-full border border-gray-300 bg-gray-200 p-1.5 rounded-xs text-right text-gray-700 focus:outline-none" value="0.00"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">New Limit</label>
                        <div class="col-span-8"><input type="number" name="newLimit" required class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none text-right"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Transaction Password</label>
                        <div class="col-span-8"><input type="password" name="txnPassword" required class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none"></div>
                    </div>
                    <div class="flex justify-end space-x-2 pt-3">
                        <button type="button" onclick="closeExposureModal()" class="bg-[#2d3e50] hover:bg-[#1a2530] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <i class="fa-solid fa-rotate-left"></i> <span>BACK</span>
                        </button>
                        <button type="submit" class="bg-[#0099db] hover:bg-[#007cb3] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <span>submit</span> <i class="fa-solid fa-right-to-bracket"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- CREDIT POPUP MODAL -->
        <div id="creditModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'creditModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-200">
                    <span class="font-bold text-gray-800 text-sm">Credit</span>
                    <button type="button" onclick="closeCreditModal()" class="w-6 h-6 rounded-full bg-[#00a8e8] text-white flex items-center justify-center text-xs hover:bg-[#008bc2] transition cursor-pointer">✕</button>
                </div>
                <form action="/api/credit-update" method="POST" class="p-5 space-y-3.5 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalCreditClientUsername">
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Old Credit</label>
                        <div class="col-span-8"><input type="text" id="modalOldCredit" readonly class="w-full border border-gray-300 bg-gray-200 p-1.5 rounded-xs text-right text-gray-700 focus:outline-none" value="0.00"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">New Credit</label>
                        <div class="col-span-8"><input type="number" name="newCredit" required class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none text-right"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Transaction Password</label>
                        <div class="col-span-8"><input type="password" name="txnPassword" required class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none"></div>
                    </div>
                    <div class="flex justify-end space-x-2 pt-3">
                        <button type="button" onclick="closeCreditModal()" class="bg-[#2d3e50] hover:bg-[#1a2530] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <i class="fa-solid fa-rotate-left"></i> <span>BACK</span>
                        </button>
                        <button type="submit" class="bg-[#0099db] hover:bg-[#007cb3] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <span>submit</span> <i class="fa-solid fa-right-to-bracket"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- PASSWORD POPUP MODAL -->
        <div id="passwordModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'passwordModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-200">
                    <span class="font-bold text-gray-800 text-sm">Password</span>
                    <button type="button" onclick="closePasswordModal()" class="w-6 h-6 rounded-full bg-[#00a8e8] text-white flex items-center justify-center text-xs hover:bg-[#008bc2] transition cursor-pointer">✕</button>
                </div>
                <form action="/api/client-password-update" method="POST" class="p-5 space-y-3.5 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalPasswordClientUsername">
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">New Password</label>
                        <div class="col-span-8"><input type="password" name="newPassword" required class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Confirm Password</label>
                        <div class="col-span-8"><input type="password" name="confirmPassword" required class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none"></div>
                    </div>
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Transaction Password</label>
                        <div class="col-span-8"><input type="password" name="txnPassword" required class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none"></div>
                    </div>
                    <div class="flex justify-end space-x-2 pt-3">
                        <button type="button" onclick="closePasswordModal()" class="bg-[#2d3e50] hover:bg-[#1a2530] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <i class="fa-solid fa-rotate-left"></i> <span>BACK</span>
                        </button>
                        <button type="submit" class="bg-[#0099db] hover:bg-[#007cb3] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <span>submit</span> <i class="fa-solid fa-right-to-bracket"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- CHANGE STATUS POPUP MODAL (S BUTTON) -->
        <div id="statusModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'statusModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-lg mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-200">
                    <span class="font-bold text-gray-800 text-sm">Change Status</span>
                    <button type="button" onclick="closeStatusModal()" class="w-6 h-6 rounded-full bg-[#00a8e8] text-white flex items-center justify-center text-xs hover:bg-[#008bc2] transition cursor-pointer">✕</button>
                </div>
                <form action="/api/change-status" method="POST" class="p-5 space-y-4 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <input type="hidden" name="clientUsername" id="modalStatusClientUsername">
                    
                    <div class="text-[#e67e22] font-semibold text-xs mb-2" id="modalStatusDisplayClient">ClientName</div>

                    <div class="grid grid-cols-2 gap-4 my-2 text-center">
                        <div>
                            <label class="block text-gray-700 font-semibold mb-1 text-[11px]">User Active</label>
                            <button type="button" id="btnUserActive" onclick="toggleUserStatus()" class="w-16 h-7 bg-[#0088cc] text-white rounded-full font-bold text-[10px] relative transition-colors cursor-pointer shadow-inner">
                                <span id="textUserActive" class="absolute left-2.5 top-1">ON</span>
                                <div id="dotUserActive" class="w-5 h-5 bg-[#1b2a38] rounded-full absolute top-1 right-1 transition-all"></div>
                            </button>
                            <input type="hidden" name="userActive" id="inputUserActive" value="true">
                        </div>
                        <div>
                            <label class="block text-gray-700 font-semibold mb-1 text-[11px]">Bet Active</label>
                            <button type="button" id="btnBetActive" onclick="toggleBetStatus()" class="w-16 h-7 bg-[#0088cc] text-white rounded-full font-bold text-[10px] relative transition-colors cursor-pointer shadow-inner">
                                <span id="textBetActive" class="absolute left-2.5 top-1">ON</span>
                                <div id="dotBetActive" class="w-5 h-5 bg-[#1b2a38] rounded-full absolute top-1 right-1 transition-all"></div>
                            </button>
                            <input type="hidden" name="betActive" id="inputBetActive" value="true">
                        </div>
                    </div>

                    <div class="grid grid-cols-12 gap-2 items-center">
                        <label class="col-span-4 font-normal text-gray-700 text-[11px]">Transaction Password</label>
                        <div class="col-span-8"><input type="password" name="txnPassword" required class="w-full border border-gray-300 p-1.5 rounded-xs bg-white focus:outline-none"></div>
                    </div>

                    <div class="flex justify-end space-x-2 pt-3">
                        <button type="button" onclick="closeStatusModal()" class="bg-[#2d3e50] hover:bg-[#1a2530] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <i class="fa-solid fa-rotate-left"></i> <span>BACK</span>
                        </button>
                        <button type="submit" class="bg-[#0099db] hover:bg-[#007cb3] text-white px-3.5 py-1.5 rounded-xs font-bold flex items-center space-x-1 cursor-pointer text-[11px]">
                            <span>submit</span> <i class="fa-solid fa-right-to-bracket"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- ADMIN BALANCE UPDATE POPUP MODAL (ONLY FOR SONIEXCHANGE) -->
        ${loggedInUser === 'Soniexchange' ? `
        <div id="adminBalanceModal" class="fixed inset-0 modal-bg-overlay hidden items-start justify-center pt-16 z-50" onclick="handleOverlayClick(event, 'adminBalanceModal')">
            <div class="bg-white rounded-md shadow-2xl w-full max-w-sm mx-3 overflow-hidden text-gray-800 border border-gray-300">
                <div class="bg-[#0077b6] px-4 py-2.5 flex justify-between items-center text-white">
                    <span class="font-bold text-xs">Update My Admin Balance</span>
                    <button type="button" onclick="closeAdminBalanceModal()" class="w-5 h-5 rounded-full bg-[#00a8e8] text-white flex items-center justify-center text-xs hover:bg-[#008bc2] transition cursor-pointer">✕</button>
                </div>
                <form action="/api/admin/update-balance" method="POST" class="p-4 space-y-3 text-xs">
                    <input type="hidden" name="loggedInUser" value="${loggedInUser}">
                    <div>
                        <label class="block font-semibold text-gray-700 mb-1 text-[11px]">New Balance Amount</label>
                        <input type="number" name="newBalance" required placeholder="e.g. 200000" class="w-full border border-gray-300 p-1.5 rounded-xs text-xs focus:outline-none">
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-700 mb-1 text-[11px]">Transaction Password</label>
                        <input type="password" name="txnPassword" required placeholder="Transaction Password" class="w-full border border-gray-300 p-1.5 rounded-xs text-xs focus:outline-none">
                    </div>
                    <div class="flex justify-end space-x-2 pt-2">
                        <button type="button" onclick="closeAdminBalanceModal()" class="bg-[#2d3e50] hover:bg-[#1a2530] text-white px-3 py-1 rounded-xs font-bold text-[11px] cursor-pointer">Cancel</button>
                        <button type="submit" class="bg-[#0099db] hover:bg-[#007cb3] text-white px-3 py-1 rounded-xs font-bold text-[11px] cursor-pointer">Update Now</button>
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
            function handleOverlayClick(event, modalId) {
                if (event.target.id === modalId) {
                    if (modalId === 'depositModal') closeDepositModal();
                    if (modalId === 'withdrawModal') closeWithdrawModal();
                    if (modalId === 'exposureModal') closeExposureModal();
                    if (modalId === 'creditModal') closeCreditModal();
                    if (modalId === 'passwordModal') closePasswordModal();
                    if (modalId === 'statusModal') closeStatusModal();
                    if (modalId === 'marketAnalysisModal') closeMarketAnalysisModal();
                    if (modalId === 'adminBalanceModal') closeAdminBalanceModal();
                }
            }

            function openAdminBalanceModal() {
                const modal = document.getElementById('adminBalanceModal');
                if (modal) {
                    modal.classList.remove('hidden');
                    modal.classList.add('flex');
                }
            }

            function closeAdminBalanceModal() {
                const modal = document.getElementById('adminBalanceModal');
                if (modal) {
                    modal.classList.remove('flex');
                    modal.classList.add('hidden');
                }
            }

            async function openMarketAnalysisModal(username) {
                const dropdown = document.getElementById('searchResultsDropdown');
                if(dropdown) dropdown.classList.add('hidden');

                try {
                    const res = await fetch('/api/user-detail?username=' + encodeURIComponent(username));
                    const data = await res.json();
                    
                    if (data && data.success) {
                        const u = data.user;
                        document.getElementById('maUsername').textContent = u.username || '-';
                        document.getElementById('maRole').textContent = u.role || 'User';
                        document.getElementById('maGeneral').textContent = Number(u.points || 0).toFixed(2);
                        document.getElementById('maExposure').textContent = Number(u.exposure || 0).toFixed(2);
                        document.getElementById('maCreditRef').textContent = Number(u.creditRef || 0).toFixed(2);
                        document.getElementById('maMasterName').textContent = u.createdBy || 'Soniexchange';
                        document.getElementById('maUserAct').checked = u.userActive !== false;
                        document.getElementById('maBetAct').checked = u.betActive !== false;

                        const modal = document.getElementById('marketAnalysisModal');
                        modal.classList.remove('hidden');
                        modal.classList.add('flex');
                    }
                } catch(err) {
                    console.error('Error fetching market analysis detail:', err);
                }
            }

            function closeMarketAnalysisModal() {
                const modal = document.getElementById('marketAnalysisModal');
                modal.classList.remove('flex');
                modal.classList.add('hidden');
            }

            function openDepositModal(clientName, clientPts, uplinePts, loggedInUser) {
                document.getElementById('modalClientUsername').value = clientName;
                document.getElementById('modalUplineLabel').textContent = loggedInUser || 'Upline';
                document.getElementById('modalClientLabel').textContent = clientName;
                document.getElementById('modalLoggedInCredit').value = '0';
                document.getElementById('modalLoggedInPoints').value = uplinePts.toLocaleString();
                document.getElementById('modalClientCredit').value = '0';
                document.getElementById('modalClientPoints').value = clientPts.toLocaleString();
                
                const modal = document.getElementById('depositModal');
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
            function closeDepositModal() {
                const modal = document.getElementById('depositModal');
                modal.classList.remove('flex');
                modal.classList.add('hidden');
            }

            function openWithdrawModal(clientName, clientPts, uplinePts, loggedInUser) {
                document.getElementById('modalWithdrawClientUsername').value = clientName;
                document.getElementById('modalWithdrawUplineLabel').textContent = loggedInUser || 'Upline';
                document.getElementById('modalWithdrawClientLabel').textContent = clientName;
                document.getElementById('modalWithdrawLoggedInCredit').value = '0';
                document.getElementById('modalWithdrawLoggedInPoints').value = uplinePts.toLocaleString();
                document.getElementById('modalWithdrawClientCredit').value = '0';
                document.getElementById('modalWithdrawClientPoints').value = clientPts.toLocaleString();
                
                const modal = document.getElementById('withdrawModal');
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
            function closeWithdrawModal() {
                const modal = document.getElementById('withdrawModal');
                modal.classList.remove('flex');
                modal.classList.add('hidden');
            }

            function openExposureModal(clientName, oldLimit) {
                document.getElementById('modalExposureClientUsername').value = clientName;
                document.getElementById('modalOldExposureLimit').value = Number(oldLimit || 0).toFixed(2);
                
                const modal = document.getElementById('exposureModal');
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
            function closeExposureModal() {
                const modal = document.getElementById('exposureModal');
                modal.classList.remove('flex');
                modal.classList.add('hidden');
            }

            function openCreditModal(clientName, oldCredit) {
                document.getElementById('modalCreditClientUsername').value = clientName;
                document.getElementById('modalOldCredit').value = Number(oldCredit || 0).toFixed(2);
                
                const modal = document.getElementById('creditModal');
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
            function closeCreditModal() {
                const modal = document.getElementById('creditModal');
                modal.classList.remove('flex');
                modal.classList.add('hidden');
            }

            function openPasswordModal(clientName) {
                document.getElementById('modalPasswordClientUsername').value = clientName;
                const modal = document.getElementById('passwordModal');
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
            function closePasswordModal() {
                const modal = document.getElementById('passwordModal');
                modal.classList.remove('flex');
                modal.classList.add('hidden');
            }

            function openStatusModal(clientName, userActive, betActive) {
                document.getElementById('modalStatusClientUsername').value = clientName;
                document.getElementById('modalStatusDisplayClient').textContent = clientName;
                
                setUserActiveState(userActive);
                setBetActiveState(betActive);

                const modal = document.getElementById('statusModal');
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
            function closeStatusModal() {
                const modal = document.getElementById('statusModal');
                modal.classList.remove('flex');
                modal.classList.add('hidden');
            }

            let isUserActive = true;
            let isBetActive = true;

            function setUserActiveState(state) {
                isUserActive = state;
                document.getElementById('inputUserActive').value = state ? "true" : "false";
                const btn = document.getElementById('btnUserActive');
                const txt = document.getElementById('textUserActive');
                const dot = document.getElementById('dotUserActive');

                if (state) {
                    btn.className = "w-16 h-7 bg-[#0088cc] text-white rounded-full font-bold text-[10px] relative transition-colors cursor-pointer shadow-inner";
                    txt.textContent = "ON";
                    txt.className = "absolute left-2.5 top-1";
                    dot.style.right = "4px";
                    dot.style.left = "auto";
                } else {
                    btn.className = "w-16 h-7 bg-gray-400 text-white rounded-full font-bold text-[10px] relative transition-colors cursor-pointer shadow-inner";
                    txt.textContent = "OFF";
                    txt.className = "absolute right-2.5 top-1";
                    dot.style.left = "4px";
                    dot.style.right = "auto";
                }
            }

            function setBetActiveState(state) {
                isBetActive = state;
                document.getElementById('inputBetActive').value = state ? "true" : "false";
                const btn = document.getElementById('btnBetActive');
                const txt = document.getElementById('textBetActive');
                const dot = document.getElementById('dotBetActive');

                if (state) {
                    btn.className = "w-16 h-7 bg-[#0088cc] text-white rounded-full font-bold text-[10px] relative transition-colors cursor-pointer shadow-inner";
                    txt.textContent = "ON";
                    txt.className = "absolute left-2.5 top-1";
                    dot.style.right = "4px";
                    dot.style.left = "auto";
                } else {
                    btn.className = "w-16 h-7 bg-gray-400 text-white rounded-full font-bold text-[10px] relative transition-colors cursor-pointer shadow-inner";
                    txt.textContent = "OFF";
                    txt.className = "absolute right-2.5 top-1";
                    dot.style.left = "4px";
                    dot.style.right = "auto";
                }
            }

            function toggleUserStatus() {
                setUserActiveState(!isUserActive);
            }

            function toggleBetStatus() {
                setBetActiveState(!isBetActive);
            }

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

            function filterTableBySearch() {
                const q = (document.getElementById('tableSearchInput')?.value || '').toLowerCase();
                const rows = document.querySelectorAll('#soniAccountTable tbody tr, #accountTable tbody tr');
                rows.forEach(row => {
                    const text = row.innerText.toLowerCase();
                    row.style.display = text.includes(q) ? '' : 'none';
                });
            }

            function resetTableSearch() {
                const input = document.getElementById('tableSearchInput');
                if(input) input.value = '';
                filterTableBySearch();
            }

            window.addEventListener('popstate', function() {
                closeDepositModal();
                closeWithdrawModal();
                closeExposureModal();
                closeCreditModal();
                closePasswordModal();
                closeStatusModal();
                closeMarketAnalysisModal();
                closeAdminBalanceModal();
            });
        </script>
    `;
}

module.exports = { getHeaderAndSidebar, getModalsHTML, getModalScriptsJS };
