// SiteBot Widget - Universal Embeddable Chat Widget
// Works on any website: WordPress, Wix, Shopify, Squarespace, custom HTML

interface WidgetConfig {
    chatbotId: string;
    apiUrl: string;
    botName?: string;
    tagline?: string;
    primaryColor?: string;
    position?: 'bottom-right' | 'bottom-left';
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

// Get configuration from script tag data attributes
function getConfig(): WidgetConfig {
    const script = document.currentScript as HTMLScriptElement | null;
    const chatbotId = script?.getAttribute('data-chatbot-id') || '';
    const apiUrl = script?.getAttribute('data-api-url') || 'https://xelochat-production.up.railway.app';

    return {
        chatbotId,
        apiUrl,
        botName: script?.getAttribute('data-bot-name') || 'SiteBot',
        tagline: script?.getAttribute('data-tagline') || 'AI-powered assistant',
        primaryColor: script?.getAttribute('data-primary-color') || '#3b82f6',
        position: (script?.getAttribute('data-position') as 'bottom-right' | 'bottom-left') || 'bottom-right',
    };
}

// CSS styles (will be injected into Shadow DOM)
const styles = `
:host {
  --sb-primary: var(--sitebot-primary, #3b82f6);
  --sb-primary-dark: var(--sitebot-primary-dark, #2563eb);
  --sb-bg: #ffffff;
  --sb-text: #1e293b;
  --sb-muted: #64748b;
  --sb-border: #e2e8f0;
  --sb-user-bg: var(--sb-primary);
  --sb-user-text: #ffffff;
  --sb-assistant-bg: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.sb-widget {
  position: fixed;
  z-index: 2147483647;
}

.sb-widget.bottom-right {
  bottom: 24px;
  right: 24px;
}

.sb-widget.bottom-left {
  bottom: 24px;
  left: 24px;
}

/* FAB Button */
.sb-fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--sb-primary) 0%, var(--sb-primary-dark) 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.sb-fab:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.sb-fab:active {
  transform: scale(0.96);
}

.sb-fab svg {
  width: 22px;
  height: 22px;
}

/* Chat Panel */
.sb-panel {
  position: absolute;
  width: 400px;
  max-width: calc(100vw - 48px);
  height: min(560px, 75vh);
  max-height: calc(100vh - 48px);
  background: var(--sb-bg);
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: sb-slide-up 0.25s ease-out;
}

.sb-widget.bottom-right .sb-panel {
  bottom: 72px;
  right: 0;
}

.sb-widget.bottom-left .sb-panel {
  bottom: 72px;
  left: 0;
}

@keyframes sb-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.sb-panel.hidden {
  display: none;
}

/* Header */
.sb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  background: var(--sb-bg);
  border-bottom: 1px solid var(--sb-border);
  flex-shrink: 0;
}

.sb-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sb-avatar {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--sb-primary) 0%, var(--sb-primary-dark) 100%);
  border-radius: 50%;
  color: white;
  flex-shrink: 0;
}

.sb-avatar svg {
  width: 20px;
  height: 20px;
}

.sb-bot-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--sb-text);
}

.sb-tagline {
  font-size: 12px;
  color: var(--sb-muted);
  margin-top: 2px;
}

.sb-header-actions {
  display: flex;
  gap: 4px;
}

.sb-action-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--sb-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

.sb-action-btn:hover {
  background: #eff6ff;
  color: var(--sb-primary);
}

.sb-action-btn svg {
  width: 18px;
  height: 18px;
}

/* Messages */
.sb-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sb-message {
  display: flex;
  max-width: 85%;
}

.sb-message.user {
  align-self: flex-end;
}

.sb-message.assistant {
  align-self: flex-start;
}

.sb-bubble {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.sb-message.user .sb-bubble {
  background: var(--sb-user-bg);
  color: var(--sb-user-text);
  border-bottom-right-radius: 4px;
}

.sb-message.assistant .sb-bubble {
  background: var(--sb-assistant-bg);
  color: var(--sb-text);
  border: 1px solid var(--sb-border);
  border-bottom-left-radius: 4px;
}

.sb-bubble strong {
  font-weight: 600;
}

/* Typing indicator */
.sb-typing {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.sb-typing span {
  width: 8px;
  height: 8px;
  background: var(--sb-muted);
  border-radius: 50%;
  animation: sb-bounce 1.4s infinite ease-in-out both;
}

.sb-typing span:nth-child(1) { animation-delay: -0.32s; }
.sb-typing span:nth-child(2) { animation-delay: -0.16s; }

@keyframes sb-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Input area */
.sb-input-area {
  display: flex;
  gap: 10px;
  padding: 16px 20px;
  background: var(--sb-bg);
  border-top: 1px solid var(--sb-border);
}

.sb-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--sb-border);
  border-radius: 12px;
  font-size: 14px;
  background: #f8fafc;
  color: var(--sb-text);
  outline: none;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  font-family: inherit;
}

.sb-input:focus {
  border-color: var(--sb-primary);
  background: var(--sb-bg);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.sb-input::placeholder {
  color: var(--sb-muted);
}

.sb-send-btn {
  width: 46px;
  height: 46px;
  border: none;
  background: linear-gradient(135deg, var(--sb-primary) 0%, var(--sb-primary-dark) 100%);
  color: white;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, box-shadow 0.15s;
  flex-shrink: 0;
}

.sb-send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.sb-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sb-send-btn svg {
  width: 20px;
  height: 20px;
}

/* Legal bar */
.sb-legal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  font-size: 11px;
  color: var(--sb-muted);
}

.sb-legal a {
  color: var(--sb-primary);
  text-decoration: none;
  font-weight: 500;
}

.sb-legal a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 480px) {
  .sb-panel {
    position: fixed;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100%;
    max-width: 100%;
    height: 100%;
    max-height: 100%;
    border-radius: 0;
  }
  
  .sb-fab {
    width: 52px;
    height: 52px;
  }
  
  .sb-widget.bottom-right,
  .sb-widget.bottom-left {
    bottom: 16px;
    right: 16px;
    left: auto;
  }
}
`;

// SVG Icons
const icons = {
    chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M8 10.5h8M8 14.5h5" stroke-linecap="round"/>
    <path d="M12 3C6.5 3 2 6.8 2 11.5c0 2.4 1.2 4.6 3.1 6.1l-.6 3.9 4.3-2.2c1 .3 2.1.4 3.2.4 5.5 0 10-3.8 10-8.5S17.5 3 12 3z" stroke-linejoin="round"/>
  </svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`,
    minimize: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>`,
    send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
  </svg>`,
    bot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>`,
};

class SiteBotWidget {
    private config: WidgetConfig;
    private shadow: ShadowRoot;
    private container: HTMLElement;
    private isOpen = false;
    private messages: Message[] = [];
    private isTyping = false;
    private clinicData: Record<string, unknown> | null = null;

