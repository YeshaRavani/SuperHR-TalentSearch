function initChatbot() {
    const CHAT_STORAGE_KEY = 'talent_search_ai_chat_history';
    const OPPORTUNITY_DRAFT_KEY = 'talent_search_ai_opportunity_draft';
    const ACTION_URLS = {
        'Open home page': 'index (1).html',
        'Open opportunities page': 'opportunities.html',
        'Browse opportunities': 'opportunities.html',
        'Open add opportunity page': 'add-opportunity.html',
        'Review expectations before applying': 'opportunities.html',
        'Update your profile': 'profile.html',
        'Refresh AI matches': 'profile.html',
        'Open dashboard': 'dashboard.html',
        'Check reward policy': 'admin-manage-users.html',
        'Open community page': 'community.html',
        'Join an active channel': 'community.html',
        'Ask about recommended opportunities': null,
        'Ask about rewards': null,
        'Ask how to use community chat': null,
        'Open posted opportunities page': 'posted-opportunities.html',
        'Open appointment page': 'appointment.html',
        'Open login page': 'login.html',
        'Open contributor signup': 'contributor-details.html',
        'Open admin signup': 'admin-details.html',
        'Open admin home': 'admin-home.html',
        'Open admin manage users': 'admin-manage-users.html',
        'Open admin manage opportunities': 'admin-manage-opportunities.html',
        'Open admin system settings': 'admin-system-settings.html',
        'Open admin profile': 'admin-user-profile.html',
    };

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
                <button type="button" id="ai-chat-voice-btn" class="chatbot-voice-btn" onclick="window.toggleChatVoiceInput()" aria-label="Speak message" title="Speak message">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="22"></line>
                    </svg>
                </button>
                <button type="button" class="chatbot-send-btn" onclick="window.sendChatMessage()" aria-label="Send Message">
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
    const voiceBtn = document.getElementById('ai-chat-voice-btn');
    const conversationHistory = loadConversationHistory();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let isListening = false;
    let isSending = false;
    let voiceStartedText = '';
    let voiceHasTranscript = false;
    let suppressVoiceAutoSend = false;
    let lastVoiceSentText = '';
    let latestUserMessage = '';

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = false;
    } else if (voiceBtn) {
        voiceBtn.disabled = true;
        voiceBtn.title = 'Voice input is not supported in this browser';
        voiceBtn.classList.add('unsupported');
    }

    function loadConversationHistory() {
        try {
            const raw = sessionStorage.getItem(CHAT_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (_) {
            return [];
        }
    }

    function persistConversationHistory() {
        try {
            sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversationHistory.slice(-12)));
        } catch (_) {
            // Ignore storage failures and keep chat usable.
        }
    }

    function appendBotMessage(text) {
        const botDiv = document.createElement('div');
        botDiv.className = 'chat-bubble bot';
        botDiv.textContent = text;
        chatBody.appendChild(botDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
        return botDiv;
    }

    function appendSources(sources) {
        if (!Array.isArray(sources) || !sources.length) return;
        const sourceDiv = document.createElement('div');
        sourceDiv.className = 'chat-sources';
        sourceDiv.textContent = `Based on: ${sources.slice(0, 3).join(', ')}`;
        chatBody.appendChild(sourceDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function appendActionButtons(actions) {
        if (!Array.isArray(actions) || !actions.length) return;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'chat-actions';

        actions.slice(0, 3).forEach((action) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'chat-action-btn';
            button.textContent = action;
            button.addEventListener('click', async () => {
                if (action === 'Open add opportunity page' && latestUserMessage && isOpportunityDraftRequest(latestUserMessage)) {
                    await createOpportunityDraftFromChat(latestUserMessage, { allowSparseDraft: true });
                    return;
                }
                const url = ACTION_URLS[action];
                if (url) {
                    window.location.href = url;
                    return;
                }
                chatInput.value = action.replace(/^Ask about /, 'Tell me about ');
                chatInput.focus();
            });
            actionsDiv.appendChild(button);
        });

        chatBody.appendChild(actionsDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function appendUserMessage(text) {
        const userDiv = document.createElement('div');
        userDiv.className = 'chat-bubble user';
        userDiv.textContent = text;
        chatBody.appendChild(userDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function isOpportunityDraftRequest(text) {
        const normalized = text.toLowerCase();
        return (
            /\b(post|poste|posted|posting|create|add|draft|make|open)\b/.test(normalized)
            && /\b(opportunity|opportunities|role|task|project|opening|volunteer|volunteers|students|contributors)\b/.test(normalized)
        );
    }

    function hasEnoughDraftDetail(text) {
        const normalized = text.toLowerCase();
        const detailSignals = [
            /\bneed\b/,
            /\blooking for\b/,
            /\bhelp\b/,
            /\bskill/,
            /\bhour/,
            /\bweek/,
            /\breward/,
            /\bxp\b/,
            /\blocation/,
            /\bremote\b/,
            /\bdesign\b/,
            /\bdevelop\b/,
            /\bmanage\b/,
            /\bcoordinate\b/,
        ];
        return text.trim().length >= 45 && detailSignals.some((pattern) => pattern.test(normalized));
    }

    async function createOpportunityDraftFromChat(text, options = {}) {
        if (!localStorage.getItem('access_token')) {
            appendBotMessage('Please log in before posting an opportunity. After logging in, ask me again with the opportunity details.');
            appendActionButtons(['Open login page']);
            return true;
        }

        if (!options.allowSparseDraft && !hasEnoughDraftDetail(text)) {
            appendBotMessage('Tell me the opportunity title or goal, required skills, location, timeline, time commitment, and reward points. I can then open the posting page with the fields filled for review.');
            appendActionButtons(['Open add opportunity page']);
            return true;
        }

        const pendingBubble = appendBotMessage('Creating an editable opportunity draft...');
        try {
            const parsed = await window.api.post('/ai/parse-opportunity', { description: text });
            const draft = {
                source: text,
                title: parsed.title || '',
                description: parsed.description || text,
                type: parsed.type || 'Opportunity',
                xp: parsed.bounty || 100,
                time: parsed.time_commitment || '1-2 hours / week',
                schedule: parsed.schedule || 'TBD',
                location: parsed.location || 'Remote',
                skills: Array.isArray(parsed.skills) ? parsed.skills : [],
                createdAt: Date.now(),
            };
            sessionStorage.setItem(OPPORTUNITY_DRAFT_KEY, JSON.stringify(draft));
            localStorage.setItem(OPPORTUNITY_DRAFT_KEY, JSON.stringify(draft));
            pendingBubble.remove();
            appendBotMessage('I created a draft. Opening the posting page now so you can review, edit, and post it.');
            window.location.href = 'add-opportunity.html?draft=ai';
        } catch (error) {
            pendingBubble.remove();
            appendBotMessage(error.message || 'I could not create the opportunity draft. Try adding more details or fill the form manually.');
        }
        return true;
    }

    function setListeningState(nextState) {
        isListening = nextState;
        if (!voiceBtn) return;
        voiceBtn.classList.toggle('listening', isListening);
        voiceBtn.setAttribute('aria-label', isListening ? 'Stop voice input' : 'Speak message');
        voiceBtn.title = isListening ? 'Listening...' : 'Speak message';
    }

    function renderStoredConversation() {
        if (!conversationHistory.length) {
            return;
        }

        chatBody.innerHTML = '';
        conversationHistory.forEach((turn) => {
            if (turn.role === 'user') {
                appendUserMessage(turn.content);
            } else {
                appendBotMessage(turn.content);
            }
        });
    }

    renderStoredConversation();

    // 3. Define global functions for toggling and sending messages
    window.toggleAIChatbot = function () {
        if (chatWindow.classList.contains('active')) {
            chatWindow.classList.remove('active');
        } else {
            chatWindow.classList.add('active');
            chatInput.focus();
        }
    };

    async function sendChatText(rawText) {
        if (isSending) return;
        const text = String(rawText || '').trim();
        if (!text) return;
        isSending = true;
        latestUserMessage = text;

        appendUserMessage(text);
        conversationHistory.push({ role: 'user', content: text });
        persistConversationHistory();

        chatInput.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;
        const pendingBubble = appendBotMessage('Thinking...');

        try {
            if (!window.api || typeof window.api.post !== 'function') {
                throw new Error('Chat API is not available on this page.');
            }

            if (isOpportunityDraftRequest(text) && await createOpportunityDraftFromChat(text)) {
                pendingBubble.remove();
                return;
            }

            const response = await window.api.post('/ai/chat', {
                message: text,
                history: conversationHistory.slice(-6),
            });
            pendingBubble.remove();
            appendBotMessage(response.reply);
            appendSources(response.sources);
            appendActionButtons(response.suggested_actions);
            conversationHistory.push({ role: 'assistant', content: response.reply });
            persistConversationHistory();
        } catch (error) {
            pendingBubble.remove();
            const fallback = error.message || 'AI assistant is unavailable right now.';
            appendBotMessage(fallback);
            conversationHistory.push({ role: 'assistant', content: fallback });
            persistConversationHistory();
        } finally {
            isSending = false;
        }
    }

    window.sendChatMessage = async function () {
        if (isListening && recognition) {
            suppressVoiceAutoSend = true;
            recognition.stop();
            setListeningState(false);
        }

        await sendChatText(chatInput.value);
    };

    window.toggleChatVoiceInput = function () {
        if (!recognition) {
            appendBotMessage('Voice input is not supported in this browser. Try Chrome or Edge, or type your message.');
            return;
        }

        if (isListening) {
            suppressVoiceAutoSend = false;
            recognition.stop();
            setListeningState(false);
            return;
        }

        voiceStartedText = chatInput.value.trim();
        voiceHasTranscript = false;
        suppressVoiceAutoSend = false;
        let finalTranscript = voiceStartedText;

        recognition.onstart = function () {
            setListeningState(true);
            chatInput.placeholder = 'Listening...';
        };

        recognition.onresult = function (event) {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i += 1) {
                const transcript = event.results[i][0].transcript.trim();
                if (transcript) {
                    voiceHasTranscript = true;
                }
                if (event.results[i].isFinal) {
                    finalTranscript = `${finalTranscript} ${transcript}`.trim();
                } else {
                    interimTranscript = transcript;
                }
            }

            chatInput.value = `${finalTranscript} ${interimTranscript}`.trim();
            chatInput.focus();
        };

        recognition.onerror = function (event) {
            voiceHasTranscript = false;
            suppressVoiceAutoSend = true;
            setListeningState(false);
            chatInput.placeholder = 'Type a message...';
            const message = event.error === 'not-allowed'
                ? 'Microphone permission was blocked. Allow microphone access to use voice typing.'
                : 'Voice input stopped. You can try again or type your message.';
            appendBotMessage(message);
        };

        recognition.onend = function () {
            setListeningState(false);
            chatInput.placeholder = 'Type a message...';
            chatInput.focus();
            const currentText = chatInput.value.trim();
            const hasNewVoiceText = voiceHasTranscript && currentText && currentText !== voiceStartedText;
            if (hasNewVoiceText && !suppressVoiceAutoSend && currentText !== lastVoiceSentText) {
                lastVoiceSentText = currentText;
                setTimeout(() => sendChatText(currentText), 120);
            }
        };

        try {
            recognition.start();
        } catch (_) {
            setListeningState(false);
        }
    };
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
} else {
    initChatbot();
}
