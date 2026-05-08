document.addEventListener('DOMContentLoaded', async () => {
    const dmList = document.getElementById('dm-list');
    const channelList = document.getElementById('channel-list');
    const memberList = document.querySelector('.user-list-panel .panel-content');
    const chatHeader = document.getElementById('chat-header');
    const chatInput = document.getElementById('chat-input');
    const msgArea = document.getElementById('chat-messages-area');
    const searchInput = document.getElementById('user-search');
    const searchResults = document.getElementById('search-results');
    const micBtn = document.getElementById('mic-btn');
    const micIndicator = document.getElementById('mic-indicator');
    
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;

    let currentMode = 'channel';
    let currentId = null;
    let currentName = '';
    let channels = [];
    let members = []; // This will now hold active DM members
    let allUsers = []; // New variable for global search
    let currentUser = null;

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function initials(name) {
        const parts = String(name || '?').trim().split(/\s+/).filter(Boolean);
        if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return String(name || '?').charAt(0).toUpperCase();
    }

    function formatTime(value) {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function setActiveItem(id, mode) {
        document.querySelectorAll('.list-item').forEach((item) => {
            item.classList.toggle('active', item.dataset.id === id && item.dataset.mode === mode);
        });
    }

    function renderEmptyMessage(title, body) {
        msgArea.innerHTML = `
            <div class="chat-placeholder" style="display:flex;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 20h9a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3l4 4 4-4z"></path>
                </svg>
                <h3>${escapeHtml(title)}</h3>
                <p style="margin-top:8px;">${escapeHtml(body)}</p>
            </div>
        `;
    }

    function renderMessages(messages) {
        if (!messages.length) {
            renderEmptyMessage('No messages yet', 'Start the conversation.');
            return;
        }

        msgArea.innerHTML = `
            <div id="static-messages">
                ${messages.map((message) => {
                    const sender = message.sender || {};
                    const senderName = sender.full_name || sender.username || message.sender_id || 'Unknown user';
                    const you = currentUser && message.sender_id === currentUser.id;
                    return `
                        <div class="msg-row">
                            <div class="avatar-sm" style="flex-shrink:0;">${escapeHtml(initials(senderName))}</div>
                            <div class="msg-bubble">
                                <div class="msg-meta">
                                    <span class="msg-name">${escapeHtml(senderName)}${you ? ' (You)' : ''}</span>
                                    <span class="msg-time">${escapeHtml(formatTime(message.created_at))}</span>
                                </div>
                                <p>${escapeHtml(message.content)}</p>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        msgArea.scrollTop = msgArea.scrollHeight;
    }

    function renderChannels() {
        channelList.innerHTML = channels.length
            ? channels.map((channel) => `
                <div class="list-item channel-item" data-id="${escapeHtml(channel.id)}" data-mode="channel">
                    <span style="color:var(--sky-500); margin-right:4px; flex-shrink:0;">#</span>
                    <span class="channel-name">${escapeHtml(channel.name)}</span>
                </div>
            `).join('')
            : '<div style="color:var(--ink-400); padding: 8px;">No channels found.</div>';
    }

    function renderMembers() {
        // Left DM Sidebar: Use 'members' (filtered to active chats)
        dmList.innerHTML = members.slice(0, 15).map((member) => {
            const badge = member.unread_count > 0 
                ? `<span class="unread-badge">${member.unread_count}</span>` 
                : '';
            return `
                <div class="list-item dm-item" data-id="${escapeHtml(member.id)}" data-mode="dm">
                    <div class="avatar-sm">${escapeHtml(initials(member.full_name || member.username))}</div>
                    <div style="flex: 1; display: flex; justify-content: space-between; align-items: center;">
                        <span>${escapeHtml(member.full_name || member.username)}</span>
                        ${badge}
                    </div>
                </div>
            `;
        }).join('') || '<div style="color:var(--ink-400); padding: 8px;">No messages yet.</div>';

        // Right Member Panel: Use 'allUsers' (full platform list)
        const visibleGlobal = allUsers.filter((u) => !currentUser || u.id !== currentUser.id);
        memberList.innerHTML = `
            <div style="font-size:0.8rem; font-weight:700; color:var(--ink-400); text-transform:uppercase; margin:8px 0 12px 4px;">
                Members - ${visibleGlobal.length}
            </div>
            ${visibleGlobal.map((member) => `
                <div class="list-item member-item" data-id="${escapeHtml(member.id)}" data-mode="dm">
                    <div class="avatar-sm" style="position: relative;">
                        ${escapeHtml(initials(member.full_name || member.username))}
                        <span style="position: absolute; bottom: 0; right: 0; width: 8px; height: 8px; background: #22c55e; border: 1.5px solid white; border-radius: 50%;"></span>
                    </div>
                    <span class="channel-name">${escapeHtml(member.full_name || member.username)}</span>
                </div>
            `).join('')}
        `;
        
        if (currentId && currentMode) {
            setActiveItem(currentId, currentMode);
        }
    }

    async function loadCurrentUser() {
        if (!localStorage.getItem('access_token')) return null;
        try {
            currentUser = await api.get('/user');
        } catch (err) {
            currentUser = null;
        }
        return currentUser;
    }

    async function loadChannels() {
        channels = await api.get('/chat/channels');
        renderChannels();
        if (!currentId && channels.length) {
            await switchToChannel(channels[0]);
        }
    }

    async function loadMembers() {
        members = await api.get('/chat/dm-sidebar');
        renderMembers();
    }

    async function loadAllUsers() {
        allUsers = await api.get('/community/members');
        renderMembers();
    }

    async function switchToChannel(channel) {
        currentId = channel.id;
        currentName = channel.name;
        currentMode = 'channel';
        setActiveItem(channel.id, 'channel');
        
        const isAuthor = currentUser && (channel.author_id === currentUser.id || currentUser.role === 'admin');
        
        chatHeader.style.display = 'flex';
        chatHeader.style.justifyContent = 'space-between';
        chatHeader.style.alignItems = 'center';
        
        chatHeader.innerHTML = `
            <div class="channel-info">
                <span style="color:var(--sky-500); margin-right:4px;">#</span> ${escapeHtml(channel.name)}
            </div>
            ${isAuthor ? `
                <div style="display:flex; gap:8px;">
                    <button id="toggleBroadcastBtn" class="toggle-btn ${channel.is_broadcast ? 'is-broadcast' : ''}" title="Toggle Channel Mode">
                        <div class="toggle-icon"></div>
                        <span>${channel.is_broadcast ? 'Broadcast' : 'Open Discussion'}</span>
                    </button>
                    <button id="deleteChannelBtn" class="delete-btn" title="Delete Channel">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            ` : ''}
        `;

        if (isAuthor) {
            const toggleBtn = document.getElementById('toggleBroadcastBtn');
            toggleBtn.addEventListener('click', async () => {
                const newState = !channel.is_broadcast;
                try {
                    toggleBtn.disabled = true;
                    toggleBtn.style.opacity = '0.7';
                    await api.patch(`/chat/channels/${channel.id}/broadcast?is_broadcast=${newState}`);
                    channel.is_broadcast = newState;
                    switchToChannel(channel); 
                } catch (err) {
                    console.error('Failed to toggle broadcast mode:', err);
                    toggleBtn.disabled = false;
                    toggleBtn.style.opacity = '1';
                    alert('Failed to update channel mode: ' + err.message);
                }
            });

            const deleteBtn = document.getElementById('deleteChannelBtn');
            deleteBtn.addEventListener('click', async () => {
                const warning = `WARNING: Are you sure you want to delete #${channel.name}?\n\nOnce this community channel is deleted, it CANNOT be brought back and all message history will be permanently lost.`;
                if (!confirm(warning)) return;
                try {
                    deleteBtn.disabled = true;
                    await api.delete(`/chat/channels/${channel.id}`);
                    currentId = null;
                    currentMode = null;
                    chatHeader.innerHTML = 'Select a channel';
                    msgArea.innerHTML = '<div style="padding: 40px; color: var(--ink-400); text-align: center;">Channel deleted.</div>';
                    loadChannels(); // Refresh list
                } catch (err) {
                    console.error('Failed to delete channel:', err);
                    deleteBtn.disabled = false;
                    alert('Failed to delete channel: ' + err.message);
                }
            });
        }
        
        const micBtn = document.getElementById('mic-btn');
        if (channel.is_broadcast && !isAuthor) {
            chatInput.placeholder = "Broadcast channel: Only posters can message.";
            chatInput.disabled = true;
            if (micBtn) micBtn.style.display = 'none';
        } else {
            chatInput.placeholder = `Message #${channel.name}...`;
            chatInput.disabled = false;
            if (micBtn) micBtn.style.display = 'flex';
        }

        msgArea.innerHTML = '<div style="padding: 40px; color: var(--ink-400); text-align: center;">Loading messages...</div>';

        try {
            const messages = await api.get(`/chat/channels/${channel.id}/messages/overview`);
            renderMessages(messages);
        } catch (err) {
            console.error('Failed to load channel messages:', err);
            renderEmptyMessage('Unable to load messages', err.message || 'Please try again.');
        }
    }

    async function switchToDM(id, name) {
        currentId = id;
        currentName = name;
        currentMode = 'dm';
        setActiveItem(id, 'dm');
        chatHeader.innerHTML = `${escapeHtml(name)}`;
        chatInput.placeholder = `Message ${name}...`;
        chatInput.disabled = false;
        const micBtn = document.getElementById('mic-btn');
        if (micBtn) micBtn.style.display = 'flex';
        msgArea.innerHTML = '<div style="padding: 40px; color: var(--ink-400); text-align: center;">Loading messages...</div>';

        if (!localStorage.getItem('access_token')) {
            renderEmptyMessage('Log in required', 'Please log in to use direct messages.');
            return;
        }

        try {
            // Mark messages as read
            await api.post(`/chat/direct-messages/${id}/read`);
            // Refresh sidebar to update badges
            await loadMembers();

            const messages = await api.get(`/chat/direct-messages/${id}/overview`);
            renderMessages(messages);
        } catch (err) {
            console.error('Failed to load direct messages:', err);
            renderEmptyMessage('Unable to load direct messages', err.message || 'Please try again.');
        }
    }

    async function sendMessage() {
        const content = chatInput.value.trim();
        if (!content || !currentId) return;

        if (!localStorage.getItem('access_token')) {
            window.location.href = 'login.html';
            return;
        }

        chatInput.disabled = true;
        try {
            if (currentMode === 'channel') {
                await api.post(`/chat/channels/${currentId}/messages?content=${encodeURIComponent(content)}`);
                chatInput.value = '';
                const channel = channels.find(c => c.id === currentId);
                if (channel) await switchToChannel(channel);
            } else {
                await api.post('/chat/direct-messages', {
                    receiver_id: currentId,
                    content,
                    is_voice_record: false,
                });
                chatInput.value = '';
                await switchToDM(currentId, currentName);
            }
        } catch (err) {
            window.alert(err.message || 'Failed to send message.');
        } finally {
            chatInput.disabled = false;
            chatInput.focus();
        }
    }

    channelList.addEventListener('click', (event) => {
        const item = event.target.closest('.channel-item');
        if (!item) return;
        const channel = channels.find((entry) => entry.id === item.dataset.id);
        if (channel) switchToChannel(channel);
    });

    dmList.addEventListener('click', (event) => {
        const item = event.target.closest('.dm-item');
        if (!item) return;
        const member = members.find((entry) => entry.id === item.dataset.id);
        if (member) switchToDM(member.id, member.full_name || member.username);
    });

    memberList.addEventListener('click', (event) => {
        const item = event.target.closest('.member-item');
        if (!item) return;
        const member = allUsers.find((entry) => entry.id === item.dataset.id);
        if (member) switchToDM(member.id, member.full_name || member.username);
    });

    chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });

    searchInput?.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) {
            searchResults.innerHTML = '';
            return;
        }

        const matches = allUsers
            .filter((member) => !currentUser || member.id !== currentUser.id)
            .filter((member) => {
                const text = `${member.full_name || ''} ${member.username || ''} ${member.department_team || ''} ${member.organisation || ''}`.toLowerCase();
                return text.includes(query);
            })
            .slice(0, 10); // Show more results in global search

        searchResults.innerHTML = matches.map((member) => `
            <div class="list-item search-result-item" data-id="${escapeHtml(member.id)}" data-mode="dm">
                <div class="avatar-sm">${escapeHtml(initials(member.full_name || member.username))}</div>
                ${escapeHtml(member.full_name || member.username)}
            </div>
        `).join('') || '<div style="color:var(--ink-400); padding: 8px;">No users found.</div>';
    });

    searchResults?.addEventListener('click', (event) => {
        const item = event.target.closest('.search-result-item');
        if (!item) return;
        const member = allUsers.find((entry) => entry.id === item.dataset.id);
        if (member) {
            searchInput.value = '';
            searchResults.innerHTML = '';
            switchToDM(member.id, member.full_name || member.username);
        }
    });

    try {
        msgArea.innerHTML = '<div style="padding: 40px; color: var(--ink-400); text-align: center;">Loading community...</div>';
        await loadCurrentUser();
        await Promise.all([loadMembers(), loadChannels(), loadAllUsers()]);
    } catch (err) {
        console.error('Failed to initialise community page:', err);
        renderEmptyMessage('Community unavailable', err.message || 'Please try again.');
    }

    // Real-time Voice to Text logic (Web Speech API)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && micBtn) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let finalTranscript = '';

        micBtn.addEventListener('click', () => {
            if (!isRecording) {
                // Start listening
                finalTranscript = chatInput.value + (chatInput.value ? ' ' : '');
                recognition.start();
            } else {
                // Stop listening
                recognition.stop();
            }
        });

        recognition.onstart = () => {
            isRecording = true;
            micIndicator.style.display = 'block';
            micBtn.style.color = '#ff4757';
            chatInput.placeholder = "Listening...";
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            chatInput.value = (finalTranscript + interimTranscript).trim();
            chatInput.focus();
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            isRecording = false;
            micIndicator.style.display = 'none';
            micBtn.style.color = '';
        };

        recognition.onend = () => {
            isRecording = false;
            micIndicator.style.display = 'none';
            micBtn.style.color = '';
            chatInput.placeholder = currentMode === 'channel' ? `Message #${currentName}...` : `Message ${currentName}...`;
        };
    } else if (micBtn) {
        micBtn.style.display = 'none';
    }
});
