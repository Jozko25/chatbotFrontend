(function () {
  'use strict';

  const script = document.currentScript;
  if (!script) return;

  const chatbotId = script.getAttribute('data-chatbot-id');
  const apiKey = script.getAttribute('data-api-key');
  const apiUrl = script.getAttribute('data-api-url') || '';

  if (!chatbotId || !apiKey || !apiUrl) {
    console.warn('[SiteBot] Missing required attributes: data-chatbot-id, data-api-key, or data-api-url');
    return;
  }

  const apiBase = apiUrl.replace(/\/+$/, '');

  // Generate or retrieve session ID for conversation tracking
  const getSessionId = () => {
    const key = 'sitebot_session_' + chatbotId;
    let sessionId = localStorage.getItem(key);
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem(key, sessionId);
    }
    return sessionId;
  };

  const sessionId = getSessionId();

  // Sanitize text content to prevent XSS
  const sanitize = (str) => {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  const sanitizeColor = (value, fallback) => {
    if (typeof value !== 'string') return fallback;
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim()) ? value : fallback;
  };

  // Chatbot data and theme (loaded from API)
  let clinicData = null;
  let theme = {
    name: 'Assistant',
    tagline: 'AI-powered assistant',
    primary: '#18181b',
    surface: '#ffffff',
    text: '#09090b',
    user: '#18181b',
    userText: '#ffffff',
    assistant: '#ffffff',
    assistantBorder: '#e4e4e7'
  };

  // Create isolated shadow DOM
  const shadowHost = document.createElement('div');
  shadowHost.id = 'sitebot-widget';
  document.body.appendChild(shadowHost);
  const shadow = shadowHost.attachShadow({ mode: 'closed' });

  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

    :host {
      all: initial;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 16px;
      border: none;
      background: var(--chat-primary);
      color: var(--chat-surface);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      z-index: 2147483646;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .fab:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
    }

    .fab svg {
      width: 24px;
      height: 24px;
    }

    .fab.hidden {
      display: none;
    }

    .fab.loading {
      opacity: 0.5;
      cursor: wait;
    }

    .panel {
      --chat-primary: #18181b;
      --chat-surface: #ffffff;
      --chat-text: #09090b;
      --chat-muted: #71717a;
      --chat-user: var(--chat-primary);
      --chat-user-text: #ffffff;
      --chat-assistant: #ffffff;
      --chat-assistant-border: #e4e4e7;
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 380px;
      max-width: calc(100vw - 48px);
      height: min(560px, 75vh);
      max-height: calc(100vh - 48px);
      background: var(--chat-surface);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      border: 1px solid var(--chat-assistant-border);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 2147483646;
      animation: slideUp 0.2s ease-out;
    }

    .panel.open {
      display: flex;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: var(--chat-surface);
      border-bottom: 1px solid var(--chat-assistant-border);
      flex-shrink: 0;
    }

    .headerInfo h3 {
      font-size: 14px;
      font-weight: 600;
      color: var(--chat-text);
      margin: 0;
    }

    .headerSub {
      margin: 2px 0 0;
      color: var(--chat-muted);
      font-size: 12px;
    }

    .headerActions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .actionBtn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--chat-muted);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, color 0.15s;
    }

    .actionBtn:hover {
      background: #f4f4f5;
      color: var(--chat-text);
    }

    .actionBtn svg {
      width: 18px;
      height: 18px;
    }

    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #fafafa;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .messages::-webkit-scrollbar {
      width: 6px;
    }
    .messages::-webkit-scrollbar-track {
      background: transparent;
    }
    .messages::-webkit-scrollbar-thumb {
      background: #d4d4d8;
      border-radius: 3px;
    }

    .msg {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .user {
      align-self: flex-end;
      background: var(--chat-user);
      color: var(--chat-user-text);
      border-bottom-right-radius: 4px;
    }

    .assistant {
      align-self: flex-start;
      background: var(--chat-assistant);
      color: var(--chat-text);
      border: 1px solid var(--chat-assistant-border);
      border-bottom-left-radius: 4px;
    }

    .error {
      align-self: center;
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
      text-align: center;
      font-size: 13px;
    }

    .inputBar {
      display: flex;
      gap: 10px;
      padding: 16px 20px;
      background: var(--chat-surface);
      border-top: 1px solid var(--chat-assistant-border);
      flex-shrink: 0;
    }

    .inputBar input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid var(--chat-assistant-border);
      border-radius: 100px;
      font-size: 14px;
      font-family: inherit;
      background: #fafafa;
      color: var(--chat-text);
      transition: border-color 0.15s, background 0.15s;
    }

    .inputBar input::placeholder {
      color: var(--chat-muted);
    }

    .inputBar input:focus {
      outline: none;
      border-color: var(--chat-primary);
      background: var(--chat-surface);
    }

    .send {
      width: 40px;
      height: 40px;
      border-radius: 100px;
      background: var(--chat-primary);
      border: none;
      color: var(--chat-surface);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.15s;
      flex-shrink: 0;
    }

    .send:hover:not(:disabled) {
      opacity: 0.9;
    }

    .send:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .send svg {
      width: 18px;
      height: 18px;
    }

    .typing {
      display: flex;
      gap: 4px;
      padding: 4px 0;
    }

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--chat-muted);
      animation: typing 1s infinite ease-in-out;
    }

    .dot:nth-child(2) { animation-delay: 0.15s; }
    .dot:nth-child(3) { animation-delay: 0.3s; }

    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.4;
      }
      30% {
        transform: translateY(-4px);
        opacity: 1;
      }
    }

    @media (max-width: 480px) {
      .panel {
        bottom: 16px;
        right: 16px;
        left: 16px;
        width: auto;
        max-width: none;
        height: calc(100vh - 100px);
        max-height: none;
      }
      .fab {
        bottom: 16px;
        right: 16px;
        width: 52px;
        height: 52px;
      }
    }
  `;

  const fab = document.createElement('button');
  fab.className = 'fab loading';
  fab.type = 'button';
  fab.setAttribute('aria-label', 'Open chat');
  fab.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>`;

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = `
    <header class="header">
      <div class="headerInfo">
        <h3 class="header-name">Loading...</h3>
        <p class="headerSub header-tagline">AI-powered assistant</p>
      </div>
      <div class="headerActions">
        <button class="actionBtn minimize" aria-label="Minimize" title="Minimize">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button class="actionBtn close" aria-label="Close" title="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </header>
    <div class="messages"></div>
    <div class="inputBar">
      <input type="text" placeholder="Ask anything..." autocomplete="off" disabled />
      <button class="send" aria-label="Send message" disabled>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      </button>
    </div>
  `;

  shadow.append(style, fab, panel);

  const messagesEl = panel.querySelector('.messages');
  const inputEl = panel.querySelector('input');
  const sendBtn = panel.querySelector('.send');
  const closeBtn = panel.querySelector('.close');
  const minimizeBtn = panel.querySelector('.minimize');
  const headerName = panel.querySelector('.header-name');
  const headerTagline = panel.querySelector('.header-tagline');

  let open = false;
  let loading = false;
  let initialized = false;
  const messages = [];

  const scrollToBottom = () => {
    if (messagesEl) {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  };

  const renderMessages = () => {
    if (!messagesEl) return;
    messagesEl.innerHTML = '';

    messages.forEach((m) => {
      const div = document.createElement('div');
      div.className = `msg ${m.role}`;
      div.textContent = m.content;
      messagesEl.appendChild(div);
    });

    if (loading) {
      const div = document.createElement('div');
      div.className = 'msg assistant';
      div.innerHTML = '<div class="typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
      messagesEl.appendChild(div);
    }

    scrollToBottom();
  };

  const showError = (message) => {
    const div = document.createElement('div');
    div.className = 'msg error';
    div.textContent = message;
    messagesEl?.appendChild(div);
    scrollToBottom();
  };

  const applyTheme = (themeData) => {
    if (!themeData) return;

    theme = {
      name: sanitize(themeData.name || clinicData?.clinic_name || 'Assistant'),
      tagline: sanitize(themeData.tagline || 'AI-powered assistant'),
      primary: sanitizeColor(themeData.primaryColor, '#18181b'),
      surface: sanitizeColor(themeData.backgroundColor, '#ffffff'),
      text: sanitizeColor(themeData.textColor, '#09090b'),
      user: sanitizeColor(themeData.userBubbleColor, '#18181b'),
      userText: sanitizeColor(themeData.backgroundColor, '#ffffff'),
      assistant: sanitizeColor(themeData.assistantBubbleColor, '#ffffff'),
      assistantBorder: '#e4e4e7'
    };

    panel.style.setProperty('--chat-primary', theme.primary);
    panel.style.setProperty('--chat-surface', theme.surface);
    panel.style.setProperty('--chat-text', theme.text);
    panel.style.setProperty('--chat-muted', theme.text);
    panel.style.setProperty('--chat-user', theme.user);
    panel.style.setProperty('--chat-user-text', theme.userText);
    panel.style.setProperty('--chat-assistant', theme.assistant);
    panel.style.setProperty('--chat-assistant-border', theme.assistantBorder);
    fab.style.setProperty('--chat-primary', theme.primary);
    fab.style.setProperty('--chat-surface', theme.surface);

    if (headerName) headerName.textContent = theme.name;
    if (headerTagline) headerTagline.textContent = theme.tagline;
  };

  // Load chatbot configuration from API
  const loadChatbot = async () => {
    try {
      const response = await fetch(`${apiBase}/api/widget/chatbot/${chatbotId}`, {
        headers: {
          'X-API-Key': apiKey
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to load chatbot' }));
        throw new Error(error.error || 'Failed to load chatbot');
      }

      const data = await response.json();
      clinicData = data.clinicData;

      // Apply theme
      applyTheme(data.theme);

      // Update header with actual name
      if (headerName) headerName.textContent = sanitize(clinicData?.clinic_name || 'Assistant');

      // Add welcome message
      if (clinicData?.welcomeMessage) {
        messages.push({ role: 'assistant', content: clinicData.welcomeMessage });
        renderMessages();
      }

      // Enable input
      if (inputEl) inputEl.disabled = false;
      if (sendBtn) sendBtn.disabled = false;
      fab.classList.remove('loading');
      initialized = true;

    } catch (err) {
      console.error('[SiteBot] Failed to load chatbot:', err);
      fab.classList.remove('loading');
      showError(err.message || 'Failed to load chatbot. Please check your API key.');
    }
  };

  const openPanel = () => {
    open = true;
    panel.classList.add('open');
    fab.classList.add('hidden');
    setTimeout(scrollToBottom, 50);
    if (initialized) inputEl?.focus();
  };

  const closePanel = () => {
    open = false;
    panel.classList.remove('open');
    fab.classList.remove('hidden');
  };

  fab.addEventListener('click', openPanel);
  closeBtn?.addEventListener('click', closePanel);
  minimizeBtn?.addEventListener('click', closePanel);

  const sendMessage = async () => {
    if (!inputEl || !sendBtn || !initialized) return;
    const content = inputEl.value.trim();
    if (!content || loading) return;

    messages.push({ role: 'user', content });
    inputEl.value = '';
    renderMessages();

    loading = true;
    sendBtn.disabled = true;
    renderMessages();

    try {
      const res = await fetch(`${apiBase}/api/widget/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({
          chatbotId,
          sessionId,
          conversationHistory: messages.slice(-10), // Last 10 messages for context
          message: content
        })
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
      }

      if (!res.body) {
        throw new Error('No response body');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);
          try {
            const data = JSON.parse(payload);
            if (data.error) throw new Error(data.error);
            if (data.done) break;
            if (data.content) {
              assistantText += data.content;
            }
          } catch {
            // Ignore malformed chunks
          }
        }
      }

      if (assistantText) {
        messages.push({ role: 'assistant', content: assistantText });
      }
    } catch (err) {
      console.error('[SiteBot] Send failed:', err);

      // Handle specific error messages
      if (err.message.includes('limit')) {
        showError('Message limit exceeded. Please try again later.');
      } else if (err.message.includes('Domain')) {
        showError('This widget is not authorized for this domain.');
      } else {
        messages.push({ role: 'assistant', content: 'Sorry, something went wrong. Please try again.' });
      }
    } finally {
      loading = false;
      sendBtn.disabled = false;
      renderMessages();
      scrollToBottom();
    }
  };

  sendBtn?.addEventListener('click', sendMessage);
  inputEl?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Load chatbot on init
  loadChatbot();
})();