    constructor(config: WidgetConfig) {
        this.config = config;

        // Create container and attach shadow DOM
        this.container = document.createElement('div');
        this.container.id = 'sitebot-widget-root';
        this.shadow = this.container.attachShadow({ mode: 'closed' });

        // Inject styles
        const styleEl = document.createElement('style');
        styleEl.textContent = styles;
        this.shadow.appendChild(styleEl);

        // Initial render
        this.render();

        // Append to body
        document.body.appendChild(this.container);

        // Initialize with welcome message
        this.addMessage('assistant', `Welcome! 👋 I'm ready to help you with any questions about this business.\n\nWhat would you like to know?`);

        // Fetch clinic data
        this.fetchClinicData();
    }

    private async fetchClinicData(): Promise<void> {
        if (!this.config.chatbotId) return;

        try {
            const response = await fetch(`${this.config.apiUrl}/api/chatbot/${this.config.chatbotId}`);
            if (response.ok) {
                const data = await response.json();
                this.clinicData = data.clinicData;

                // Update welcome message with business name if available
                if (data.settings?.botName) {
                    this.config.botName = data.settings.botName;
                    this.render();
                }
            }
        } catch (error) {
            console.warn('SiteBot: Could not fetch chatbot data', error);
        }
    }

    private render(): void {
        const widget = document.createElement('div');
        widget.className = `sb-widget ${this.config.position}`;

        // Apply custom primary color
        if (this.config.primaryColor) {
            widget.style.setProperty('--sitebot-primary', this.config.primaryColor);
            // Generate darker shade
            const darkerColor = this.darkenColor(this.config.primaryColor, 15);
            widget.style.setProperty('--sitebot-primary-dark', darkerColor);
        }

        // FAB Button
        const fab = document.createElement('button');
        fab.className = 'sb-fab';
        fab.innerHTML = icons.chat;
        fab.setAttribute('aria-label', 'Open chat');
        fab.onclick = () => this.toggle();

        // Chat Panel
        const panel = document.createElement('div');
        panel.className = `sb-panel ${this.isOpen ? '' : 'hidden'}`;
        panel.innerHTML = this.renderPanel();

        widget.appendChild(panel);
        widget.appendChild(fab);

        // Clear and re-render
        const existingWidget = this.shadow.querySelector('.sb-widget');
        if (existingWidget) {
            existingWidget.remove();
        }
        this.shadow.appendChild(widget);

        // Attach event listeners
        this.attachEventListeners();
    }

