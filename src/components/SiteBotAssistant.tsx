'use client';

import { useState, useRef, useEffect, CSSProperties } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './SiteBotAssistant.module.css';

// Types
interface Message {
  role: 'user' | 'assistant';
  content: string;
  actions?: ActionButton[];
}

interface ActionButton {
  label: string;
  action: 'navigate' | 'openSection' | 'link';
  target: string;
  icon?: string;
}

interface SiteBotAssistantProps {
  mode: 'landing' | 'dashboard';
  chatbotId?: string;
  onNavigateToSection?: (sectionId: string) => void;
  hasDemoChatbot?: boolean;
  onSwitchToDemo?: () => void;
}

// App Knowledge Base
const APP_KNOWLEDGE = {
  name: 'SiteBot',
  description: 'AI-powered chatbot platform that turns any website into an intelligent assistant',
  features: [
    { name: 'Smart Crawling', description: 'Automatically scans up to 25 pages and extracts products, services, pricing, and FAQs' },
    { name: 'Natural Conversations', description: 'Powered by GPT-4, understands context and provides accurate answers' },
    { name: 'Easy Integration', description: 'One script tag to embed anywhere, works on any website' },
    { name: 'Multilingual', description: 'Responds in the customer\'s language - Slovak, German, Spanish, and more' },
    { name: 'Brand Customizable', description: 'White-label ready with customizable colors and styling' },
    { name: 'Privacy First', description: 'Only reads public website content to train chatbot' },
    { name: 'Booking System', description: 'Built-in appointment booking with customizable fields' },
    { name: 'Notifications', description: 'Email and webhook notifications for bookings' },
  ],
  settings: {
    embed: { name: 'Embed Code', description: 'Get the script to add chatbot to your website', keywords: ['embed', 'code', 'script', 'install', 'website'] },
    apikeys: { name: 'API Keys', description: 'Manage authentication keys for your chatbot', keywords: ['api', 'key', 'authentication', 'access'] },
    ai: { name: 'AI Settings', description: 'Configure welcome message, system prompt, and custom knowledge', keywords: ['ai', 'prompt', 'welcome', 'message', 'knowledge'] },
    communication: { name: 'Communication Style', description: 'Set tone (professional/friendly/casual) and language preferences', keywords: ['tone', 'style', 'language', 'greeting'] },
    booking: { name: 'Booking & Appointments', description: 'Enable/disable booking, choose what info to collect', keywords: ['booking', 'appointment', 'schedule', 'reservation'] },
    notifications: { name: 'Notifications', description: 'Set up email and webhook alerts for bookings', keywords: ['notification', 'email', 'webhook', 'alert'] },
    knowledge: { name: 'Knowledge Base', description: 'Edit business info, services, prices, opening hours', keywords: ['knowledge', 'business', 'services', 'prices', 'hours'] },
  },
  dashboardPages: {
    dashboard: { path: '/dashboard', description: 'Overview with usage stats and recent chatbots' },
    chatbots: { path: '/dashboard/chatbots', description: 'List and manage all your chatbots' },
    apiKeys: { path: '/dashboard/api-keys', description: 'Global API key management' },
  },
  howItWorks: [
    'Enter your website URL',
    'AI crawls and extracts your content',
    'Customize the chatbot appearance',
    'Copy the embed code to your website',
  ],
  pricing: 'Free to try, no credit card required',
};

