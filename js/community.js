document.addEventListener('DOMContentLoaded', async () => {
    const dmList = document.getElementById('dm-list');
    const channelList = document.getElementById('channel-list');
    const memberList = document.querySelector('.user-list-panel .panel-content');
    const chatHeader = document.getElementById('chat-header');
    const chatInput = document.getElementById('chat-input');
    const msgArea = document.getElementById('chat-messages-area');
    const searchInput = document.getElementById('user-search');
    const searchResults = document.getElementById('search-results');

    let currentMode = 'channel';
    let currentId = null;
    let currentName = '';
    let channels = [];
    let members = [];
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
                    <span style="color:var(--sky-500); margin-right:4px;">#</span> ${escapeHtml(channel.name)}
                </div>
            `).join('')
            : '<div style="color:var(--ink-400); padding: 8px;">No channels found.</div>';
    }

    function renderMembers() {
        const visibleMembers = members.filter((member) => !currentUser || member.id !== currentUser.id);

        dmList.innerHTML = visibleMembers.slice(0, 8).map((member) => `
            <div class="list-item dm-item" data-id="${escapeHtml(member.id)}" data-mode="dm">
                <div class="avatar-sm">${escapeHtml(initials(member.full_name || member.username))}</div>
                ${escapeHtml(member.full_name || member.username)}
            </div>
        `).join('') || '<div style="color:var(--ink-400); padding: 8px;">No members available.</div>';

        memberList.innerHTML = `
            <div style="font-size:0.8rem; font-weight:700; color:var(--ink-400); text-transform:uppercase; margin:8px 0 12px 4px;">
                Members - ${visibleMembers.length}
            </div>
            ${visibleMembers.map((member) => `
                <div class="list-item member-item" data-id="${escapeHtml(member.id)}" data-mode="dm">
                    <div class="avatar-sm">${escapeHtml(initials(member.full_name || member.username))}</div>
                    ${escapeHtml(member.full_name || member.username)}
                </div>
            `).join('')}
        `;
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
            await switchToChannel(channels[0].id, channels[0].name);
        }
    }

    async function loadMembers() {
        members = await api.get('/community/members');
        renderMembers();
    }

    async function switchToChannel(id, name) {
        currentId = id;
        currentName = name;
        currentMode = 'channel';
        setActiveItem(id, 'channel');
        chatHeader.innerHTML = `<span style="color:var(--sky-500); margin-right:4px;">#</span> ${escapeHtml(name)}`;
        chatInput.placeholder = `Message #${name}...`;
        msgArea.innerHTML = '<div style="padding: 40px; color: var(--ink-400); text-align: center;">Loading messages...</div>';

        try {
            const messages = await api.get(`/chat/channels/${id}/messages/overview`);
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
        msgArea.innerHTML = '<div style="padding: 40px; color: var(--ink-400); text-align: center;">Loading messages...</div>';

        if (!localStorage.getItem('access_token')) {
            renderEmptyMessage('Log in required', 'Please log in to use direct messages.');
            return;
        }

        try {
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
                await switchToChannel(currentId, currentName);
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
        if (channel) switchToChannel(channel.id, channel.name);
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
        const member = members.find((entry) => entry.id === item.dataset.id);
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

        const matches = members
            .filter((member) => !currentUser || member.id !== currentUser.id)
            .filter((member) => {
                const text = `${member.full_name || ''} ${member.username || ''} ${member.department_team || ''} ${member.organisation || ''}`.toLowerCase();
                return text.includes(query);
            })
            .slice(0, 6);

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
        const member = members.find((entry) => entry.id === item.dataset.id);
        if (member) {
            searchInput.value = '';
            searchResults.innerHTML = '';
            switchToDM(member.id, member.full_name || member.username);
        }
    });

    try {
        msgArea.innerHTML = '<div style="padding: 40px; color: var(--ink-400); text-align: center;">Loading community...</div>';
        await loadCurrentUser();
        await Promise.all([loadMembers(), loadChannels()]);
    } catch (err) {
        console.error('Failed to initialise community page:', err);
        renderEmptyMessage('Community unavailable', err.message || 'Please try again.');
    }
});
