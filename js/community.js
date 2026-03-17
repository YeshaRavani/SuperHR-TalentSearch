document.addEventListener('DOMContentLoaded', () => {
            const memberItems = document.querySelectorAll('.member-item');
            const channelItems = document.querySelectorAll('.channel-item');
            const dmList = document.getElementById('dm-list');

            const chatHeader = document.getElementById('chat-header');
            const chatPlaceholder = document.getElementById('chat-placeholder');
            const chatInput = document.getElementById('chat-input');

            function clearActiveSidebar() {
                document.querySelectorAll('#sidebar-content .list-item').forEach(item => {
                    item.classList.remove('active');
                });
            }

            function switchToChannel(channelName) {
                clearActiveSidebar();
                const channelEl = Array.from(document.querySelectorAll('.channel-item')).find(el => el.dataset.name === channelName);
                if (channelEl) channelEl.classList.add('active');

                chatHeader.innerHTML = `<span style="color:var(--sky-500); margin-right:4px;">#</span> ${channelName}`;

                const staticMsgs = document.getElementById('static-messages');
                const placeholder = document.getElementById('chat-placeholder');
                const placeholderSub = document.getElementById('placeholder-sub');

                if (channelName === 'general-chat') {
                    // Show static messages, hide placeholder
                    if (staticMsgs) staticMsgs.style.display = 'block';
                    if (placeholder) placeholder.style.display = 'none';
                } else {
                    // Hide static messages, show placeholder
                    if (staticMsgs) staticMsgs.style.display = 'none';
                    if (placeholder) placeholder.style.display = 'flex';
                    if (placeholderSub) placeholderSub.textContent = `This is the beginning of the #${channelName} history. Messages will appear here.`;
                }

                chatInput.placeholder = `Message #${channelName}...`;
                chatInput.disabled = false;
            }

            function switchToDM(name, avatar) {
                clearActiveSidebar();

                // Check if DM exists in left sidebar
                let dmEl = Array.from(dmList.querySelectorAll('.dm-item')).find(el => el.dataset.name === name);

                if (!dmEl) {
                    dmEl = document.createElement('div');
                    dmEl.className = 'list-item dm-item';
                    dmEl.dataset.name = name;
                    dmEl.dataset.avatar = avatar;
                    dmEl.innerHTML = `<div class="avatar-sm">${avatar}</div> ${name}`;

                    dmEl.addEventListener('click', () => switchToDM(name, avatar));

                    dmList.appendChild(dmEl);
                }

                dmEl.classList.add('active');

                chatHeader.innerHTML = `
                    <div style="display:flex; align-items:center; gap:8px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--sky-500)">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Direct Message — ${name}
                    </div>
                `;

                chatPlaceholder.innerHTML = `
                    <div class="avatar-sm" style="width:64px; height:64px; font-size:1.5rem; margin-bottom:16px;">${avatar}</div>
                    <h3>${name}</h3>
                    <p style="margin-top:8px;">This is the beginning of your direct message history with ${name}.</p>
                `;

                chatInput.placeholder = `Message ${name}...`;
                chatInput.disabled = false;
            }

            // Bind members list
            memberItems.forEach(item => {
                item.addEventListener('click', () => {
                    // Prevent messaging yourself
                    if (item.dataset.name === 'Alice') return;
                    switchToDM(item.dataset.name, item.dataset.avatar);
                });
            });

            // Bind channels list
            channelItems.forEach(item => {
                item.addEventListener('click', () => {
                    switchToChannel(item.dataset.name);
                });
            });

            // Allow static DMs if we want to initialize with one
            const initialDMs = document.querySelectorAll('.dm-item');
            initialDMs.forEach(item => {
                item.addEventListener('click', () => {
                    switchToDM(item.dataset.name, item.dataset.avatar);
                });
            });

            // Handle Sidebar Search
            const userSearchInput = document.getElementById('user-search');
            const searchResultsBox = document.getElementById('search-results');

            userSearchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                searchResultsBox.innerHTML = '';

                if (query.length === 0) {
                    searchResultsBox.style.display = 'none';
                    return;
                }

                let hasResults = false;
                memberItems.forEach(item => {
                    const name = item.dataset.name;
                    const avatar = item.dataset.avatar;

                    if (name === 'Alice') return; // Exclude 'You'

                    if (name.toLowerCase().includes(query)) {
                        hasResults = true;

                        const resultEl = document.createElement('div');
                        resultEl.className = 'list-item';
                        resultEl.innerHTML = `<div class="avatar-sm">${avatar}</div> ${name}`;

                        resultEl.addEventListener('click', () => {
                            switchToDM(name, avatar);
                            userSearchInput.value = '';
                            searchResultsBox.style.display = 'none';
                        });

                        searchResultsBox.appendChild(resultEl);
                    }
                });

                searchResultsBox.style.display = hasResults ? 'block' : 'none';
            });

            // Close search results on outside click
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.sidebar-search')) {
                    searchResultsBox.style.display = 'none';
                }
            });

            // Notification Dropdown Logic
            const notifToggle = document.getElementById('notifToggle');
            const notifDropdown = document.getElementById('notifDropdown');
            if (notifToggle && notifDropdown) {
                notifToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    notifDropdown.classList.toggle('active');
                });
                document.addEventListener('click', () => {
                    notifDropdown.classList.remove('active');
                });
                notifDropdown.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }

            // Microphone Button Logic (UI Simulation)
            const micBtn = document.getElementById('mic-btn');
            const micIndicator = document.getElementById('mic-indicator');
            const chatInputForMic = document.getElementById('chat-input');
            let isRecording = false;
            let actualPlaceholder = "";

            if (micBtn) {
                micBtn.addEventListener('click', () => {
                    isRecording = !isRecording;
                    if (isRecording) {
                        micIndicator.style.display = 'block';
                        micBtn.style.color = '#ff4757';
                        micBtn.style.borderColor = '#ff4757';
                        actualPlaceholder = chatInputForMic.placeholder;
                        chatInputForMic.placeholder = "Recording...";
                        chatInputForMic.disabled = true;
                    } else {
                        micIndicator.style.display = 'none';
                        micBtn.style.color = 'var(--ink-700)';
                        micBtn.style.borderColor = 'rgba(15, 31, 43, 0.08)';
                        chatInputForMic.placeholder = actualPlaceholder;
                        chatInputForMic.disabled = false;

                        // Small mock confirmation of audio snippet
                        chatInputForMic.value = "🎤 [Voice Message snippet]";
                    }
                });
            }
        });