// Simple intent detection for the assistant
function detectAssistantIntent(message: string): { intent: string; context: string } {
  const lower = message.toLowerCase();

  // Settings-related intents
  if (lower.includes('embed') || lower.includes('script') || lower.includes('install')) {
    return { intent: 'settings', context: 'embed' };
  }
  if (lower.includes('api key') || lower.includes('authentication')) {
    return { intent: 'settings', context: 'apikeys' };
  }
  if (lower.includes('ai setting') || lower.includes('prompt') || lower.includes('welcome message')) {
    return { intent: 'settings', context: 'ai' };
  }
  if (lower.includes('tone') || lower.includes('communication') || lower.includes('language') || lower.includes('greeting')) {
    return { intent: 'settings', context: 'communication' };
  }
  if (lower.includes('booking') || lower.includes('appointment') || lower.includes('schedule') || lower.includes('reservation')) {
    return { intent: 'settings', context: 'booking' };
  }
  if (lower.includes('notification') || lower.includes('email alert') || lower.includes('webhook')) {
    return { intent: 'settings', context: 'notifications' };
  }
  if (lower.includes('knowledge base') || lower.includes('business info') || lower.includes('services') || lower.includes('prices') || lower.includes('opening hours')) {
    return { intent: 'settings', context: 'knowledge' };
  }

  // Navigation intents
  if (lower.includes('dashboard') || lower.includes('overview') || lower.includes('stats')) {
    return { intent: 'navigate', context: 'dashboard' };
  }
  if (lower.includes('chatbot') && (lower.includes('list') || lower.includes('manage') || lower.includes('all') || lower.includes('my'))) {
    return { intent: 'navigate', context: 'chatbots' };
  }
  if (lower.includes('create') && lower.includes('chatbot')) {
    return { intent: 'navigate', context: 'chatbots' };
  }

  // Feature questions
  if (lower.includes('feature') || lower.includes('what can') || lower.includes('capabilities')) {
    return { intent: 'features', context: '' };
  }
  if (lower.includes('how') && (lower.includes('work') || lower.includes('use') || lower.includes('start'))) {
    return { intent: 'howto', context: '' };
  }
  if (lower.includes('price') || lower.includes('cost') || lower.includes('free')) {
    return { intent: 'pricing', context: '' };
  }
  if (lower.includes('help') || lower.includes('support') || lower.includes('stuck') || lower.includes('can\'t find') || lower.includes('cannot find') || lower.includes('where is')) {
    return { intent: 'help', context: '' };
  }

  // General greeting
  if (lower.match(/^(hi|hello|hey|good morning|good afternoon)/)) {
    return { intent: 'greeting', context: '' };
  }

  return { intent: 'general', context: '' };
}

