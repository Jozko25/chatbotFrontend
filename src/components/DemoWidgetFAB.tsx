'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatTheme, ClinicData, Message } from '@/types/clinic';
import { sendDemoChatMessageStream } from '@/lib/api';

interface DemoWidgetFABProps {
  clinicData: ClinicData;
  theme: ChatTheme;
  onUseWebsite?: () => void;
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

function getWelcomeTitle(language: string): string {
  const titles: Record<string, string> = {
    sk: 'Dobrý deň!',
    cs: 'Dobrý den!',
    de: 'Guten Tag!',
    fr: 'Bonjour !',
    es: '¡Hola!',
    it: 'Ciao!',
    pl: 'Dzień dobry!',
    nl: 'Goedendag!',
    pt: 'Olá!',
    en: 'Hi there!',
  };
  return titles[language] || titles.en;
}

function getWelcomeFallback(clinicName: string, language: string): string {
  const messages: Record<string, string> = {
    sk: `Som AI asistent pre ${clinicName}. Ako vám môžem pomôcť?`,
    cs: `Jsem AI asistent pro ${clinicName}. Jak vám mohu pomoci?`,
    de: `Ich bin der KI-Assistent für ${clinicName}. Wie kann ich Ihnen helfen?`,
    fr: `Je suis l'assistant IA de ${clinicName}. Comment puis-je vous aider ?`,
    es: `Soy el asistente de IA de ${clinicName}. ¿Cómo puedo ayudarte?`,
    it: `Sono l'assistente AI di ${clinicName}. Come posso aiutarti?`,
    pl: `Jestem asystentem AI dla ${clinicName}. Jak mogę pomóc?`,
    nl: `Ik ben de AI-assistent van ${clinicName}. Hoe kan ik u helpen?`,
    pt: `Sou o assistente de IA da ${clinicName}. Como posso ajudá-lo?`,
    en: `I'm the AI assistant for ${clinicName}. How can I help you today?`,
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

function getSuggestions(clinicData: ClinicData, language: string): string[] {
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
      en: 'What services do you offer?',
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
      en: 'What are your opening hours?',
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
      en: 'How can I contact you?',
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
      en: 'I\'d like to book an appointment',
    },
  };

  const suggestions: string[] = [];
  if (clinicData.services?.length) {
    suggestions.push(t.services[language] || t.services.en);
  }
  if (clinicData.opening_hours) {
    suggestions.push(t.hours[language] || t.hours.en);
  }
  if (clinicData.phone || clinicData.email) {
    suggestions.push(t.contact[language] || t.contact.en);
  }
  suggestions.push(t.booking[language] || t.booking.en);

  return suggestions.slice(0, 3);
}

export default function DemoWidgetFAB({
  clinicData,
  theme,
  onUseWebsite,
}: DemoWidgetFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Detect language from scraped content
  const language = detectLanguage(clinicData);

  const [messages, setMessages] = useState<Message[]>([]);

  const welcomeTitle = getWelcomeTitle(language);
  const welcomeText = clinicData.welcomeMessage || getWelcomeFallback(clinicData.clinic_name, language);
  const suggestions = getSuggestions(clinicData, language);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = useCallback(async (override?: string) => {
    const message = (override ?? input).trim();
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
          bottom: 96px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 999px;
          background: linear-gradient(145deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -30)} 100%);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 8px 32px -4px ${hexToRgba(primaryColor, 0.5)},
            0 4px 12px -2px rgba(0, 0, 0, 0.1);
          z-index: 2147483646;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .demo-widget-fab.hidden {
          opacity: 0;
          transform: scale(0.7) translateY(6px);
          pointer-events: none;
          visibility: hidden;
          transition: all 0.25s ease, visibility 0s linear 0.25s;
        }

        .demo-widget-fab:hover {
          background: linear-gradient(145deg, ${adjustColor(primaryColor, -8)} 0%, ${adjustColor(primaryColor, -35)} 100%);
          box-shadow:
            0 12px 40px -4px ${hexToRgba(primaryColor, 0.6)},
            0 8px 20px -4px rgba(0, 0, 0, 0.15);
          transform: scale(1.03) translateY(-1px);
        }

        .demo-widget-fab:active {
          transform: scale(0.95);
        }

        .demo-widget-fab svg {
          width: 28px;
          height: 28px;
          transition: transform 0.3s ease;
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
          --chat-bg: #f1f5f9;
          position: fixed;
          bottom: 24px;
          right: 24px;
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
          z-index: 2147483647;
          opacity: 0;
          pointer-events: none;
          transform: translateY(16px);
          transform-origin: bottom right;
          transition: opacity 0.25s ease, transform 0.25s ease;
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .demo-widget-panel.open {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
        }

        .demo-widget-panel.closing {
          opacity: 0;
          transform: translateY(16px);
          pointer-events: none;
        }

        .demo-widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 20px 16px 20px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.96) 100%);
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          flex-shrink: 0;
        }

        .demo-widget-header-info {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
          flex: 1;
        }

        .demo-widget-header-avatar {
          width: 44px;
          height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: linear-gradient(145deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -30)} 100%);
          color: #ffffff;
          flex-shrink: 0;
          overflow: hidden;
          box-shadow: 0 4px 12px -2px ${hexToRgba(primaryColor, 0.4)};
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
          font-size: 16px;
          font-weight: 600;
          color: var(--chat-text);
          margin: 0;
          line-height: 1.3;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .demo-widget-header-sub {
          margin: 0;
          color: var(--chat-muted);
          font-size: 13px;
          line-height: 1.3;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .demo-widget-status-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          animation: demoStatusPulse 2s ease-in-out infinite;
        }

        @keyframes demoStatusPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .demo-widget-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .demo-widget-action-btn {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .demo-widget-action-btn:hover {
          background: var(--chat-bg);
          color: var(--chat-text);
        }

        .demo-widget-action-btn:active {
          transform: scale(0.92);
        }

        .demo-widget-action-btn svg {
          width: 18px;
          height: 18px;
        }

        .demo-widget-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background:
            radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 45%),
            var(--chat-bg);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .demo-widget-welcome {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 32px 24px;
          height: 100%;
          gap: 20px;
        }

        .demo-widget-welcome-icon {
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

        .demo-widget-welcome-icon svg {
          width: 36px;
          height: 36px;
        }

        .demo-widget-welcome-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--chat-text);
          line-height: 1.3;
        }

        .demo-widget-welcome-text {
          font-size: 15px;
          color: var(--chat-muted);
          line-height: 1.6;
          max-width: 280px;
        }

        .demo-widget-welcome-suggestions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          max-width: 280px;
          margin-top: 8px;
        }

        .demo-widget-suggestion {
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

        .demo-widget-suggestion:hover {
          border-color: var(--chat-primary);
          background: rgba(59, 130, 246, 0.06);
          transform: translateY(-1px);
        }

        .demo-widget-suggestion:active {
          transform: scale(0.98);
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
          border-radius: 22px;
          font-size: 15px;
          line-height: 1.55;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .demo-widget-msg.user {
          align-self: flex-end;
          background: linear-gradient(145deg, var(--chat-user) 0%, #1d4ed8 100%);
          color: var(--chat-user-text);
          border-bottom-right-radius: 14px;
          box-shadow: 0 2px 8px -2px rgba(59, 130, 246, 0.3);
        }

        .demo-widget-msg.assistant {
          align-self: flex-start;
          background: var(--chat-surface);
          color: var(--chat-text);
          border: 1px solid var(--chat-assistant-border);
          border-bottom-left-radius: 14px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
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
          padding: 16px 20px 20px 20px;
          background: var(--chat-surface);
          border-top: 1px solid rgba(15, 23, 42, 0.06);
          flex-shrink: 0;
        }

        .demo-widget-input-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .demo-widget-input-bar input {
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

        .demo-widget-input-bar input::placeholder {
          color: #94a3b8;
        }

        .demo-widget-input-bar input:focus {
          outline: none;
          border-color: var(--chat-primary);
          background: var(--chat-surface);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .demo-widget-input-bar input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .demo-widget-send {
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
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .demo-widget-send:hover:not(:disabled) {
          background: #1d4ed8;
          transform: scale(1.05);
        }

        .demo-widget-send:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .demo-widget-send svg {
          width: 18px;
          height: 18px;
        }

        .demo-widget-footer {
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

        .demo-widget-footer a {
          color: var(--chat-muted);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .demo-widget-footer a:hover {
          color: var(--chat-primary);
        }

        .demo-widget-footer-links {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .demo-widget-footer-divider {
          color: rgba(100, 116, 139, 0.6);
        }

        .demo-widget-footer-brand {
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        @media (max-width: 480px) {
          .demo-widget-panel {
            bottom: 0;
            right: 0;
            left: 0;
            width: 100%;
            max-width: none;
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
          }
          .demo-widget-fab {
            bottom: 84px;
            right: 20px;
            left: auto;
            width: 54px;
            height: 54px;
            border-radius: 999px;
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
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3C6.5 3 2 6.8 2 11.5c0 2.4 1.2 4.6 3.1 6.1l-.6 3.9 4.3-2.2c1 .3 2.1.4 3.2.4 5.5 0 10-3.8 10-8.5S17.5 3 12 3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Chat Panel */}
      <div className={`demo-widget-panel ${isOpen ? 'open' : ''} ${isClosing ? 'closing' : ''}`}>
        <header className="demo-widget-header">
          <div className="demo-widget-header-info">
            <div className="demo-widget-header-avatar">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3C6.5 3 2 6.8 2 11.5c0 2.4 1.2 4.6 3.1 6.1l-.6 3.9 4.3-2.2c1 .3 2.1.4 3.2.4 5.5 0 10-3.8 10-8.5S17.5 3 12 3z" strokeLinejoin="round"/>
              </svg>
            </div>
          <div className="demo-widget-header-title">
            <h3>{theme.name || clinicData.clinic_name || 'Assistant'}</h3>
            <p className="demo-widget-header-sub"><span className="demo-widget-status-dot"></span>Online</p>
          </div>
        </div>
        <div className="demo-widget-header-actions">
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
          {messages.length === 0 && !isLoading && (
            <div className="demo-widget-welcome">
              <div className="demo-widget-welcome-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3C6.5 3 2 6.8 2 11.5c0 2.4 1.2 4.6 3.1 6.1l-.6 3.9 4.3-2.2c1 .3 2.1.4 3.2.4 5.5 0 10-3.8 10-8.5S17.5 3 12 3z" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="demo-widget-welcome-title">{welcomeTitle}</div>
              <div className="demo-widget-welcome-text">{welcomeText}</div>
              <div className="demo-widget-welcome-suggestions">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    className="demo-widget-suggestion"
                    type="button"
                    onClick={() => handleSend(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
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
          <div className="demo-widget-input-wrapper">
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
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="demo-widget-footer">
          <div className="demo-widget-footer-links">
            <a href="/terms" target="_blank" rel="noopener noreferrer">Terms</a>
            <span className="demo-widget-footer-divider">•</span>
            <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy</a>
          </div>
          <span className="demo-widget-footer-brand">Powered by <a href="https://xelochat.com" target="_blank" rel="noopener noreferrer">XeloChat</a></span>
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
