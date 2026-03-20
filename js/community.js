document.addEventListener('DOMContentLoaded', async () => {
    const dmList = document.getElementById('dm-list');
    const channelList = document.getElementById('channel-list');
    const memberList = document.querySelector('.user-list-panel .panel-content');
    const chatHeader = document.getElementById('chat-header');
    const chatInput = document.getElementById('chat-input');
    const msgArea = document.getElementById('chat-messages-area');

    let currentMode = 'channel'; // or 'dm'
    let currentId = 'general';

    // Load channels
    async function loadChannels() {
        try {
            const channels = await api.get('/chat/channels');
            channelList.innerHTML = '';
            channels.forEach(ch => {
                const item = document.createElement('div');
                item.className = `list-item channel-item ${ch.id === currentId ? 'active' : ''}`;
                item.innerHTML = `<span style="color:var(--sky-500); margin-right:4px;">#</span> ${ch.name}`;
                item.onclick = () => switchToChannel(ch.id, ch.name);
                channelList.appendChild(item);
            });
        } catch (err) { console.error(err); }
    }

    // Load members
    async function loadMembers() {
        try {
            const members = await api.get('/community/members');
            memberList.innerHTML = '<div style="font-size:0.8rem; font-weight:700; color:var(--ink-400); text-transform:uppercase; margin:8px 0 12px 4px;">Members</div>';
            members.forEach(m => {
                const item = document.createElement('div');
                item.className = 'list-item member-item';
                const avatar = m.full_name.charAt(0);
                item.innerHTML = `<div class="avatar-sm">${avatar}</div> ${m.full_name}`;
                item.onclick = () => switchToDM(m.id, m.full_name, avatar);
                memberList.appendChild(item);
            });
        } catch (err) { console.error(err); }
    }

    async function switchToChannel(id, name) {
        currentId = id;
        currentMode = 'channel';
        document.querySelectorAll('.list-item').forEach(el => el.classList.remove('active'));
        chatHeader.innerHTML = `<span style="color:var(--sky-500); margin-right:4px;">#</span> ${name}`;
        chatInput.placeholder = `Message #${name}...`;
        loadMessages(id);
    }

    async function loadMessages(channelId) {
        try {
            const msgs = await api.get(`/chat/channels/${channelId}/messages`);
            const staticArea = document.getElementById('static-messages');
            if (staticArea) staticArea.innerHTML = '';
            
            msgs.forEach(msg => {
                const row = document.createElement('div');
                row.className = 'msg-row';
                row.innerHTML = `
                    <div class="avatar-sm" style="flex-shrink:0;">${msg.sender_id.charAt(0)}</div>
                    <div class="msg-bubble">
                        <div class="msg-meta"><span class="msg-name">${msg.sender_id}</span><span class="msg-time">${new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                        <p>${msg.content}</p>
                    </div>
                `;
                staticArea.appendChild(row);
            });
            msgArea.scrollTop = msgArea.scrollHeight;
        } catch (err) { console.error(err); }
    }

    chatInput.onkeypress = async (e) => {
        if (e.key === 'Enter' && chatInput.value.trim()) {
            try {
                await api.post(`/chat/channels/${currentId}/messages?content=${encodeURIComponent(chatInput.value)}`);
                chatInput.value = '';
                loadMessages(currentId);
            } catch (err) { alert(err.message); }
        }
    };

    loadChannels();
    loadMembers();
    loadMessages('general');
});