// Generate assistant response
function generateAssistantResponse(message: string, mode: 'landing' | 'dashboard', chatbotId?: string): Message {
  const { intent, context } = detectAssistantIntent(message);

  const baseResponse: Message = {
    role: 'assistant',
    content: '',
    actions: [],
  };

  switch (intent) {
    case 'greeting':
      if (mode === 'landing') {
        baseResponse.content = `Hi there! I'm the SiteBot assistant. I can help you understand how SiteBot works and guide you through creating your AI chatbot.\n\nWould you like to know about our features, how to get started, or something else?`;
        baseResponse.actions = [
          { label: 'Show Features', action: 'link', target: '#features', icon: 'sparkle' },
          { label: 'How It Works', action: 'link', target: '#how', icon: 'help' },
          { label: 'Get Started', action: 'link', target: '#cta', icon: 'arrow' },
        ];
      } else {
        baseResponse.content = `Hello! I'm your SiteBot assistant. I can help you configure your chatbot, find settings, or navigate the dashboard.\n\nWhat would you like to do?`;
        baseResponse.actions = [
          { label: 'Go to Settings', action: 'navigate', target: chatbotId ? `/dashboard/chatbots/${chatbotId}` : '/dashboard/chatbots', icon: 'settings' },
          { label: 'View All Chatbots', action: 'navigate', target: '/dashboard/chatbots', icon: 'list' },
          { label: 'Dashboard Overview', action: 'navigate', target: '/dashboard', icon: 'home' },
        ];
      }
      break;

    case 'settings':
      const setting = APP_KNOWLEDGE.settings[context as keyof typeof APP_KNOWLEDGE.settings];
      if (setting) {
        baseResponse.content = `**${setting.name}**\n\n${setting.description}\n\nWould you like me to take you there?`;
        if (mode === 'dashboard' && chatbotId) {
          baseResponse.actions = [
            { label: `Open ${setting.name}`, action: 'openSection', target: context, icon: 'settings' },
            { label: 'Show All Settings', action: 'navigate', target: `/dashboard/chatbots/${chatbotId}`, icon: 'list' },
          ];
        } else if (mode === 'dashboard') {
          baseResponse.content += '\n\nFirst, select a chatbot to configure its settings.';
          baseResponse.actions = [
            { label: 'View My Chatbots', action: 'navigate', target: '/dashboard/chatbots', icon: 'list' },
          ];
        }
      }
      break;

    case 'navigate':
      const page = APP_KNOWLEDGE.dashboardPages[context as keyof typeof APP_KNOWLEDGE.dashboardPages];
      if (page) {
        baseResponse.content = `Sure! The ${context} page shows ${page.description.toLowerCase()}.`;
        baseResponse.actions = [
          { label: `Go to ${context.charAt(0).toUpperCase() + context.slice(1)}`, action: 'navigate', target: page.path, icon: 'arrow' },
        ];
      }
      break;

    case 'features':
      const featureList = APP_KNOWLEDGE.features.map(f => `- **${f.name}**: ${f.description}`).join('\n');
      baseResponse.content = `Here are SiteBot's main features:\n\n${featureList}`;
      if (mode === 'landing') {
        baseResponse.actions = [
          { label: 'Learn More', action: 'link', target: '#features', icon: 'sparkle' },
          { label: 'Try It Free', action: 'link', target: '#cta', icon: 'arrow' },
        ];
      }
      break;

    case 'howto':
      const steps = APP_KNOWLEDGE.howItWorks.map((s, i) => `${i + 1}. ${s}`).join('\n');
      baseResponse.content = `Getting started with SiteBot is easy:\n\n${steps}\n\nThat's it! Your AI chatbot will be live on your website.`;
      if (mode === 'landing') {
        baseResponse.actions = [
          { label: 'See How It Works', action: 'link', target: '#how', icon: 'help' },
          { label: 'Start Now', action: 'link', target: '#cta', icon: 'arrow' },
        ];
      } else {
        baseResponse.actions = [
          { label: 'Create New Chatbot', action: 'navigate', target: '/dashboard/chatbots', icon: 'plus' },
        ];
      }
      break;

    case 'pricing':
      baseResponse.content = `${APP_KNOWLEDGE.pricing}. You can create your first chatbot right now and see how it works with your website content.`;
      if (mode === 'landing') {
        baseResponse.actions = [
          { label: 'Start Free', action: 'link', target: '#cta', icon: 'arrow' },
        ];
      }
      break;

    case 'help':
      if (mode === 'dashboard') {
        baseResponse.content = `I can help you find what you're looking for! Here are the main areas:\n\n**Settings you can configure:**\n- Embed Code - Add chatbot to your website\n- API Keys - Authentication\n- AI Settings - Welcome message & prompts\n- Communication Style - Tone & language\n- Booking - Appointment settings\n- Notifications - Email/webhook alerts\n- Knowledge Base - Business info\n\nWhat would you like to find?`;
        baseResponse.actions = [
          { label: 'Embed Code', action: 'openSection', target: 'embed', icon: 'code' },
          { label: 'AI Settings', action: 'openSection', target: 'ai', icon: 'brain' },
          { label: 'Booking', action: 'openSection', target: 'booking', icon: 'calendar' },
          { label: 'All Settings', action: 'navigate', target: chatbotId ? `/dashboard/chatbots/${chatbotId}` : '/dashboard/chatbots', icon: 'settings' },
        ];
      } else {
        baseResponse.content = `I'm here to help! What would you like to know about SiteBot?`;
        baseResponse.actions = [
          { label: 'Features', action: 'link', target: '#features', icon: 'sparkle' },
          { label: 'How It Works', action: 'link', target: '#how', icon: 'help' },
          { label: 'Get Started', action: 'link', target: '#cta', icon: 'arrow' },
        ];
      }
      break;

    default:
      // Try to match against all settings keywords
      const lower = message.toLowerCase();
      for (const [key, setting] of Object.entries(APP_KNOWLEDGE.settings)) {
        if (setting.keywords.some(kw => lower.includes(kw))) {
          baseResponse.content = `It sounds like you're looking for **${setting.name}**.\n\n${setting.description}`;
          if (mode === 'dashboard' && chatbotId) {
            baseResponse.actions = [
              { label: `Open ${setting.name}`, action: 'openSection', target: key, icon: 'settings' },
            ];
          } else if (mode === 'dashboard') {
            baseResponse.actions = [
              { label: 'Select a Chatbot', action: 'navigate', target: '/dashboard/chatbots', icon: 'list' },
            ];
          }
          return baseResponse;
        }
      }

      // Default response
      if (mode === 'dashboard') {
        baseResponse.content = `I'm not sure I understood that. I can help you with:\n\n- Finding settings (embed code, AI settings, booking, etc.)\n- Navigating the dashboard\n- Explaining features\n\nTry asking something like "Where can I change the welcome message?" or "How do I set up booking?"`;
        baseResponse.actions = [
          { label: 'Show All Settings', action: 'navigate', target: chatbotId ? `/dashboard/chatbots/${chatbotId}` : '/dashboard/chatbots', icon: 'settings' },
          { label: 'Dashboard Home', action: 'navigate', target: '/dashboard', icon: 'home' },
        ];
      } else {
        baseResponse.content = `I can help you learn about SiteBot! Try asking about features, how it works, or pricing.`;
        baseResponse.actions = [
          { label: 'Show Features', action: 'link', target: '#features', icon: 'sparkle' },
          { label: 'How It Works', action: 'link', target: '#how', icon: 'help' },
        ];
      }
  }

  return baseResponse;
}

