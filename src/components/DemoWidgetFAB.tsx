'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatTheme, ClinicData, Message } from '@/types/clinic';
import { sendDemoChatMessageStream } from '@/lib/api';

interface DemoWidgetFABProps {
  clinicData: ClinicData;
  theme: ChatTheme;
}

// Language detection based on content or URL
function detectLanguage(clinicData: ClinicData): string {
  const content = (clinicData.raw_content || '').toLowerCase();
  const url = (clinicData.sourceUrl || '').toLowerCase();

  // Check URL TLD first
  if (url.includes('.sk') || url.includes('/sk/')) return 'sk';
  if (url.includes('.cz') || url.includes('/cs/') || url.includes('/cz/')) return 'cs';
  if (url.includes('.de') || url.includes('/de/')) return 'de';
  if (url.includes('.fr') || url.includes('/fr/')) return 'fr';
  if (url.includes('.es') || url.includes('/es/')) return 'es';
  if (url.includes('.it') || url.includes('/it/')) return 'it';
  if (url.includes('.pl') || url.includes('/pl/')) return 'pl';
  if (url.includes('.nl') || url.includes('/nl/')) return 'nl';
  if (url.includes('.pt') || url.includes('/pt/')) return 'pt';

  // Check content for common words
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
}

// Get welcome message in detected language
function getWelcomeMessage(clinicName: string, language: string): string {
  const messages: Record<string, string> = {
    sk: `Dobrý deň! Som AI asistent pre ${clinicName}. Ako vám môžem pomôcť?`,
    cs: `Dobrý den! Jsem AI asistent pro ${clinicName}. Jak vám mohu pomoci?`,
    de: `Guten Tag! Ich bin der KI-Assistent für ${clinicName}. Wie kann ich Ihnen helfen?`,
    fr: `Bonjour ! Je suis l'assistant IA de ${clinicName}. Comment puis-je vous aider ?`,
    es: `¡Hola! Soy el asistente de IA de ${clinicName}. ¿Cómo puedo ayudarte?`,
    it: `Ciao! Sono l'assistente AI di ${clinicName}. Come posso aiutarti?`,
    pl: `Dzień dobry! Jestem asystentem AI dla ${clinicName}. Jak mogę pomóc?`,
    nl: `Goedendag! Ik ben de AI-assistent van ${clinicName}. Hoe kan ik u helpen?`,
    pt: `Olá! Sou o assistente de IA da ${clinicName}. Como posso ajudá-lo?`,
    en: `Hi! I'm the AI assistant for ${clinicName}. How can I help you today?`,
  };
  return messages[language] || messages.en;
}

// Get placeholder text in detected language
function getPlaceholder(language: string): string {
  const placeholders: Record<string, string> = {
    sk: 'Napíšte správu...',
    cs: 'Napište zprávu...',
    de: 'Nachricht schreiben...',
    fr: 'Écrivez un message...',
    es: 'Escribe un mensaje...',
    it: 'Scrivi un messaggio...',
    pl: 'Napisz wiadomość...',
    nl: 'Schrijf een bericht...',
    pt: 'Escreva uma mensagem...',
    en: 'Type a message...',
  };
  return placeholders[language] || placeholders.en;
}

