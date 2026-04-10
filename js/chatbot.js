function initChatbot() {
    // 1. Check for existing `.fab` button, or create one if it doesn't exist
    let fbs = document.querySelectorAll('.fab');
    let fab;

    if (fbs.length === 0) {
        fab = document.createElement('a');
        fab.className = 'fab';
        fab.href = '#';
        fab.innerHTML = `
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        `;
        document.body.appendChild(fab);

        if (!document.getElementById('dynamic-fab-style')) {
            const style = document.createElement('style');
            style.id = 'dynamic-fab-style';
            style.innerHTML = `
                .fab {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, var(--sky-500, #9ecae1), var(--sky-400, #add8e6));
                    color: var(--white, #ffffff);
                    border-radius: 50%;
                    display: grid;
                    place-items: center;
                    box-shadow: 0 10px 30px rgba(15, 31, 43, 0.15);
                    cursor: pointer;
                    z-index: 1001;
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s;
                }
                .fab:hover {
                    transform: translateY(-4px) scale(1.05);
                    box-shadow: 0 15px 35px rgba(15, 31, 43, 0.2);
                }
            `;
            document.head.appendChild(style);
        }
    } else {
        fab = fbs[0];
    }

    // We override its functionality
    fab.href = "#";
    fab.setAttribute('onclick', 'event.preventDefault(); window.toggleAIChatbot();');

    // 2. Inject the Chatbot UI into the DOM
    const chatbotHTML = `
        <div id="ai-chatbot-window" class="chatbot-overlay">
            <div class="chatbot-header">
                <div class="title-area">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    AI Assistant
                </div>
                <button class="chatbot-close" onclick="window.toggleAIChatbot()" aria-label="Close Chat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px; height:16px;">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div id="ai-chat-body" class="chatbot-body">
                <div class="chat-bubble bot">
                    Hello! I'm your Talent Search AI Assistant. How can I help you today?
                </div>
            </div>
            <div class="chatbot-input-area">
                <input type="text" id="ai-chat-input" class="chatbot-input" placeholder="Type a message..." onkeypress="if(event.key === 'Enter') window.sendChatMessage()">
                <button class="chatbot-send-btn" onclick="window.sendChatMessage()" aria-label="Send Message">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        </div>
    `;

    // Append to body
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    const chatWindow = document.getElementById('ai-chatbot-window');
    const chatInput = document.getElementById('ai-chat-input');
    const chatBody = document.getElementById('ai-chat-body');

    // 3. Define global functions for toggling and sending messages
    window.toggleAIChatbot = function () {
        if (chatWindow.classList.contains('active')) {
            chatWindow.classList.remove('active');
        } else {
            chatWindow.classList.add('active');
            chatInput.focus();
        }
    };

    window.sendChatMessage = async function () {
        const text = chatInput.value.trim();
        if (!text) return;

        // Append User Message
        const userDiv = document.createElement('div');
        userDiv.className = 'chat-bubble user';
        userDiv.textContent = text;
        chatBody.appendChild(userDiv);

        chatInput.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;

        try {
            const response = await api.post('/ai/chat', { message: text });
            const botDiv = document.createElement('div');
            botDiv.className = 'chat-bubble bot';
            botDiv.textContent = response.reply;
            chatBody.appendChild(botDiv);

            if (response.suggested_actions && response.suggested_actions.length) {
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'chat-bubble bot';
                actionsDiv.textContent = `Suggested actions: ${response.suggested_actions.join(' | ')}`;
                chatBody.appendChild(actionsDiv);
            }

            chatBody.scrollTop = chatBody.scrollHeight;
        } catch (error) {
            const botDiv = document.createElement('div');
            botDiv.className = 'chat-bubble bot';
            botDiv.textContent = error.message || 'AI assistant is unavailable right now.';
            chatBody.appendChild(botDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    };
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
} else {
    initChatbot();
}