// Icon components
const icons = {
  sparkle: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
  help: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  arrow: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  settings: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  list: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  home: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  code: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  brain: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54"/></svg>,
  calendar: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
};

export default function SiteBotAssistant({ mode, chatbotId, onNavigateToSection, hasDemoChatbot, onSwitchToDemo }: SiteBotAssistantProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        role: 'assistant',
        content: mode === 'landing'
          ? "Hi! I'm the SiteBot assistant. I can help you understand how SiteBot works and guide you through creating your AI chatbot. What would you like to know?"
          : "Hi! I'm here to help you navigate and configure your chatbot. Ask me anything or use the quick actions below.",
        actions: mode === 'landing' ? [
          { label: 'Features', action: 'link', target: '#features', icon: 'sparkle' },
          { label: 'How It Works', action: 'link', target: '#how', icon: 'help' },
          { label: 'Get Started', action: 'link', target: '#cta', icon: 'arrow' },
        ] : [
          { label: 'Find a Setting', action: 'openSection', target: 'help', icon: 'settings' },
          { label: 'All Chatbots', action: 'navigate', target: '/dashboard/chatbots', icon: 'list' },
        ],
      };
      setMessages([welcomeMessage]);
    }
  }, [mode, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle sending message
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    setInput('');
    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);

    // Simulate typing delay
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    const response = generateAssistantResponse(text, mode, chatbotId);
    setIsTyping(false);
    setMessages(prev => [...prev, response]);
  };

  // Handle action button click
  const handleAction = (action: ActionButton) => {
    switch (action.action) {
      case 'navigate':
        router.push(action.target);
        setIsOpen(false);
        break;
      case 'openSection':
        if (onNavigateToSection) {
          onNavigateToSection(action.target);
          setIsOpen(false);
        } else if (chatbotId) {
          // Navigate to chatbot page with section hash
          router.push(`/dashboard/chatbots/${chatbotId}?section=${action.target}`);
          setIsOpen(false);
        }
        break;
      case 'link':
        if (action.target.startsWith('#')) {
          const element = document.querySelector(action.target);
          element?.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.open(action.target, '_blank');
        }
        setIsOpen(false);
        break;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderIcon = (iconName?: string) => {
    const IconComponent = icons[iconName as keyof typeof icons];
    return IconComponent ? <IconComponent /> : null;
  };

  return (
    <>
      {/* FAB Button */}
      {!isOpen && (
        <button
          className={styles.fab}
          onClick={() => setIsOpen(true)}
          aria-label="Open SiteBot Assistant"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span className={styles.fabBadge}>?</span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className={styles.panel}>
          <header className={styles.header}>
            <div className={styles.headerInfo}>
              <div className={styles.headerAvatar}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div>
                <h3>SiteBot Assistant</h3>
                <span>Ask me anything</span>
              </div>
            </div>
            <div className={styles.headerActions}>
              {hasDemoChatbot && onSwitchToDemo && (
                <button
                  className={styles.switchBtn}
                  onClick={onSwitchToDemo}
                  title="Switch to your demo chatbot"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 1l4 4-4 4"/>
                    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                    <path d="M7 23l-4-4 4-4"/>
                    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                  </svg>
                  Demo
                </button>
              )}
              <button
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            </div>
          </header>

          <div className={styles.messages}>
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
                <div className={styles.bubble}>
                  <p dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />

                  {msg.actions && msg.actions.length > 0 && (
                    <div className={styles.actions}>
                      {msg.actions.map((action, j) => (
                        <button
                          key={j}
                          className={styles.actionBtn}
                          onClick={() => handleAction(action)}
                        >
                          {renderIcon(action.icon)}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.bubble}>
                  <div className={styles.typing}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputArea}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about features, settings..."
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={styles.sendBtn}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
