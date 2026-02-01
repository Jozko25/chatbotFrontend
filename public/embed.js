(function () {
  'use strict';

  const script = document.currentScript;
  if (!script) return;

  if (document.getElementById('xelochat-widget')) {
    return;
  }

  const chatbotId = script.getAttribute('data-chatbot-id')?.trim();
  const apiKey = script.getAttribute('data-api-key')?.trim();
  const apiUrl = script.getAttribute('data-api-url')?.trim() || '';
  const widgetStyle = script.getAttribute('data-style')?.trim() || 'floating'; // floating, embedded, minimal
  const widgetPosition = script.getAttribute('data-position')?.trim() || 'bottom-right'; // bottom-right, bottom-left
  const targetContainer = script.getAttribute('data-container')?.trim() || null; // For embedded mode: CSS selector of container element

  // Security: Validate required attributes
  if (!chatbotId || !apiKey || !apiUrl) {
    console.warn('[XeloChat] Missing required attributes: data-chatbot-id, data-api-key, or data-api-url');
    return;
  }

  // Security: Validate chatbotId format (alphanumeric, hyphens, underscores only)
  if (!/^[a-zA-Z0-9_-]+$/.test(chatbotId)) {
    console.error('[XeloChat] Invalid chatbot ID format');
    return;
  }

  // Security: Validate API key format (basic length check)
  if (apiKey.length < 10 || apiKey.length > 200) {
    console.error('[XeloChat] Invalid API key format');
    return;
  }

  // Security: Validate API URL to prevent SSRF
  let apiBase;
  try {
    const url = new URL(apiUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      console.error('[XeloChat] Invalid API URL protocol. Only http/https allowed.');
      return;
    }
    apiBase = url.origin + url.pathname.replace(/\/+$/, '');
  } catch (e) {
    console.error('[XeloChat] Invalid API URL format:', e);
    return;
  }

  // Generate or retrieve session ID for conversation tracking
  const getSessionId = () => {
    const key = 'xelochat_session_' + chatbotId;
    let sessionId = localStorage.getItem(key);
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem(key, sessionId);
    }
    return sessionId;
  };

  // Track if this is first open
  const isFirstOpen = () => {
    const key = 'xelochat_opened_' + chatbotId;
    return !localStorage.getItem(key);
  };

  const markAsOpened = () => {
    const key = 'xelochat_opened_' + chatbotId;
    localStorage.setItem(key, 'true');
  };

  const sessionId = getSessionId();

  // Sanitize text content to prevent XSS
  const sanitize = (str) => {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  const stripMarkdown = (value) => {
    if (typeof value !== 'string') return '';
    let text = value;
    text = text.replace(/^#{1,6}\s+/gm, '');
    text = text.replace(/\*\*(.*?)\*\*/g, '$1');
    text = text.replace(/__(.*?)__/g, '$1');
    text = text.replace(/\*(.*?)\*/g, '$1');
    text = text.replace(/_(.*?)_/g, '$1');
    text = text.replace(/`([^`]+)`/g, '$1');
    return text;
  };

  const truncateText = (value, maxLength = 32) => {
    if (typeof value !== 'string') return '';
    if (value.length <= maxLength) return value;
    return value.slice(0, Math.max(0, maxLength - 1)).trimEnd() + '…';
  };

  const sanitizeColor = (value, fallback) => {
    if (typeof value !== 'string') return fallback;
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim()) ? value : fallback;
  };

  // Chatbot data and theme (loaded from API)
  let clinicData = null;
  let theme = {
    name: 'Assistant',
    tagline: 'How can I help you today?',
    primary: '#3b82f6',
    surface: '#ffffff',
    text: '#1e293b',
    user: '#3b82f6',
    userText: '#ffffff',
    assistant: '#ffffff',
    assistantBorder: '#e2e8f0'
  };
  let language = 'en';

  const detectLanguage = (data) => {
    const content = (data?.raw_content || '').toLowerCase();
    const url = (data?.sourceUrl || '').toLowerCase();

    if (url.includes('.sk') || url.includes('/sk/')) return 'sk';
    if (url.includes('.cz') || url.includes('/cs/') || url.includes('/cz/')) return 'cs';
    if (url.includes('.de') || url.includes('/de/')) return 'de';
    if (url.includes('.fr') || url.includes('/fr/')) return 'fr';
    if (url.includes('.es') || url.includes('/es/')) return 'es';
    if (url.includes('.it') || url.includes('/it/')) return 'it';
    if (url.includes('.pl') || url.includes('/pl/')) return 'pl';
    if (url.includes('.nl') || url.includes('/nl/')) return 'nl';
    if (url.includes('.pt') || url.includes('/pt/')) return 'pt';

    const slovakWords = ['kontakt', 'služby', 'cenník', 'objednať', 'o nás', 'úvod', 'domov', 'lekár', 'klinika'];
    const czechWords = ['služby', 'ceník', 'objednat', 'kontakt', 'úvod', 'domů', 'lékař'];
    const germanWords = ['kontakt', 'über uns', 'dienstleistungen', 'preise', 'termin', 'arzt'];

    const slovakCount = slovakWords.filter(w => content.includes(w)).length;
    const czechCount = czechWords.filter(w => content.includes(w)).length;
    const germanCount = germanWords.filter(w => content.includes(w)).length;

    if (slovakCount >= 2) return 'sk';
    if (czechCount >= 2) return 'cs';
    if (germanCount >= 2) return 'de';

    return 'en';
  };

  const getWelcomeTitle = (lang) => {
    const titles = {
      sk: 'Dobrý deň!',
      cs: 'Dobrý den!',
      de: 'Guten Tag!',
      fr: 'Bonjour !',
      es: '¡Hola!',
      it: 'Ciao!',
      pl: 'Dzień dobry!',
      nl: 'Goedendag!',
      pt: 'Olá!',
      en: 'Hi there!'
    };
    return titles[lang] || titles.en;
  };

  const getPlaceholderText = (lang) => {
    const placeholders = {
      sk: 'Napíšte správu...',
      cs: 'Napište zprávu...',
      de: 'Nachricht schreiben...',
      fr: 'Écrivez un message...',
      es: 'Escribe un mensaje...',
      it: 'Scrivi un messaggio...',
      pl: 'Napisz wiadomość...',
      nl: 'Schrijf een bericht...',
      pt: 'Escreva uma mensagem...',
      en: 'Type a message...'
    };
    return placeholders[lang] || placeholders.en;
  };

  const getWelcomeFallback = (name, lang) => {
    const messages = {
      sk: `Som AI asistent pre ${name}. Ako vám môžem pomôcť?`,
      cs: `Jsem AI asistent pro ${name}. Jak vám mohu pomoci?`,
      de: `Ich bin der KI-Assistent für ${name}. Wie kann ich Ihnen helfen?`,
      fr: `Je suis l'assistant IA de ${name}. Comment puis-je vous aider ?`,
      es: `Soy el asistente de IA de ${name}. ¿Cómo puedo ayudarte?`,
      it: `Sono l'assistente AI di ${name}. Come posso aiutarti?`,
      pl: `Jestem asystentem AI dla ${name}. Jak mogę pomóc?`,
      nl: `Ik ben de AI-assistent van ${name}. Hoe kan ik u helpen?`,
      pt: `Sou o assistente de IA da ${name}. Como posso ajudá-lo?`,
      en: `I'm the AI assistant for ${name}. How can I help you today?`
    };
    return messages[lang] || messages.en;
  };

  // Position styles
  const positionStyles = {
    'bottom-right': { bottom: '24px', right: '24px', left: 'auto' },
    'bottom-left': { bottom: '24px', left: '24px', right: 'auto' }
  };

  const pos = positionStyles[widgetPosition] || positionStyles['bottom-right'];

  // Create isolated shadow DOM
  const shadowHost = document.createElement('div');
  shadowHost.id = 'xelochat-widget';
  document.body.appendChild(shadowHost);
  const shadow = shadowHost.attachShadow({ mode: 'closed' });

  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    :host {
      all: initial;
      font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-weight: 500;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    /* ========== FAB BUTTON ========== */
    .fab {
      position: fixed;
      ${pos.bottom ? `bottom: ${pos.bottom};` : ''}
      ${pos.right ? `right: ${pos.right};` : ''}
      ${pos.left ? `left: ${pos.left};` : ''}
      width: 56px;
      height: 56px;
      border-radius: 999px;
      background: linear-gradient(145deg, var(--fab-primary, #3b82f6) 0%, var(--fab-secondary, #1e40af) 100%);
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        0 8px 32px -4px rgba(59, 130, 246, 0.5),
        0 4px 12px -2px rgba(0, 0, 0, 0.1);
      z-index: 2147483646;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .fab.hidden {
      opacity: 0;
      transform: scale(0.7) translateY(6px);
      pointer-events: none;
      visibility: hidden;
      transition: all 0.25s ease, visibility 0s linear 0.25s;
    }

    .fab:hover {
      transform: scale(1.03) translateY(-1px);
      box-shadow:
        0 12px 40px -4px rgba(59, 130, 246, 0.6),
        0 8px 20px -4px rgba(0, 0, 0, 0.15);
    }

    .fab:active {
      transform: scale(0.95);
    }

    .fab svg {
      width: 28px;
      height: 28px;
      transition: transform 0.3s ease;
    }

    .fab.spin {
      animation: fabSpin 0.5s ease-in-out;
    }

    @keyframes fabSpin {
      0% { transform: rotate(0deg) scale(1); }
      70% { transform: rotate(300deg) scale(1.05); }
      100% { transform: rotate(360deg) scale(1); }
    }

    .fab.loading {
      opacity: 0.7;
      cursor: wait;
      animation: none;
    }

    .fab.loading svg {
      animation: fabPulse 1.5s ease-in-out infinite;
    }

    @keyframes fabPulse {
      0%, 100% { opacity: 0.5; transform: scale(0.95); }
      50% { opacity: 1; transform: scale(1.05); }
    }

    /* Notification badge */
    .fab-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 20px;
      height: 20px;
      background: #ef4444;
      border-radius: 50%;
      border: 3px solid white;
      display: none;
      animation: badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .fab-badge.show {
      display: block;
    }

    @keyframes badgePop {
      0% { transform: scale(0); }
      100% { transform: scale(1); }
    }

    /* ========== CHAT PANEL ========== */
    .panel {
      --chat-primary: #3b82f6;
      --chat-surface: #ffffff;
      --chat-text: #0f172a;
      --chat-muted: #64748b;
      --chat-user: #3b82f6;
      --chat-user-text: #ffffff;
      --chat-assistant: #f8fafc;
      --chat-assistant-border: #e2e8f0;
      --chat-bg: #f1f5f9;

      position: fixed;
      ${pos.bottom ? `bottom: ${pos.bottom};` : ''}
      ${pos.right ? `right: ${pos.right};` : ''}
      ${pos.left ? `left: ${pos.left};` : ''}
      width: 420px;
      max-width: calc(100vw - 32px);
      height: min(640px, 80vh);
      max-height: calc(100vh - 48px);
      background: linear-gradient(180deg, var(--chat-surface) 0%, #f8fafc 100%);
      border-radius: 24px;
      box-shadow:
        0 0 0 1px rgba(15, 23, 42, 0.06),
        0 28px 60px -18px rgba(15, 23, 42, 0.35),
        0 10px 24px -12px rgba(15, 23, 42, 0.18);
      border: 1px solid rgba(15, 23, 42, 0.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 2147483646;
      opacity: 0;
      pointer-events: none;
      transform: translateY(16px);
      transform-origin: ${widgetPosition === 'bottom-left' ? 'bottom left' : 'bottom right'};
      transition: opacity 0.25s ease, transform 0.25s ease;
    }

    .panel.open {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    /* ========== HEADER ========== */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 20px 16px 20px;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.96) 100%);
      flex-shrink: 0;
      border-bottom: 1px solid rgba(15, 23, 42, 0.06);
    }

    .headerLeft {
      display: flex;
      align-items: center;
      gap: 14px;
      flex: 1;
      min-width: 0;
    }

    .headerAvatar {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 14px;
      background: linear-gradient(145deg, var(--chat-primary) 0%, #1d4ed8 100%);
      color: white;
      flex-shrink: 0;
      box-shadow: 0 4px 12px -2px rgba(59, 130, 246, 0.4);
    }

    .headerAvatar svg {
      width: 22px;
      height: 22px;
    }

    .headerInfo {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .headerInfo h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--chat-text);
      margin: 0;
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .headerSub {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--chat-muted);
      font-size: 13px;
      line-height: 1.3;
    }

    .statusDot {
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      animation: statusPulse 2s ease-in-out infinite;
    }

    @keyframes statusPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .headerActions {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .actionBtn {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      border: none;
      background: transparent;
      color: var(--chat-muted);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .actionBtn:hover {
      background: var(--chat-bg);
      color: var(--chat-text);
    }

    .actionBtn:active {
      transform: scale(0.92);
    }

    .actionBtn svg {
      width: 20px;
      height: 20px;
    }

    /* ========== MESSAGES AREA ========== */
    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background:
        radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 45%),
        var(--chat-bg);
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
    }

    .messages::-webkit-scrollbar {
      width: 6px;
    }
    .messages::-webkit-scrollbar-track {
      background: transparent;
    }
    .messages::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }
    .messages::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    /* Welcome state */
    .welcome {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 32px 24px;
      height: 100%;
      gap: 20px;
      animation: welcomeFade 0.5s ease-out;
    }

    @keyframes welcomeFade {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .welcomeIcon {
      width: 72px;
      height: 72px;
      border-radius: 20px;
      background: linear-gradient(145deg, var(--chat-primary) 0%, #1d4ed8 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 8px 24px -4px rgba(59, 130, 246, 0.4);
    }

    .welcomeIcon svg {
      width: 36px;
      height: 36px;
    }

    .welcomeTitle {
      font-size: 20px;
      font-weight: 700;
      color: var(--chat-text);
      line-height: 1.3;
    }

    .welcomeText {
      font-size: 15px;
      color: var(--chat-muted);
      line-height: 1.6;
      max-width: 280px;
    }

    .welcomeSuggestions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
      max-width: 280px;
      margin-top: 8px;
    }

    .suggestion {
      padding: 12px 16px;
      background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-radius: 14px;
      font-size: 14px;
      color: var(--chat-text);
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
      box-shadow: 0 8px 16px -12px rgba(15, 23, 42, 0.3);
    }

    .suggestion:hover {
      border-color: var(--chat-primary);
      background: rgba(59, 130, 246, 0.06);
      transform: translateY(-1px);
    }

    .suggestion:active {
      transform: scale(0.98);
    }

    /* Message bubbles */
    .msg {
      max-width: 85%;
      padding: 14px 18px;
      border-radius: 22px;
      font-size: 15px;
      line-height: 1.55;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .msg.new {
      animation: msgSlide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes msgSlide {
      from { opacity: 0; transform: translateY(8px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .user {
      align-self: flex-end;
      background: linear-gradient(145deg, var(--chat-user) 0%, #1d4ed8 100%);
      color: var(--chat-user-text);
      border-bottom-right-radius: 14px;
      box-shadow: 0 2px 8px -2px rgba(59, 130, 246, 0.3);
    }

    .assistant {
      align-self: flex-start;
      background: var(--chat-surface);
      color: var(--chat-text);
      border: 1px solid var(--chat-assistant-border);
      border-bottom-left-radius: 14px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .error {
      align-self: center;
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
      text-align: center;
      font-size: 14px;
      border-radius: 12px;
      padding: 12px 16px;
    }

    /* Typing indicator */
    .typing {
      display: flex;
      gap: 5px;
      padding: 4px 0;
      align-items: center;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--chat-primary);
      opacity: 0.6;
      animation: typingBounce 1.4s infinite ease-in-out;
    }

    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typingBounce {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
      40% { transform: scale(1.1); opacity: 1; }
    }

    /* ========== INPUT BAR ========== */
    .inputBar {
      display: flex;
      gap: 12px;
      padding: 16px 20px 20px 20px;
      background: var(--chat-surface);
      border-top: 1px solid rgba(15, 23, 42, 0.06);
      flex-shrink: 0;
    }

    .inputWrapper {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
    }

    .inputBar input {
      width: 100%;
      height: 48px;
      padding: 0 48px 0 18px;
      border: 2px solid rgba(15, 23, 42, 0.08);
      border-radius: 999px;
      font-size: 15px;
      font-family: inherit;
      background: var(--chat-bg);
      color: var(--chat-text);
      transition: all 0.2s ease;
    }

    .inputBar input::placeholder {
      color: #94a3b8;
    }

    .inputBar input:focus {
      outline: none;
      border-color: var(--chat-primary);
      background: var(--chat-surface);
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    .inputBar input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .send {
      position: absolute;
      right: 6px;
      width: 36px;
      height: 36px;
      border-radius: 999px;
      background: var(--chat-primary);
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .send:hover:not(:disabled) {
      background: #1d4ed8;
      transform: scale(1.05);
    }

    .send:active:not(:disabled) {
      transform: scale(0.95);
    }

    .send:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .send svg {
      width: 18px;
      height: 18px;
    }

    /* ========== FOOTER ========== */
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      background: var(--chat-bg);
      border-top: 1px solid rgba(15, 23, 42, 0.06);
      font-size: 11px;
      color: var(--chat-muted);
      gap: 12px;
    }

    .footer a {
      color: var(--chat-muted);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .footer a:hover {
      color: var(--chat-primary);
    }

    .footerLinks {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }

    .footerDivider {
      color: rgba(100, 116, 139, 0.6);
    }

    .footerBrand {
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    /* ========== BOOKING BUTTON ========== */
    .book-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 14px 24px;
      background: linear-gradient(145deg, var(--chat-primary) 0%, #1d4ed8 100%);
      color: white;
      border: none;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      margin-top: 12px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 16px -4px rgba(59, 130, 246, 0.4);
    }

    .book-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px -4px rgba(59, 130, 246, 0.5);
    }

    .book-btn:active {
      transform: scale(0.98);
    }

    .book-btn svg {
      width: 18px;
      height: 18px;
    }

    /* ========== BOOKING FORM ========== */
    .booking-form {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--chat-surface);
      display: flex;
      flex-direction: column;
      z-index: 10;
      opacity: 0;
      pointer-events: none;
      transform: translateY(100%);
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .booking-form.active {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    .booking-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: var(--chat-surface);
      border-bottom: 1px solid var(--chat-assistant-border);
      flex-shrink: 0;
    }

    .booking-header h3 {
      font-size: 17px;
      font-weight: 600;
      color: var(--chat-text);
      margin: 0;
    }

    .booking-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-size: 13px;
      font-weight: 600;
      color: var(--chat-text);
    }

    .form-group label .required {
      color: #ef4444;
      margin-left: 2px;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      padding: 12px 14px;
      border: 2px solid var(--chat-assistant-border);
      border-radius: 12px;
      font-size: 15px;
      font-family: inherit;
      background: var(--chat-bg);
      color: var(--chat-text);
      transition: all 0.2s ease;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--chat-primary);
      background: var(--chat-surface);
    }

    .form-group input::placeholder,
    .form-group textarea::placeholder {
      color: #94a3b8;
    }

    .form-group textarea {
      resize: vertical;
      min-height: 80px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .booking-footer {
      display: flex;
      gap: 12px;
      padding: 20px;
      background: var(--chat-bg);
      border-top: 1px solid var(--chat-assistant-border);
      flex-shrink: 0;
    }

    .booking-footer button {
      flex: 1;
      padding: 14px 20px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-cancel {
      background: transparent;
      border: 2px solid var(--chat-assistant-border);
      color: var(--chat-text);
    }

    .btn-cancel:hover {
      background: var(--chat-bg);
      border-color: var(--chat-muted);
    }

    .btn-submit {
      background: linear-gradient(145deg, var(--chat-primary) 0%, #1d4ed8 100%);
      border: none;
      color: white;
      box-shadow: 0 4px 12px -4px rgba(59, 130, 246, 0.4);
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px -4px rgba(59, 130, 246, 0.5);
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* ========== MINIMAL STYLE ========== */
    .panel.minimal {
      width: 360px;
      height: min(520px, 70vh);
    }

    .panel.minimal .header {
      padding: 14px 16px 12px 16px;
    }

    .panel.minimal .headerAvatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
    }

    .panel.minimal .headerAvatar svg {
      width: 18px;
      height: 18px;
    }

    .panel.minimal .headerInfo h3 {
      font-size: 14px;
      max-width: 100%;
    }

    .panel.minimal .headerSub {
      font-size: 12px;
    }

    .panel.minimal .messages {
      padding: 14px;
      gap: 10px;
    }

    .panel.minimal .msg {
      padding: 10px 14px;
      font-size: 14px;
      border-radius: 14px;
    }

    .panel.minimal .inputBar {
      padding: 12px 14px 14px 14px;
    }

    .panel.minimal .inputBar input {
      height: 42px;
      font-size: 14px;
      padding: 0 42px 0 14px;
      border-radius: 999px;
    }

    .panel.minimal .send {
      width: 32px;
      height: 32px;
      border-radius: 999px;
    }

    .panel.minimal .welcomeIcon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
    }

    .panel.minimal .welcomeIcon svg {
      width: 28px;
      height: 28px;
    }

    .panel.minimal .welcomeTitle {
      font-size: 17px;
    }

    .panel.minimal .welcomeText {
      font-size: 14px;
    }

    .panel.minimal .suggestion {
      padding: 10px 14px;
      font-size: 13px;
    }

    .panel.minimal .footer {
      padding: 10px 14px;
      font-size: 10px;
    }

    .fab.minimal {
      width: 48px;
      height: 48px;
      border-radius: 999px;
    }

    .fab.minimal svg {
      width: 24px;
      height: 24px;
    }

    /* ========== EMBEDDED STYLE ========== */
    .panel.embedded {
      position: relative;
      width: 100%;
      height: 100%;
      max-width: none;
      max-height: none;
      border-radius: 16px;
      box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.08), 0 8px 20px -12px rgba(15, 23, 42, 0.28);
      opacity: 1;
      pointer-events: auto;
      transform: none;
    }

    .fab.embedded {
      display: none;
    }

    /* ========== MOBILE RESPONSIVE ========== */
    @media (max-width: 480px) {
      .panel:not(.embedded) {
        bottom: 0;
        right: 0;
        left: 0;
        width: 100%;
        max-width: none;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
        transform-origin: bottom center;
      }

      .panel.open:not(.embedded) {
        border-radius: 0;
      }

      .fab:not(.embedded) {
        bottom: 20px;
        right: 20px;
        left: auto;
        width: 54px;
        height: 54px;
        border-radius: 999px;
      }

      .header {
        padding: 16px;
      }

      .messages {
        padding: 16px;
      }

      .inputBar {
        padding: 12px 16px 16px 16px;
      }

      .footer {
        flex-direction: column;
        gap: 6px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `;

  const fab = document.createElement('button');
  fab.className = `fab loading${widgetStyle === 'minimal' ? ' minimal' : ''}${widgetStyle === 'embedded' ? ' embedded' : ''}`;
  fab.type = 'button';
  fab.setAttribute('aria-label', 'Open chat');
  fab.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3C6.5 3 2 6.8 2 11.5c0 2.4 1.2 4.6 3.1 6.1l-.6 3.9 4.3-2.2c1 .3 2.1.4 3.2.4 5.5 0 10-3.8 10-8.5S17.5 3 12 3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    </svg>
    <span class="fab-badge"></span>
  `;

  const panel = document.createElement('div');
  panel.className = `panel${widgetStyle === 'minimal' ? ' minimal' : ''}${widgetStyle === 'embedded' ? ' embedded' : ''}`;
  panel.innerHTML = `
    <header class="header">
      <div class="headerLeft">
        <div class="headerAvatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 3C6.5 3 2 6.8 2 11.5c0 2.4 1.2 4.6 3.1 6.1l-.6 3.9 4.3-2.2c1 .3 2.1.4 3.2.4 5.5 0 10-3.8 10-8.5S17.5 3 12 3z" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="headerInfo">
          <h3 class="header-name">Loading...</h3>
          <div class="headerSub">
            <span class="statusDot"></span>
            <span class="header-tagline">Online</span>
          </div>
        </div>
      </div>
      <div class="headerActions">
        <button class="actionBtn minimize" aria-label="Close chat" title="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </header>
    <div class="messages">
      <div class="welcome">
        <div class="welcomeIcon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 3C6.5 3 2 6.8 2 11.5c0 2.4 1.2 4.6 3.1 6.1l-.6 3.9 4.3-2.2c1 .3 2.1.4 3.2.4 5.5 0 10-3.8 10-8.5S17.5 3 12 3z" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="welcomeTitle">Welcome!</div>
        <div class="welcomeText">Loading your assistant...</div>
      </div>
    </div>
    <div class="inputBar">
      <div class="inputWrapper">
        <input type="text" placeholder="Type your message..." autocomplete="off" disabled />
        <button class="send" aria-label="Send" disabled>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
    <div class="footer">
      <div class="footerLinks">
        <a href="https://xelochat.com/terms" target="_blank" rel="noopener">Terms</a>
        <span class="footerDivider">•</span>
        <a href="https://xelochat.com/privacy" target="_blank" rel="noopener">Privacy</a>
      </div>
      <span class="footerBrand">Powered by <a href="https://xelochat.com" target="_blank" rel="noopener">XeloChat</a></span>
    </div>

    <!-- Booking Form -->
    <div class="booking-form" id="bookingForm">
      <div class="booking-header">
        <h3>Book an Appointment</h3>
        <button class="actionBtn booking-close" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="booking-body">
        <div class="form-group">
          <label for="booking-name">Your Name <span class="required">*</span></label>
          <input type="text" id="booking-name" placeholder="Enter your name" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="booking-email">Email</label>
            <input type="email" id="booking-email" placeholder="you@example.com" />
          </div>
          <div class="form-group">
            <label for="booking-phone">Phone</label>
            <input type="tel" id="booking-phone" placeholder="+1234567890" />
          </div>
        </div>
        <div class="form-group">
          <label for="booking-service">Service</label>
          <input type="text" id="booking-service" placeholder="What service do you need?" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="booking-date">Preferred Date</label>
            <input type="date" id="booking-date" />
          </div>
          <div class="form-group">
            <label for="booking-time">Preferred Time</label>
            <input type="time" id="booking-time" />
          </div>
        </div>
        <div class="form-group">
          <label for="booking-notes">Additional Notes</label>
          <textarea id="booking-notes" placeholder="Anything else we should know?" rows="3"></textarea>
        </div>
      </div>
      <div class="booking-footer">
        <button class="btn-cancel" type="button">Cancel</button>
        <button class="btn-submit" type="button">Submit Request</button>
      </div>
    </div>
  `;

  // For embedded mode, insert into target container instead of body
  if (widgetStyle === 'embedded' && targetContainer) {
    const container = document.querySelector(targetContainer);
    if (container) {
      container.appendChild(shadowHost);
      shadow.append(style, panel); // No FAB needed for embedded
      panel.classList.add('open'); // Always visible in embedded mode
    } else {
      console.warn('[XeloChat] Target container not found:', targetContainer);
      document.body.appendChild(shadowHost);
      shadow.append(style, fab, panel);
    }
  } else {
    shadow.append(style, fab, panel);
  }

  const messagesEl = panel.querySelector('.messages');
  const inputEl = panel.querySelector('input');
  const sendBtn = panel.querySelector('.send');
  const minimizeBtn = panel.querySelector('.minimize');
  const headerName = panel.querySelector('.header-name');
  const headerTagline = panel.querySelector('.header-tagline');
  const welcomeEl = panel.querySelector('.welcome');
  const welcomeTitle = panel.querySelector('.welcomeTitle');
  const welcomeText = panel.querySelector('.welcomeText');

  const setHeaderName = (rawName) => {
    const safeName = sanitize(rawName || 'Assistant');
    const truncated = truncateText(safeName, 32);
    if (headerName) {
      headerName.textContent = truncated;
      headerName.title = safeName;
    }
  };

  // Booking form elements
  const bookingForm = panel.querySelector('#bookingForm');
  const bookingCloseBtn = panel.querySelector('.booking-close');
  const bookingCancelBtn = panel.querySelector('.btn-cancel');
  const bookingSubmitBtn = panel.querySelector('.btn-submit');
  const bookingNameInput = panel.querySelector('#booking-name');
  const bookingEmailInput = panel.querySelector('#booking-email');
  const bookingPhoneInput = panel.querySelector('#booking-phone');
  const bookingServiceInput = panel.querySelector('#booking-service');
  const bookingDateInput = panel.querySelector('#booking-date');
  const bookingTimeInput = panel.querySelector('#booking-time');
  const bookingNotesInput = panel.querySelector('#booking-notes');

  let open = false;
  let loading = false;
  let initialized = false;
  let bookingEnabled = true;
  let bookingFields = ['name', 'email', 'preferredDate', 'preferredTime'];
  let showingWelcome = true;
  let suggestions = [];
  const messages = [];
  let lastRenderedCount = 0;

  const scrollToBottom = () => {
    if (messagesEl) {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  };

  const hideWelcome = () => {
    if (welcomeEl && showingWelcome) {
      welcomeEl.style.display = 'none';
      showingWelcome = false;
    }
  };

  const renderMessages = () => {
    if (!messagesEl) return;

    if (messages.length === 0 && showingWelcome) {
      return; // Keep showing welcome
    }

    hideWelcome();
    messagesEl.innerHTML = '';

    const shouldAnimateLast = messages.length > lastRenderedCount;
    messages.forEach((m, index) => {
      const div = document.createElement('div');
      const isLast = index === messages.length - 1;
      const animateClass = shouldAnimateLast && isLast ? ' new' : '';
      div.className = `msg ${m.role}${animateClass}`;
      div.innerHTML = m.content;
      messagesEl.appendChild(div);
    });

    if (loading) {
      const div = document.createElement('div');
      div.className = 'msg assistant';
      div.innerHTML = '<div class="typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
      messagesEl.appendChild(div);
    }

    scrollToBottom();
    lastRenderedCount = messages.length;
  };

  const showError = (message) => {
    hideWelcome();
    const div = document.createElement('div');
    div.className = 'msg error';
    div.textContent = message;
    messagesEl?.appendChild(div);
    scrollToBottom();
  };

  // Booking functions
  const showBookingForm = () => {
    if (bookingForm) {
      bookingForm.classList.add('active');
      bookingNameInput?.focus();
    }
  };

  const hideBookingForm = () => {
    if (bookingForm) {
      bookingForm.classList.remove('active');
    }
  };

  const clearBookingForm = () => {
    if (bookingNameInput) bookingNameInput.value = '';
    if (bookingEmailInput) bookingEmailInput.value = '';
    if (bookingPhoneInput) bookingPhoneInput.value = '';
    if (bookingServiceInput) bookingServiceInput.value = '';
    if (bookingDateInput) bookingDateInput.value = '';
    if (bookingTimeInput) bookingTimeInput.value = '';
    if (bookingNotesInput) bookingNotesInput.value = '';
  };

  const prefillBookingForm = (data) => {
    if (data.customerName && bookingNameInput) bookingNameInput.value = data.customerName;
    if (data.customerEmail && bookingEmailInput) bookingEmailInput.value = data.customerEmail;
    if (data.customerPhone && bookingPhoneInput) bookingPhoneInput.value = data.customerPhone;
    if (data.service && bookingServiceInput) bookingServiceInput.value = data.service;
    if (data.preferredDate && bookingDateInput) bookingDateInput.value = data.preferredDate;
    if (data.preferredTime && bookingTimeInput) bookingTimeInput.value = data.preferredTime;
    if (data.notes && bookingNotesInput) bookingNotesInput.value = data.notes;
  };

  const submitBooking = async () => {
    const name = bookingNameInput?.value?.trim();
    const email = bookingEmailInput?.value?.trim();
    const phone = bookingPhoneInput?.value?.trim();

    if (!name) {
      bookingNameInput?.focus();
      return;
    }

    if (!email && !phone) {
      bookingEmailInput?.focus();
      return;
    }

    if (bookingSubmitBtn) {
      bookingSubmitBtn.disabled = true;
      bookingSubmitBtn.textContent = 'Submitting...';
    }

    try {
      const bookingData = {
        customerName: name,
        customerEmail: email || null,
        customerPhone: phone || null,
        service: bookingServiceInput?.value?.trim() || null,
        preferredDate: bookingDateInput?.value || null,
        preferredTime: bookingTimeInput?.value || null,
        notes: bookingNotesInput?.value?.trim() || null
      };

      const res = await fetch(`${apiBase}/api/widget/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({
          chatbotId,
          sessionId,
          bookingData
        })
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Booking failed' }));
        throw new Error(error.error || 'Booking failed');
      }

      hideBookingForm();
      clearBookingForm();

      messages.push({
        role: 'assistant',
        content: "Thank you! Your booking request has been submitted. We'll be in touch shortly to confirm your appointment."
      });
      renderMessages();

    } catch (err) {
      console.error('[XeloChat] Booking failed:', err);
      messages.push({
        role: 'assistant',
        content: 'Sorry, there was an error submitting your booking. Please try again or contact us directly.'
      });
      hideBookingForm();
      renderMessages();
    } finally {
      if (bookingSubmitBtn) {
        bookingSubmitBtn.disabled = false;
        bookingSubmitBtn.textContent = 'Submit Request';
      }
    }
  };

  const updateBookingFormFields = () => {
    const fieldMap = {
      'name': bookingNameInput?.parentElement,
      'email': bookingEmailInput?.parentElement,
      'phone': bookingPhoneInput?.parentElement,
      'service': bookingServiceInput?.parentElement,
      'preferredDate': bookingDateInput?.parentElement,
      'preferredTime': bookingTimeInput?.parentElement,
      'notes': bookingNotesInput?.parentElement
    };

    Object.entries(fieldMap).forEach(([field, element]) => {
      if (element) {
        element.style.display = bookingFields.includes(field) ? 'flex' : 'none';
      }
    });
  };

  const addBookingButton = () => {
    if (!bookingEnabled || !messagesEl) return;
    updateBookingFormFields();

    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'padding: 4px 0 8px 0;';
    btnContainer.innerHTML = `
      <button class="book-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        Book Appointment
      </button>
    `;
    messagesEl.appendChild(btnContainer);

    const btn = btnContainer.querySelector('.book-btn');
    if (btn) {
      btn.addEventListener('click', showBookingForm);
    }
    scrollToBottom();
  };

  bookingCloseBtn?.addEventListener('click', hideBookingForm);
  bookingCancelBtn?.addEventListener('click', hideBookingForm);
  bookingSubmitBtn?.addEventListener('click', submitBooking);

  const applyTheme = (themeData) => {
    if (!themeData) return;

    theme = {
      name: sanitize(themeData.name || clinicData?.clinic_name || 'Assistant'),
      tagline: sanitize(themeData.tagline || 'How can I help you?'),
      primary: sanitizeColor(themeData.primaryColor, '#3b82f6'),
      surface: sanitizeColor(themeData.backgroundColor, '#ffffff'),
      text: sanitizeColor(themeData.textColor, '#1e293b'),
      user: sanitizeColor(themeData.userBubbleColor, '#3b82f6'),
      userText: sanitizeColor(themeData.backgroundColor, '#ffffff'),
      assistant: sanitizeColor(themeData.assistantBubbleColor, '#ffffff'),
      assistantBorder: '#e2e8f0'
    };

    panel.style.setProperty('--chat-primary', theme.primary);
    panel.style.setProperty('--chat-surface', theme.surface);
    panel.style.setProperty('--chat-text', theme.text);
    panel.style.setProperty('--chat-user', theme.user);
    panel.style.setProperty('--chat-user-text', theme.userText);
    panel.style.setProperty('--chat-assistant', theme.assistant);
    fab.style.setProperty('--fab-primary', theme.primary);

    setHeaderName(theme.name);
  };

  const shouldDisplayOnPage = (displayMode, patterns) => {
    if (displayMode === 'ALL' || !patterns || patterns.length === 0) {
      return true;
    }

    const currentPath = window.location.pathname;

    const matchesPattern = (pattern) => {
      if (!pattern.includes('*')) {
        const normalized = pattern.replace(/\/+$/, '');
        const normalizedPath = currentPath.replace(/\/+$/, '');
        return normalizedPath === normalized || currentPath.startsWith(normalized + '/');
      }
      const regexPattern = pattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
      return new RegExp(`^${regexPattern}$`).test(currentPath);
    };

    const anyMatch = patterns.some(matchesPattern);

    if (displayMode === 'INCLUDE') {
      return anyMatch;
    } else if (displayMode === 'EXCLUDE') {
      return !anyMatch;
    }

    return true;
  };

  // Generate suggestions based on available data
  const generateSuggestions = (data, lang) => {
    const t = {
      services: {
        sk: 'Aké služby ponúkate?',
        cs: 'Jaké služby nabízíte?',
        de: 'Welche Dienstleistungen bieten Sie an?',
        fr: 'Quels services proposez-vous ?',
        es: '¿Qué servicios ofrecen?',
        it: 'Quali servizi offrite?',
        pl: 'Jakie usługi oferujecie?',
        nl: 'Welke diensten biedt u aan?',
        pt: 'Que serviços vocês oferecem?',
        en: 'What services do you offer?'
      },
      hours: {
        sk: 'Aké sú vaše otváracie hodiny?',
        cs: 'Jaké jsou vaše otevírací hodiny?',
        de: 'Wie sind Ihre Öffnungszeiten?',
        fr: 'Quels sont vos horaires d\'ouverture ?',
        es: '¿Cuáles son sus horarios de apertura?',
        it: 'Quali sono i vostri orari di apertura?',
        pl: 'Jakie są wasze godziny otwarcia?',
        nl: 'Wat zijn jullie openingstijden?',
        pt: 'Quais são os seus horários de funcionamento?',
        en: 'What are your opening hours?'
      },
      contact: {
        sk: 'Ako vás môžem kontaktovať?',
        cs: 'Jak vás mohu kontaktovat?',
        de: 'Wie kann ich Sie kontaktieren?',
        fr: 'Comment puis-je vous contacter ?',
        es: '¿Cómo puedo contactarlos?',
        it: 'Come posso contattarvi?',
        pl: 'Jak mogę się z wami skontaktować?',
        nl: 'Hoe kan ik contact met jullie opnemen?',
        pt: 'Como posso entrar em contato?',
        en: 'How can I contact you?'
      },
      booking: {
        sk: 'Chcel/a by som sa objednať',
        cs: 'Chtěl/a bych se objednat',
        de: 'Ich möchte einen Termin buchen',
        fr: 'Je souhaite prendre rendez-vous',
        es: 'Me gustaría reservar una cita',
        it: 'Vorrei prenotare un appuntamento',
        pl: 'Chciałbym/Chciałabym umówić wizytę',
        nl: 'Ik wil graag een afspraak maken',
        pt: 'Gostaria de marcar uma consulta',
        en: 'I\'d like to book an appointment'
      }
    };

    const s = [];
    if (data.services?.length > 0) {
      s.push(t.services[lang] || t.services.en);
    }
    if (data.opening_hours) {
      s.push(t.hours[lang] || t.hours.en);
    }
    if (data.phone || data.email) {
      s.push(t.contact[lang] || t.contact.en);
    }
    if (bookingEnabled) {
      s.push(t.booking[lang] || t.booking.en);
    }
    return s.slice(0, 3);
  };

  const renderWelcome = (name, message, suggestionList, lang) => {
    if (welcomeTitle) welcomeTitle.textContent = getWelcomeTitle(lang);
    if (welcomeText) welcomeText.textContent = message || getWelcomeFallback(name, lang);

    // Add suggestions
    if (suggestionList && suggestionList.length > 0 && welcomeEl) {
      let suggestionsContainer = welcomeEl.querySelector('.welcomeSuggestions');
      if (!suggestionsContainer) {
        suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'welcomeSuggestions';
        welcomeEl.appendChild(suggestionsContainer);
      }

      suggestionsContainer.innerHTML = suggestionList.map(s =>
        `<button class="suggestion">${sanitize(s)}</button>`
      ).join('');

      suggestionsContainer.querySelectorAll('.suggestion').forEach((btn, i) => {
        btn.addEventListener('click', () => {
          if (inputEl) {
            inputEl.value = suggestionList[i];
            sendMessage();
          }
        });
      });
    }
  };

  const loadChatbot = async () => {
    try {
      const response = await fetch(`${apiBase}/api/widget/chatbot/${chatbotId}`, {
        headers: { 'X-API-Key': apiKey }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to load chatbot' }));
        throw new Error(error.error || 'Failed to load chatbot');
      }

      const data = await response.json();

      const pageDisplayMode = data.pageDisplayMode || 'ALL';
      const allowedPages = data.allowedPages || [];

      if (!shouldDisplayOnPage(pageDisplayMode, allowedPages)) {
        shadowHost.remove();
        return;
      }

      clinicData = data.clinicData;
      bookingEnabled = data.bookingEnabled !== false;
      bookingFields = data.bookingFields || ['name', 'email', 'preferredDate', 'preferredTime'];

      language = (data.language && data.language !== 'auto') ? data.language : detectLanguage(clinicData);

      applyTheme(data.theme);

      const businessName = clinicData?.clinic_name || 'our business';
      setHeaderName(businessName);

      suggestions = generateSuggestions(clinicData || {}, language);

      const welcomeMsg = clinicData?.welcomeMessage || '';
      renderWelcome(businessName, welcomeMsg, suggestions, language);

      if (bookingEnabled) {
        updateBookingFormFields();
      }

      if (inputEl) {
        inputEl.disabled = false;
        inputEl.placeholder = getPlaceholderText(language);
      }
      if (sendBtn) sendBtn.disabled = false;
      fab.classList.remove('loading');
      initialized = true;

    } catch (err) {
      console.error('[XeloChat] Failed to load chatbot:', err);
      fab.classList.remove('loading');
      if (welcomeText) welcomeText.textContent = 'Failed to load. Please refresh.';
    }
  };

  const openPanel = () => {
    if (widgetStyle === 'embedded') return; // Always open in embedded mode
    open = true;
    panel.classList.add('open');
    fab.classList.add('spin');
    setTimeout(() => {
      fab.classList.add('hidden');
    }, 120);

    if (isFirstOpen()) {
      markAsOpened();
    }

    setTimeout(() => {
      if (initialized && !showingWelcome) inputEl?.focus();
    }, 100);
    setTimeout(() => {
      fab.classList.remove('spin');
    }, 500);
  };

  const closePanel = () => {
    if (widgetStyle === 'embedded') return; // Cannot close in embedded mode
    open = false;
    panel.classList.remove('open');
    fab.classList.remove('hidden');
  };

  // Don't add FAB event listener for embedded mode
  if (widgetStyle !== 'embedded') {
    fab.addEventListener('click', openPanel);
    minimizeBtn?.addEventListener('click', closePanel);
  } else {
    // Hide minimize button in embedded mode
    if (minimizeBtn) minimizeBtn.style.display = 'none';
  }

  const sendMessage = async () => {
    if (!inputEl || !sendBtn || !initialized) return;
    const content = inputEl.value.trim();
    if (!content || loading) return;

    hideWelcome();
    messages.push({ role: 'user', content: sanitize(content) });
    inputEl.value = '';
    renderMessages();

    loading = true;
    sendBtn.disabled = true;
    renderMessages();

    let pendingBookingButton = false;
    let pendingBookingAutoSubmit = null;

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
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content })).slice(-10),
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

            if (data.toolCall === 'show_booking_form' && bookingEnabled) {
              pendingBookingButton = true;
            }

            if (data.bookingSubmitted && data.bookingData) {
              pendingBookingAutoSubmit = data.bookingData;
            }
          } catch {
            // Ignore malformed chunks
          }
        }
      }

      if (assistantText) {
        messages.push({ role: 'assistant', content: sanitize(stripMarkdown(assistantText)) });
      }
    } catch (err) {
      console.error('[XeloChat] Send failed:', err);

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

      if (pendingBookingButton) {
        setTimeout(addBookingButton, 50);
      }
      if (pendingBookingAutoSubmit) {
        prefillBookingForm(pendingBookingAutoSubmit);
        setTimeout(showBookingForm, 500);
      }

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

  loadChatbot();
})();