export default function DemoWidgetFAB({
  clinicData,
  theme,
}: DemoWidgetFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [favicon, setFavicon] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Detect language from scraped content
  const language = detectLanguage(clinicData);

  // Always use localized welcome message based on detected language
  // (ignore server's welcomeMessage which is typically in English)
  const [messages, setMessages] = useState<Message[]>(() => {
    return [{ role: 'assistant', content: getWelcomeMessage(clinicData.clinic_name, language) }];
  });

  // Try to get favicon from the source URL
  useEffect(() => {
    if (clinicData.sourceUrl) {
      try {
        const url = new URL(clinicData.sourceUrl);
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
        setFavicon(faviconUrl);
      } catch {
        setFavicon(null);
      }
    }
  }, [clinicData.sourceUrl]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = useCallback(async () => {
    const message = input.trim();
    if (!message || isLoading) return;

    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: message }];
    setMessages(newMessages);
    setIsLoading(true);

    let accumulated = '';

    await sendDemoChatMessageStream(
      clinicData,
      messages,
      message,
      (chunk: string) => {
        accumulated += chunk;
      },
      () => {
        if (accumulated) {
          setMessages([...newMessages, { role: 'assistant', content: accumulated }]);
        }
        setIsLoading(false);
      },
      (error: string) => {
        setMessages([...newMessages, { role: 'assistant', content: error || 'Sorry, something went wrong.' }]);
        setIsLoading(false);
      }
    );
  }, [input, isLoading, messages, clinicData]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200);
  };

  const openPanel = () => {
    setIsOpen(true);
  };

  // Generate color from clinic name for fallback
  const generateColor = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 60%, 45%)`;
  };

  const primaryColor = theme.primaryColor || generateColor(clinicData.clinic_name || 'demo');

  // Exact same styles as embed.js
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

        .demo-widget-fab {
          position: fixed;
          bottom: 92px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -15)} 100%);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 4px 14px ${hexToRgba(primaryColor, 0.4)},
            0 0 0 0 ${hexToRgba(primaryColor, 0)};
          z-index: 2147483646;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease,
            opacity 0.2s ease,
            visibility 0.2s ease;
          animation: demoFabEnter 0.35s ease-out forwards;
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        @keyframes demoFabEnter {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .demo-widget-fab.hidden {
          opacity: 0;
          transform: scale(0.8);
          pointer-events: none;
          visibility: hidden;
          box-shadow: none;
          transition:
            opacity 0.2s ease,
            transform 0.2s ease,
            visibility 0s linear 0.2s,
            box-shadow 0s linear 0.2s;
        }

        .demo-widget-fab:hover {
          background: linear-gradient(135deg, ${adjustColor(primaryColor, -10)} 0%, ${adjustColor(primaryColor, -25)} 100%);
          box-shadow:
            0 6px 20px ${hexToRgba(primaryColor, 0.5)},
            0 0 0 4px ${hexToRgba(primaryColor, 0.15)};
          transform: scale(1.08);
        }

        .demo-widget-fab:active {
          transform: scale(0.96);
          box-shadow:
            0 2px 8px ${hexToRgba(primaryColor, 0.4)},
            0 0 0 2px ${hexToRgba(primaryColor, 0.2)};
        }

        .demo-widget-fab svg {
          width: 24px;
          height: 24px;
          transition: transform 0.2s ease;
        }

        .demo-widget-fab:hover svg {
          transform: scale(1.05);
        }

        .demo-widget-fab-icon {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          object-fit: contain;
          background: white;
          padding: 2px;
        }

        .demo-widget-fab-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #10b981;
          color: white;
          font-size: 9px;
          font-weight: 700;
          padding: 3px 6px;
          border-radius: 8px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .demo-widget-panel {
          --chat-primary: ${primaryColor};
          --chat-surface: ${theme.backgroundColor || '#ffffff'};
          --chat-text: ${theme.textColor || '#1e293b'};
          --chat-muted: #64748b;
          --chat-user: ${theme.userBubbleColor || primaryColor};
          --chat-user-text: #ffffff;
          --chat-assistant: ${theme.assistantBubbleColor || '#ffffff'};
          --chat-assistant-border: #e2e8f0;
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 400px;
          max-width: calc(100vw - 48px);
          height: min(560px, 75vh);
          max-height: calc(100vh - 48px);
          background: var(--chat-surface);
          border-radius: 24px;
          box-shadow:
            0 25px 50px -12px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(0, 0, 0, 0.05);
          border: none;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 2147483647;
          opacity: 0;
          pointer-events: none;
          transform: translateY(20px) scale(0.96);
          transform-origin: bottom right;
          transition:
            opacity 0.35s ease,
            transform 0.35s cubic-bezier(0.2, 0.9, 0.2, 1),
            box-shadow 0.35s ease;
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .demo-widget-panel.open {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0) scale(1);
          animation: demoPanelPop 0.45s cubic-bezier(0.2, 0.9, 0.2, 1);
          box-shadow:
            0 25px 50px -12px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(0, 0, 0, 0.05);
        }

        @keyframes demoPanelPop {
          0% {
            opacity: 0;
            transform: translateY(28px) scale(0.94);
          }
          60% {
            opacity: 1;
            transform: translateY(-6px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .demo-widget-panel.closing {
          opacity: 0;
          transform: translateY(20px) scale(0.96);
          pointer-events: none;
        }

        .demo-widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 20px;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          flex-shrink: 0;
        }

        .demo-widget-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1;
        }

        .demo-widget-header-avatar {
          width: 36px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -15)} 100%);
          color: #ffffff;
          flex-shrink: 0;
          overflow: hidden;
        }

        .demo-widget-header-avatar img {
          width: 22px;
          height: 22px;
          border-radius: 4px;
          object-fit: contain;
          background: white;
          padding: 1px;
        }

        .demo-widget-header-title {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .demo-widget-header-title h3 {
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
          line-height: 1.2;
        }

        .demo-widget-header-sub {
          margin: 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.2;
        }

        .demo-widget-header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .demo-widget-action-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid transparent;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
        }

        .demo-widget-action-btn:hover {
          background: #eff6ff;
          color: ${primaryColor};
          transform: translateY(-1px);
        }

        .demo-widget-action-btn:active {
          background: #eff6ff;
          color: ${primaryColor};
        }

        .demo-widget-action-btn svg {
          width: 18px;
          height: 18px;
        }

        .demo-widget-preview-badge {
          font-size: 10px;
          font-weight: 600;
          background: #f0fdf4;
          color: #16a34a;
          padding: 4px 8px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .demo-widget-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .demo-widget-messages::-webkit-scrollbar {
          width: 6px;
        }
        .demo-widget-messages::-webkit-scrollbar-track {
          background: transparent;
        }
        .demo-widget-messages::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .demo-widget-messages::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .demo-widget-msg {
          max-width: 85%;
          padding: 14px 18px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .demo-widget-msg.user {
          align-self: flex-end;
          background: var(--chat-user);
          color: var(--chat-user-text);
          border-bottom-right-radius: 4px;
        }

        .demo-widget-msg.assistant {
          align-self: flex-start;
          background: var(--chat-assistant);
          color: var(--chat-text);
          border: 1px solid var(--chat-assistant-border);
          border-bottom-left-radius: 4px;
        }

        .demo-widget-typing {
          display: flex;
          gap: 5px;
          padding: 6px 0;
        }

        .demo-widget-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #93c5fd;
          opacity: 0.9;
          animation: demoTypingBounce 1.2s infinite ease-in-out;
        }

        .demo-widget-dot:nth-child(2) {
          animation-delay: 0.15s;
        }

        .demo-widget-dot:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes demoTypingBounce {
          0%, 60%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          30% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .demo-widget-input-bar {
          display: flex;
          gap: 12px;
          padding: 18px 20px;
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          flex-shrink: 0;
        }

        .demo-widget-input-bar input {
          flex: 1;
          height: 44px;
          padding: 0 18px;
          border: 1px solid #e2e8f0;
          border-radius: 100px;
          font-size: 14px;
          font-family: inherit;
          background: #f8fafc;
          color: var(--chat-text);
          transition: border-color 0.15s ease, background 0.15s ease;
        }

        .demo-widget-input-bar input::placeholder {
          color: #94a3b8;
        }

        .demo-widget-input-bar input:focus {
          outline: none;
          border-color: ${primaryColor};
          background: #ffffff;
        }

        .demo-widget-input-bar input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .demo-widget-send {
          width: 44px;
          height: 44px;
          border-radius: 100px;
          background: ${primaryColor};
          border: 1px solid ${primaryColor};
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.15s ease, border-color 0.15s ease;
        }

        .demo-widget-send:hover:not(:disabled) {
          background: ${adjustColor(primaryColor, -10)};
          border-color: ${adjustColor(primaryColor, -10)};
        }

        .demo-widget-send:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .demo-widget-send svg {
          width: 18px;
          height: 18px;
        }

        .demo-widget-legal-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
          background: hsl(214 32% 98%);
          border-top: 1px solid hsl(214 32% 93%);
          font-size: 11px;
          color: #64748b;
        }

        .demo-widget-legal-bar a {
          color: ${primaryColor};
          text-decoration: none;
          font-weight: 500;
        }

        .demo-widget-legal-bar a:hover {
          text-decoration: underline;
        }

        .demo-widget-legal-separator {
          color: #64748b;
          margin: 0 6px;
        }

        @media (max-width: 480px) {
          .demo-widget-panel {
            bottom: 16px;
            right: 16px;
            left: 16px;
            width: auto;
            max-width: none;
            height: calc(100vh - 100px);
            max-height: none;
            border-radius: 16px;
          }
          .demo-widget-fab {
            bottom: 84px;
            right: 16px;
            left: auto;
            width: 52px;
            height: 52px;
          }
        }
      `}</style>

      {/* FAB Button - positioned above the XeloChat FAB */}
      <button
        className={`demo-widget-fab ${isOpen ? 'hidden' : ''}`}
        onClick={openPanel}
        aria-label={`Chat with ${clinicData.clinic_name}`}
        type="button"
      >
        <span className="demo-widget-fab-badge">Preview</span>
        {favicon ? (
          <img className="demo-widget-fab-icon" src={favicon} alt="" onError={() => setFavicon(null)} />
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 10.5h8M8 14.5h5" strokeLinecap="round" />
            <path d="M12 3C6.5 3 2 6.8 2 11.5c0 2.4 1.2 4.6 3.1 6.1l-.6 3.9 4.3-2.2c1 .3 2.1.4 3.2.4 5.5 0 10-3.8 10-8.5S17.5 3 12 3z" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      <div className={`demo-widget-panel ${isOpen ? 'open' : ''} ${isClosing ? 'closing' : ''}`}>
        <header className="demo-widget-header">
          <div className="demo-widget-header-info">
            <div className="demo-widget-header-avatar">
              {favicon ? (
                <img src={favicon} alt="" onError={() => setFavicon(null)} />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 10.5h8M8 14.5h5" strokeLinecap="round" />
                  <path d="M12 3C6.5 3 2 6.8 2 11.5c0 2.4 1.2 4.6 3.1 6.1l-.6 3.9 4.3-2.2c1 .3 2.1.4 3.2.4 5.5 0 10-3.8 10-8.5S17.5 3 12 3z" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div className="demo-widget-header-title">
              <h3>{theme.name || clinicData.clinic_name || 'Assistant'}</h3>
              <p className="demo-widget-header-sub">{theme.tagline || 'AI-powered assistant'}</p>
            </div>
          </div>
          <div className="demo-widget-header-actions">
            <span className="demo-widget-preview-badge">Preview</span>
            <button
              className="demo-widget-action-btn"
              onClick={handleClose}
              aria-label="Minimize"
              title="Minimize"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        </header>

        <div className="demo-widget-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`demo-widget-msg ${msg.role}`}>
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className="demo-widget-msg assistant">
              <div className="demo-widget-typing">
                <span className="demo-widget-dot"></span>
                <span className="demo-widget-dot"></span>
                <span className="demo-widget-dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="demo-widget-input-bar">
          <input
            type="text"
            placeholder={getPlaceholder(language)}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            autoComplete="off"
          />
          <button
            className="demo-widget-send"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>

        <div className="demo-widget-legal-bar">
          <span>Preview mode • AI responses may be imperfect</span>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <a href="/terms" target="_blank" rel="noopener noreferrer">Terms</a>
            <span className="demo-widget-legal-separator">•</span>
            <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy</a>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper function to darken/lighten a hex color
function adjustColor(color: string, amount: number): string {
  // Handle HSL colors
  if (color.startsWith('hsl')) {
    return color;
  }

  // Handle hex colors
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// Helper function to convert hex to rgba
function hexToRgba(color: string, alpha: number): string {
  if (color.startsWith('hsl')) {
    return color.replace(')', `, ${alpha})`).replace('hsl', 'hsla');
  }

  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