    private renderPanel(): string {
        return `
      <header class="sb-header">
        <div class="sb-header-info">
          <div class="sb-avatar">${icons.bot}</div>
          <div>
            <div class="sb-bot-name">${this.escapeHtml(this.config.botName || 'SiteBot')}</div>
            <div class="sb-tagline">${this.escapeHtml(this.config.tagline || 'AI-powered assistant')}</div>
          </div>
        </div>
        <div class="sb-header-actions">
          <button class="sb-action-btn sb-minimize" aria-label="Minimize">${icons.minimize}</button>
          <button class="sb-action-btn sb-close" aria-label="Close">${icons.close}</button>
        </div>
      </header>
      <div class="sb-messages">
        ${this.renderMessages()}
      </div>
      <div class="sb-input-area">
        <input type="text" class="sb-input" placeholder="Ask anything..." ${this.isTyping ? 'disabled' : ''}>
        <button class="sb-send-btn" ${this.isTyping ? 'disabled' : ''}>${icons.send}</button>
      </div>
      <div class="sb-legal">
        <span>AI responses may be imperfect. Confirm details before acting.</span>
        <a href="#" target="_blank">Terms</a>
      </div>
    `;
    }

    private renderMessages(): string {
        let html = this.messages.map(msg => `
      <div class="sb-message ${msg.role}">
        <div class="sb-bubble">${this.formatMessage(msg.content)}</div>
      </div>
    `).join('');

        if (this.isTyping) {
            html += `
        <div class="sb-message assistant">
          <div class="sb-bubble">
            <div class="sb-typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      `;
        }

        return html;
    }

    private attachEventListeners(): void {
        const closeBtn = this.shadow.querySelector('.sb-close');
        const minimizeBtn = this.shadow.querySelector('.sb-minimize');
        const sendBtn = this.shadow.querySelector('.sb-send-btn');
        const input = this.shadow.querySelector('.sb-input') as HTMLInputElement;

        closeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.close();
        });

        minimizeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.close();
        });

        sendBtn?.addEventListener('click', () => this.sendMessage());

        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    private toggle(): void {
        this.isOpen = !this.isOpen;
        this.render();

        if (this.isOpen) {
            setTimeout(() => {
                const input = this.shadow.querySelector('.sb-input') as HTMLInputElement;
                input?.focus();
                this.scrollToBottom();
            }, 100);
        }
    }

    private close(): void {
        this.isOpen = false;
        this.render();
    }

    private async sendMessage(): Promise<void> {
        const input = this.shadow.querySelector('.sb-input') as HTMLInputElement;
        const text = input?.value.trim();

        if (!text || this.isTyping) return;

        input.value = '';
        this.addMessage('user', text);

        this.isTyping = true;
        this.render();
        this.scrollToBottom();

        try {
            const response = await this.callChatAPI(text);
            this.addMessage('assistant', response);
        } catch (error) {
            this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
            console.error('SiteBot chat error:', error);
        }

        this.isTyping = false;
        this.render();
        this.scrollToBottom();
    }

    private async callChatAPI(message: string): Promise<string> {
        if (!this.config.chatbotId) {
            return 'This chatbot is not configured yet. Please contact the website owner.';
        }

        const response = await fetch(`${this.config.apiUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chatbotId: this.config.chatbotId,
                message,
                conversationHistory: this.messages.slice(0, -1), // Exclude the just-added user message
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data.response || data.message || 'I could not process that request.';
    }

    private addMessage(role: 'user' | 'assistant', content: string): void {
        this.messages.push({ role, content });
    }

    private scrollToBottom(): void {
        setTimeout(() => {
            const messages = this.shadow.querySelector('.sb-messages');
            if (messages) {
                messages.scrollTop = messages.scrollHeight;
            }
        }, 50);
    }

    private formatMessage(content: string): string {
        return this.escapeHtml(content)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    private darkenColor(hex: string, percent: number): string {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max((num >> 16) - amt, 0);
        const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
        const B = Math.max((num & 0x0000FF) - amt, 0);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }
}

// Auto-initialize when script loads
(function () {
    const config = getConfig();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new SiteBotWidget(config));
    } else {
        new SiteBotWidget(config);
    }
})();

// Export for manual initialization
(window as unknown as Record<string, unknown>).SiteBotWidget = SiteBotWidget;
