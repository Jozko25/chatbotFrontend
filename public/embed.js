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
    primary: '#3b82f6',
    surface: '#ffffff',
    text: '#1e293b',
    user: '#3b82f6',
    userText: '#ffffff',
    assistant: '#ffffff',
    assistantBorder: '#e2e8f0'
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
      width: 60px;
      height: 60px;
      border-radius: 16px;
      border: 1px solid #dbeafe;
      background: #3b82f6;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.16);
      z-index: 2147483646;
      transition: background 0.15s ease,
                  opacity 0.3s cubic-bezier(0.32, 0.72, 0, 1),
                  transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .fab:hover {
      background: #2563eb;
    }

    .fab svg {
      width: 24px;
      height: 24px;
    }

    .fab.hidden {
      opacity: 0;
      transform: scale(0.85);
      pointer-events: none;
    }

    .fab.loading {
      opacity: 0.6;
      cursor: wait;
    }

    .panel {
      --chat-primary: #3b82f6;
      --chat-surface: #ffffff;
      --chat-text: #1e293b;
      --chat-muted: #64748b;
      --chat-user: #3b82f6;
      --chat-user-text: #ffffff;
      --chat-assistant: #ffffff;
      --chat-assistant-border: #e2e8f0;
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 420px;
      max-width: calc(100vw - 48px);
      height: min(600px, 80vh);
      max-height: calc(100vh - 48px);
      background: var(--chat-surface);
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(15, 23, 42, 0.16);
      border: 1px solid var(--chat-assistant-border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 2147483646;
      opacity: 0;
      pointer-events: none;
      transform: translateY(20px) scale(0.92);
      transform-origin: bottom right;
      transition: opacity 0.4s cubic-bezier(0.32, 0.72, 0, 1),
                  transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .panel.open {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 20px;
      background: var(--chat-surface);
      border-bottom: 1px solid var(--chat-assistant-border);
      flex-shrink: 0;
    }

    .headerInfo h3 {
      font-size: 15px;
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
      gap: 6px;
    }

    .actionBtn {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      border: none;
      background: transparent;
      color: var(--chat-muted);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .actionBtn:hover {
      background: #eff6ff;
      color: #3b82f6;
    }

    .actionBtn svg {
      width: 18px;
      height: 18px;
    }

    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 16px;
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

    .msg {
      max-width: 85%;
      padding: 14px 18px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.6;
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
      border-radius: 12px;
    }

    .inputBar {
      display: flex;
      gap: 12px;
      padding: 18px 20px;
      background: var(--chat-surface);
      border-top: 1px solid var(--chat-assistant-border);
      flex-shrink: 0;
    }

    .inputBar input {
      flex: 1;
      height: 44px;
      padding: 0 18px;
      border: 1px solid var(--chat-assistant-border);
      border-radius: 100px;
      font-size: 14px;
      font-family: inherit;
      background: #f8fafc;
      color: var(--chat-text);
    }

    .inputBar input::placeholder {
      color: var(--chat-muted);
    }

    .inputBar input:focus {
      outline: none;
      border-color: #3b82f6;
      background: var(--chat-surface);
    }

    .send {
      width: 44px;
      height: 44px;
      border-radius: 100px;
      background: var(--chat-user);
      border: 1px solid var(--chat-user);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.15s ease, border-color 0.15s ease;
    }

    .send:hover:not(:disabled) {
      background: #2563eb;
      border-color: #2563eb;
    }

    .send:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      transform: none;
    }

    .send svg {
      width: 18px;
      height: 18px;
    }

    .typing {
      display: flex;
      gap: 5px;
      padding: 6px 0;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #93c5fd;
      opacity: 0.9;
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
        border-radius: 16px;
      }
      .fab {
        bottom: 16px;
        right: 16px;
        width: 56px;
        height: 56px;
        border-radius: 16px;
      }
    }

    /* Booking Form Styles */
    .booking-form {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--chat-surface);
      display: none;
      flex-direction: column;
      z-index: 10;
    }

    .booking-form.active {
      display: flex;
    }

    .booking-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 20px;
      background: var(--chat-surface);
      border-bottom: 1px solid var(--chat-assistant-border);
      flex-shrink: 0;
    }

    .booking-header h3 {
      font-size: 15px;
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
      font-size: 12px;
      font-weight: 600;
      color: var(--chat-text);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .form-group label .required {
      color: #dc2626;
      margin-left: 2px;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      padding: 12px 14px;
      border: 1px solid var(--chat-assistant-border);
      border-radius: 10px;
      font-size: 14px;
      font-family: inherit;
      background: #f8fafc;
      color: var(--chat-text);
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: #3b82f6;
      background: var(--chat-surface);
    }

    .form-group input::placeholder,
    .form-group textarea::placeholder {
      color: var(--chat-muted);
    }

    .form-group textarea {
      resize: vertical;
      min-height: 70px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .booking-footer {
      display: flex;
      gap: 12px;
      padding: 18px 20px;
      background: #f8fafc;
      border-top: 1px solid var(--chat-assistant-border);
      flex-shrink: 0;
    }

    .booking-footer button {
      flex: 1;
      padding: 12px 18px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
    }

    .btn-cancel {
      background: transparent;
      border: 1px solid var(--chat-assistant-border);
      color: var(--chat-text);
    }

    .btn-cancel:hover {
      background: #f8fafc;
    }

    .btn-submit {
      background: var(--chat-primary);
      border: 1px solid var(--chat-primary);
      color: white;
    }

    .btn-submit:hover:not(:disabled) {
      background: #2563eb;
      border-color: #2563eb;
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .booking-success {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px 20px;
      gap: 16px;
    }

    .booking-success svg {
      width: 56px;
      height: 56px;
      color: #22c55e;
    }

    .booking-success h4 {
      font-size: 18px;
      font-weight: 600;
      color: var(--chat-text);
      margin: 0;
    }

    .booking-success p {
      font-size: 14px;
      color: var(--chat-muted);
      margin: 0;
    }

    .book-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: var(--chat-primary);
      color: white;
      border: 1px solid var(--chat-primary);
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 10px;
      transition: background 0.15s ease, border-color 0.15s ease;
    }

    .book-btn:hover {
      background: #2563eb;
      border-color: #2563eb;
    }

    .book-btn svg {
      width: 16px;
      height: 16px;
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
    
    <!-- Booking Form Overlay -->
    <div class="booking-form" id="bookingForm">
      <div class="booking-header">
        <h3>Complete Your Booking</h3>
        <button class="actionBtn booking-close" aria-label="Close booking form">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="booking-body">
        <div class="form-group">
          <label for="booking-name">Full Name <span class="required">*</span></label>
          <input type="text" id="booking-name" placeholder="Your name" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="booking-email">Email</label>
            <input type="email" id="booking-email" placeholder="your@email.com" />
          </div>
          <div class="form-group">
            <label for="booking-phone">Phone</label>
            <input type="tel" id="booking-phone" placeholder="+421..." />
          </div>
        </div>
        <div class="form-group">
          <label for="booking-service">Service</label>
          <input type="text" id="booking-service" placeholder="Desired service" />
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
          <textarea id="booking-notes" placeholder="Any special requests or notes..." rows="3"></textarea>
        </div>
      </div>
      <div class="booking-footer">
        <button class="btn-cancel" type="button">Back to Chat</button>
        <button class="btn-submit" type="button">Submit Booking</button>
      </div>
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
  let bookingFields = ['name', 'email', 'phone', 'service', 'preferredDate', 'preferredTime', 'notes'];
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

  // Booking form functions
  const showBookingForm = () => {
    if (bookingForm) {
      bookingForm.classList.add('active');
      // Focus the first input
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
    
    // Validate required fields - name is always required
    if (bookingFields.includes('name') && !name) {
      bookingNameInput?.focus();
      return;
    }
    
    // Need at least email or phone if either is configured
    const needsEmail = bookingFields.includes('email');
    const needsPhone = bookingFields.includes('phone');
    if ((needsEmail || needsPhone) && !email && !phone) {
      if (needsEmail) {
        bookingEmailInput?.focus();
      } else {
        bookingPhoneInput?.focus();
      }
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

      // Show success message in chat
      hideBookingForm();
      clearBookingForm();
      messages.push({ 
        role: 'assistant', 
        content: 'Your booking request has been submitted successfully! We will contact you shortly to confirm.' 
      });
      renderMessages();

    } catch (err) {
      console.error('[SiteBot] Booking failed:', err);
      messages.push({ 
        role: 'assistant', 
        content: 'Sorry, there was an error submitting your booking. Please try again or contact us directly.' 
      });
      hideBookingForm();
      renderMessages();
    } finally {
      if (bookingSubmitBtn) {
        bookingSubmitBtn.disabled = false;
        bookingSubmitBtn.textContent = 'Submit Booking';
      }
    }
  };

  // Update booking form to show only configured fields
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

    // Show/hide fields based on config
    Object.entries(fieldMap).forEach(([field, element]) => {
      if (element) {
        element.style.display = bookingFields.includes(field) ? 'flex' : 'none';
      }
    });
    
    // Handle row layout for date/time
    const dateTimeRow = bookingDateInput?.parentElement?.parentElement;
    if (dateTimeRow && dateTimeRow.classList.contains('form-row')) {
      const showDate = bookingFields.includes('preferredDate');
      const showTime = bookingFields.includes('preferredTime');
      if (!showDate && !showTime) {
        dateTimeRow.style.display = 'none';
      } else {
        dateTimeRow.style.display = 'grid';
      }
    }
    
    // Handle row layout for email/phone
    const emailPhoneRow = bookingEmailInput?.parentElement?.parentElement;
    if (emailPhoneRow && emailPhoneRow.classList.contains('form-row')) {
      const showEmail = bookingFields.includes('email');
      const showPhone = bookingFields.includes('phone');
      if (!showEmail && !showPhone) {
        emailPhoneRow.style.display = 'none';
      } else {
        emailPhoneRow.style.display = 'grid';
      }
    }
  };

  // Add "Book Now" button to messages area
  const addBookingButton = () => {
    if (!bookingEnabled || !messagesEl) return;
    
    const existingBtn = messagesEl.querySelector('.book-btn');
    if (existingBtn) return; // Already exists
    
    // Update form fields visibility
    updateBookingFormFields();
    
    const btnContainer = document.createElement('div');
    btnContainer.style.alignSelf = 'flex-start';
    btnContainer.innerHTML = `
      <button class="book-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        Book Appointment
      </button>
    `;
    messagesEl.appendChild(btnContainer);
    
    btnContainer.querySelector('.book-btn')?.addEventListener('click', () => {
      showBookingForm();
    });
    
    scrollToBottom();
  };

  // Booking form event listeners
  bookingCloseBtn?.addEventListener('click', hideBookingForm);
  bookingCancelBtn?.addEventListener('click', hideBookingForm);
  bookingSubmitBtn?.addEventListener('click', submitBooking);

  const applyTheme = (themeData) => {
    if (!themeData) return;

    theme = {
      name: sanitize(themeData.name || clinicData?.clinic_name || 'Assistant'),
      tagline: sanitize(themeData.tagline || 'AI-powered assistant'),
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

  // Check if current page matches the display restrictions
  const shouldDisplayOnPage = (displayMode, patterns) => {
    if (displayMode === 'ALL' || !patterns || patterns.length === 0) {
      return true;
    }
    
    const currentPath = window.location.pathname;
    
    // Convert patterns to regex and check
    const matchesPattern = (pattern) => {
      // Convert wildcard pattern to regex
      // /blog/* -> /blog/.*
      // /contact -> /contact (exact)
      const regexPattern = pattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars except *
        .replace(/\*/g, '.*'); // Convert * to .*
      
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(currentPath);
    };
    
    const anyMatch = patterns.some(matchesPattern);
    
    if (displayMode === 'INCLUDE') {
      // Only show on matching pages
      return anyMatch;
    } else if (displayMode === 'EXCLUDE') {
      // Show on all pages except matching ones
      return !anyMatch;
    }
    
    return true;
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
      
      // Check page display restrictions FIRST
      const pageDisplayMode = data.pageDisplayMode || 'ALL';
      const allowedPages = data.allowedPages || [];
      
      if (!shouldDisplayOnPage(pageDisplayMode, allowedPages)) {
        // Don't show widget on this page - remove from DOM
        console.log('[SiteBot] Widget hidden on this page due to display restrictions');
        shadowHost.remove();
        return;
      }
      
      clinicData = data.clinicData;
      
      // Store booking settings
      bookingEnabled = data.bookingEnabled !== false;
      bookingFields = data.bookingFields || ['name', 'email', 'phone', 'service', 'preferredDate', 'preferredTime', 'notes'];

      // Apply theme
      applyTheme(data.theme);

      // Update header with actual name
      if (headerName) headerName.textContent = sanitize(clinicData?.clinic_name || 'Assistant');

      // Add welcome message
      if (clinicData?.welcomeMessage) {
    messages.push({ role: 'assistant', content: clinicData.welcomeMessage });
    renderMessages();
  }

      // Update booking form fields visibility (but don't show button yet)
      if (bookingEnabled) {
        updateBookingFormFields();
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
            // Check if booking intent was detected - show the booking button
            if (data.bookingIntent && bookingEnabled) {
              setTimeout(addBookingButton, 100);
            }
            // Check if booking was auto-submitted
            if (data.bookingSubmitted && data.bookingData) {
              // Pre-fill and show booking form for confirmation
              prefillBookingForm(data.bookingData);
              setTimeout(showBookingForm, 500);
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
