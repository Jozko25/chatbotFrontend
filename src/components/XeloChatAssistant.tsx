'use client';

import { useState, useRef, useEffect, CSSProperties } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './XeloChatAssistant.module.css';

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

interface XeloChatAssistantProps {
  mode: 'landing' | 'dashboard';
  chatbotId?: string;
  onNavigateToSection?: (sectionId: string) => void;
  hasDemoChatbot?: boolean;
  onSwitchToDemo?: () => void;
}

// Comprehensive App Knowledge Base
const APP_KNOWLEDGE = {
  name: 'XeloChat',
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
    embed: {
      name: 'Embed Code',
      description: 'Copy the script tag to add the chatbot widget to your website. Just paste it before the closing </body> tag.',
      details: 'The embed code includes your chatbot ID and API key. Works on any website - WordPress, Shopify, Wix, custom sites, etc.',
      keywords: ['embed', 'code', 'script', 'install', 'website', 'snippet', 'widget', 'add', 'put', 'place', 'integration', 'html', 'tag', 'copy', 'paste'],
      path: 'Settings → Embed Code'
    },
    apikeys: {
      name: 'API Keys',
      description: 'Create and manage API keys for your chatbot. Each key can be restricted to specific domains for security.',
      details: 'Allowed domains restrict which websites can use your API key. Leave empty to allow all domains, or add specific domains like "example.com, www.example.com" to restrict access. This prevents unauthorized use of your chatbot.',
      keywords: ['api', 'key', 'keys', 'authentication', 'access', 'token', 'domain', 'domains', 'allowed', 'restrict', 'security', 'cors', 'origin', 'whitelist', 'authorize', 'permission', 'credentials'],
      path: 'Settings → API Keys'
    },
    ai: {
      name: 'AI Settings',
      description: 'Customize how your chatbot behaves: welcome message, system prompt, and additional knowledge.',
      details: 'Welcome message is what users see when they open the chat. System prompt (advanced) overrides the default AI behavior. Additional knowledge lets you add info not captured by the scraper - like current promotions, policies, or FAQs.',
      keywords: ['ai', 'prompt', 'welcome', 'message', 'custom', 'knowledge', 'behavior', 'personality', 'instruction', 'system', 'greeting', 'first', 'response', 'train', 'teach', 'learn'],
      path: 'Settings → AI Settings'
    },
    communication: {
      name: 'Communication Style',
      description: 'Set the chatbot\'s tone (professional, friendly, casual, or concise) and response language.',
      details: 'Tone options: Professional (formal, business-like), Friendly (warm, conversational), Casual (relaxed, informal), Concise (brief, to-the-point). Language can auto-detect or be set to Slovak, Czech, English, German, Hungarian, or Polish.',
      keywords: ['tone', 'style', 'language', 'greeting', 'friendly', 'professional', 'casual', 'concise', 'formal', 'informal', 'voice', 'personality', 'speak', 'respond', 'communication'],
      path: 'Settings → Communication Style'
    },
    pages: {
      name: 'Page Restrictions',
      description: 'Control which pages on your website display the chatbot widget.',
      details: 'Three modes: Show on all pages (default), Only show on specific pages (whitelist), Hide on specific pages (blacklist). Use URL patterns like /contact or /blog/* (wildcard matches any path).',
      keywords: ['page', 'pages', 'restriction', 'url', 'display', 'show', 'hide', 'exclude', 'include', 'where', 'visible', 'appear', 'specific', 'certain', 'only', 'except', 'block', 'allow', 'path', 'route'],
      path: 'Settings → Page Restrictions'
    },
    booking: {
      name: 'Booking & Appointments',
      description: 'Enable customers to book appointments through the chatbot. Choose which info to collect.',
      details: 'When enabled, the chatbot can collect: customer name (required), email, phone, service type, preferred date/time, and notes. You can customize the booking prompt message too.',
      keywords: ['booking', 'appointment', 'schedule', 'reservation', 'calendar', 'book', 'reserve', 'date', 'time', 'slot', 'availability', 'meeting', 'form', 'collect', 'customer', 'lead'],
      path: 'Settings → Booking & Appointments'
    },
    notifications: {
      name: 'Notifications',
      description: 'Get notified when customers submit booking requests via email or webhook.',
      details: 'Email notifications send you a formatted message with booking details. Webhook sends a POST request to your URL (great for CRM/calendar integrations like Zapier, Make, or custom systems).',
      keywords: ['notification', 'notifications', 'email', 'webhook', 'alert', 'notify', 'send', 'receive', 'crm', 'integration', 'zapier', 'make', 'automate', 'trigger'],
      path: 'Settings → Notifications'
    },
    knowledge: {
      name: 'Knowledge Base',
      description: 'Edit the business information the chatbot knows: name, contact details, services, prices, and hours.',
      details: 'This is the core data your chatbot uses to answer questions. Edit business name, phone, email, address, opening hours, and services with prices. Changes take effect immediately.',
      keywords: ['knowledge', 'business', 'services', 'prices', 'hours', 'info', 'data', 'content', 'edit', 'update', 'change', 'modify', 'scraped', 'contact', 'address', 'phone', 'email', 'opening', 'products', 'offerings'],
      path: 'Settings → Knowledge Base'
    },
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
  pricing: 'Free plan includes 50 messages and 1 chatbot. Paid plans remove branding and unlock bookings. See /pricing for details.',
};

// Smart intent detection - matches user queries to the right settings
function detectAssistantIntent(message: string): { intent: string; context: string; confidence: 'high' | 'medium' | 'low' } {
  const lower = message.toLowerCase();

  // Direct keyword matching for each setting (order matters - more specific first)

  // API Keys - check for domain/security related queries
  if (lower.includes('allowed domain') || lower.includes('domain restriction') || lower.includes('restrict domain') ||
      lower.includes('whitelist') || lower.includes('cors') || lower.includes('origin')) {
    return { intent: 'settings', context: 'apikeys', confidence: 'high' };
  }
  if ((lower.includes('api') && lower.includes('key')) || lower.includes('authentication') || lower.includes('credentials')) {
    return { intent: 'settings', context: 'apikeys', confidence: 'high' };
  }

  // Embed code
  if (lower.includes('embed') || lower.includes('script') || lower.includes('install') ||
      lower.includes('add to website') || lower.includes('put on site') || lower.includes('widget code')) {
    return { intent: 'settings', context: 'embed', confidence: 'high' };
  }

  // AI Settings
  if (lower.includes('welcome message') || lower.includes('first message') || lower.includes('greeting message')) {
    return { intent: 'settings', context: 'ai', confidence: 'high' };
  }
  if (lower.includes('system prompt') || lower.includes('custom prompt') || lower.includes('ai behavior') ||
      lower.includes('bot personality') || lower.includes('custom knowledge') || lower.includes('train')) {
    return { intent: 'settings', context: 'ai', confidence: 'high' };
  }
  if (lower.includes('ai setting')) {
    return { intent: 'settings', context: 'ai', confidence: 'high' };
  }

  // Communication Style
  if (lower.includes('tone') || lower.includes('communication style') || lower.includes('response language') ||
      (lower.includes('language') && !lower.includes('programming'))) {
    return { intent: 'settings', context: 'communication', confidence: 'high' };
  }
  if ((lower.includes('professional') || lower.includes('friendly') || lower.includes('casual') || lower.includes('concise')) &&
      (lower.includes('mode') || lower.includes('style') || lower.includes('tone') || lower.includes('respond'))) {
    return { intent: 'settings', context: 'communication', confidence: 'high' };
  }

  // Page Restrictions
  if ((lower.includes('page') || lower.includes('url') || lower.includes('path')) &&
      (lower.includes('restriction') || lower.includes('hide') || lower.includes('show') ||
       lower.includes('display') || lower.includes('appear') || lower.includes('visible') ||
       lower.includes('exclude') || lower.includes('include') || lower.includes('only') || lower.includes('specific'))) {
    return { intent: 'settings', context: 'pages', confidence: 'high' };
  }
  if (lower.includes('where') && (lower.includes('widget') || lower.includes('chatbot') || lower.includes('chat'))) {
    return { intent: 'settings', context: 'pages', confidence: 'medium' };
  }

  // Booking
  if (lower.includes('booking') || lower.includes('appointment') || lower.includes('schedule') ||
      lower.includes('reservation') || lower.includes('book a') || lower.includes('lead capture')) {
    return { intent: 'settings', context: 'booking', confidence: 'high' };
  }

  // Notifications
  if (lower.includes('notification') || lower.includes('webhook') || lower.includes('email alert') ||
      (lower.includes('email') && (lower.includes('when') || lower.includes('booking') || lower.includes('notify')))) {
    return { intent: 'settings', context: 'notifications', confidence: 'high' };
  }
  if (lower.includes('zapier') || lower.includes('integration') || lower.includes('crm')) {
    return { intent: 'settings', context: 'notifications', confidence: 'medium' };
  }

  // Knowledge Base
  if (lower.includes('knowledge base') || lower.includes('business info') || lower.includes('scraped data') ||
      lower.includes('edit services') || lower.includes('update prices') || lower.includes('opening hours') ||
      lower.includes('edit data') || lower.includes('change info')) {
    return { intent: 'settings', context: 'knowledge', confidence: 'high' };
  }

  // Navigation intents
  if (lower.includes('dashboard') || lower.includes('overview') || lower.includes('stats') || lower.includes('analytics')) {
    return { intent: 'navigate', context: 'dashboard', confidence: 'high' };
  }
  if (lower.includes('chatbot') && (lower.includes('list') || lower.includes('manage') || lower.includes('all') || lower.includes('my') || lower.includes('view'))) {
    return { intent: 'navigate', context: 'chatbots', confidence: 'high' };
  }
  if (lower.includes('create') && (lower.includes('chatbot') || lower.includes('new') || lower.includes('bot'))) {
    return { intent: 'navigate', context: 'chatbots', confidence: 'high' };
  }

  // Feature questions
  if (lower.includes('feature') || lower.includes('what can') || lower.includes('capabilities') || lower.includes('what does')) {
    return { intent: 'features', context: '', confidence: 'high' };
  }

  // How-to questions
  if (lower.includes('how') && (lower.includes('work') || lower.includes('use') || lower.includes('start') || lower.includes('get started') || lower.includes('begin'))) {
    return { intent: 'howto', context: '', confidence: 'high' };
  }

  // Pricing
  if (lower.includes('price') || lower.includes('pricing') || lower.includes('cost') || lower.includes('free') || lower.includes('plan') || lower.includes('subscription')) {
    return { intent: 'pricing', context: '', confidence: 'high' };
  }

  // Help/support
  if (lower.includes('help') || lower.includes('support') || lower.includes('stuck') || lower.includes('can\'t find') ||
      lower.includes('cannot find') || lower.includes('where is') || lower.includes('how do i')) {
    return { intent: 'help', context: '', confidence: 'medium' };
  }

  // General greeting
  if (lower.match(/^(hi|hello|hey|good morning|good afternoon|good evening|yo|sup|hiya)/)) {
    return { intent: 'greeting', context: '', confidence: 'high' };
  }

  // Thanks
  if (lower.match(/^(thanks|thank you|thx|ty|cheers|appreciate)/)) {
    return { intent: 'thanks', context: '', confidence: 'high' };
  }

  return { intent: 'general', context: '', confidence: 'low' };
}

// Generate natural, professional responses
function generateAssistantResponse(message: string, mode: 'landing' | 'dashboard', chatbotId?: string): Message {
  const { intent, context, confidence } = detectAssistantIntent(message);

  const baseResponse: Message = {
    role: 'assistant',
    content: '',
    actions: [],
  };

  // Helper to add action button that navigates to the exact settings section
  const addSettingsAction = (settingKey: string, settingName: string) => {
    if (mode === 'dashboard' && chatbotId) {
      baseResponse.actions = [{
        label: `Go to ${settingName}`,
        action: 'navigate',
        target: `/dashboard/chatbots/${chatbotId}?section=${settingKey}&highlight=true`,
        icon: 'arrow'
      }];
    }
  };

  switch (intent) {
    case 'greeting':
      if (mode === 'landing') {
        baseResponse.content = `Hello! I can help you learn about XeloChat. Ask me anything about features, pricing, or how it works.`;
      } else {
        baseResponse.content = `Hello! I can help you find any setting or answer questions about configuring your chatbot.`;
      }
      break;

    case 'thanks':
      const thanksResponses = [
        `Happy to help. Let me know if you need anything else.`,
        `You're welcome. I'm here if you have more questions.`,
        `Anytime. Feel free to ask if something else comes up.`,
      ];
      baseResponse.content = thanksResponses[Math.floor(Math.random() * thanksResponses.length)];
      break;

    case 'settings':
      const setting = APP_KNOWLEDGE.settings[context as keyof typeof APP_KNOWLEDGE.settings];
      if (setting) {
        // Build a professional response with full details
        baseResponse.content = `**${setting.name}**\n\n${setting.description}`;

        // Add the detailed info if available
        if (setting.details) {
          baseResponse.content += `\n\n${setting.details}`;
        }

        // Add location at the end
        baseResponse.content += `\n\nLocation: **${setting.path}**`;

        // Add action button if we can navigate there
        if (mode === 'dashboard' && chatbotId) {
          addSettingsAction(context, setting.name);
        } else if (mode === 'dashboard') {
          baseResponse.content += `\n\nPlease select a chatbot first to access this setting.`;
          baseResponse.actions = [{ label: 'View Chatbots', action: 'navigate', target: '/dashboard/chatbots', icon: 'list' }];
        }
      }
      break;

    case 'navigate':
      const page = APP_KNOWLEDGE.dashboardPages[context as keyof typeof APP_KNOWLEDGE.dashboardPages];
      if (page) {
        baseResponse.content = `The ${context} page shows ${page.description.toLowerCase()}.`;
        baseResponse.actions = [{ label: `Go to ${context.charAt(0).toUpperCase() + context.slice(1)}`, action: 'navigate', target: page.path, icon: 'arrow' }];
      }
      break;

    case 'features':
      const featureList = APP_KNOWLEDGE.features.map(f => `- **${f.name}**: ${f.description}`).join('\n');
      baseResponse.content = `XeloChat includes the following features:\n\n${featureList}`;
      if (mode === 'landing') {
        baseResponse.actions = [{ label: 'Get Started', action: 'link', target: '#cta', icon: 'arrow' }];
      }
      break;

    case 'howto':
      const steps = APP_KNOWLEDGE.howItWorks.map((s, i) => `${i + 1}. ${s}`).join('\n');
      baseResponse.content = `Getting started is straightforward:\n\n${steps}\n\nYour AI chatbot will be live and answering questions immediately.`;
      if (mode === 'landing') {
        baseResponse.actions = [{ label: 'Get Started', action: 'link', target: '#cta', icon: 'arrow' }];
      } else {
        baseResponse.actions = [{ label: 'Create Chatbot', action: 'navigate', target: '/dashboard/chatbots', icon: 'plus' }];
      }
      break;

    case 'pricing':
      baseResponse.content = `${APP_KNOWLEDGE.pricing}`;
      if (mode === 'landing') {
        baseResponse.actions = [{ label: 'Start Free', action: 'link', target: '#cta', icon: 'arrow' }];
      }
      break;

    case 'help':
      if (mode === 'dashboard') {
        baseResponse.content = `Available settings:\n\n` +
          `- **Embed Code**: Script to add the chatbot to your site\n` +
          `- **API Keys**: Manage keys and allowed domains\n` +
          `- **AI Settings**: Welcome message, system prompt, knowledge\n` +
          `- **Communication Style**: Tone and language preferences\n` +
          `- **Page Restrictions**: Control which pages show the widget\n` +
          `- **Booking**: Customer appointment booking\n` +
          `- **Notifications**: Email and webhook alerts\n` +
          `- **Knowledge Base**: Business info, services, prices\n\n` +
          `Ask about any of these for more details.`;
      } else {
        baseResponse.content = `I can help with questions about XeloChat. Common topics: features, how it works, and pricing.`;
      }
      break;

    default:
      // Fallback: try to match against all settings keywords
      const lower = message.toLowerCase();
      for (const [key, setting] of Object.entries(APP_KNOWLEDGE.settings)) {
        if (setting.keywords.some(kw => lower.includes(kw))) {
          baseResponse.content = `That's in **${setting.name}**.\n\n${setting.description}`;
          if (setting.details) {
            baseResponse.content += `\n\n${setting.details}`;
          }
          baseResponse.content += `\n\nLocation: **${setting.path}**`;

          if (mode === 'dashboard' && chatbotId) {
            addSettingsAction(key, setting.name);
          } else if (mode === 'dashboard') {
            baseResponse.content += `\n\nPlease select a chatbot first to access this.`;
            baseResponse.actions = [{ label: 'View Chatbots', action: 'navigate', target: '/dashboard/chatbots', icon: 'list' }];
          }
          return baseResponse;
        }
      }

      // True fallback - didn't understand
      if (mode === 'dashboard') {
        baseResponse.content = `I couldn't find what you're looking for. Try asking about a specific setting like "allowed domains", "welcome message", "page restrictions", or "booking". Type "help" to see all available settings.`;
      } else {
        baseResponse.content = `I'm not sure I understand. Try asking about XeloChat's features, how it works, or pricing.`;
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

// Storage key for persistence
const STORAGE_KEY = 'xelochat_assistant_state';

// Helper to create welcome message based on mode
function createWelcomeMessage(mode: 'landing' | 'dashboard'): Message {
  return {
    role: 'assistant',
    content: mode === 'landing'
      ? "Hello! I can help you learn about XeloChat. Ask me about features, pricing, or how to get started."
      : "Hello! I can help you find settings or configure your chatbot. Just ask.",
    actions: [],
  };
}

export default function XeloChatAssistant({ mode, chatbotId, onNavigateToSection, hasDemoChatbot, onSwitchToDemo }: XeloChatAssistantProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load persisted state on mount (runs only once)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if stored data is recent (within 24 hours)
        const isRecent = parsed.timestamp && (Date.now() - parsed.timestamp) < 24 * 60 * 60 * 1000;
        if (isRecent && parsed.messages && Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          setMessages(parsed.messages);
          setIsOpen(parsed.isOpen ?? false);
          setInitialized(true);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load assistant state:', e);
    }
    
    // Initialize with welcome message if no stored state
    setMessages([createWelcomeMessage(mode)]);
    setInitialized(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Persist state when it changes
  useEffect(() => {
    if (initialized && messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          messages,
          isOpen,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error('Failed to save assistant state:', e);
      }
    }
  }, [messages, isOpen, initialized]);

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

  // Clear conversation and reset to welcome message
  const handleClearConversation = () => {
    setMessages([createWelcomeMessage(mode)]);
    localStorage.removeItem(STORAGE_KEY);
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
          // Navigate to chatbot page with section and highlight params
          router.push(`/dashboard/chatbots/${chatbotId}?section=${action.target}&highlight=true`);
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
      <button
        className={`${styles.fab} ${isOpen ? styles.hidden : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open XeloChat Assistant"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path 
            d="M8 10.5h8M8 14.5h5" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <path 
            d="M12 3C6.5 3 2 6.8 2 11.5c0 2.4 1.2 4.6 3.1 6.1l-.6 3.9 4.3-2.2c1 .3 2.1.4 3.2.4 5.5 0 10-3.8 10-8.5S17.5 3 12 3z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Chat Panel */}
      <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
        <header className={styles.header}>
          <div className={styles.headerInfo}>
            <h3>XeloChat Assistant</h3>
            <span>Ask me anything</span>
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
              className={styles.clearBtn}
              onClick={handleClearConversation}
              title="Clear conversation"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
            </button>
            <button
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
              aria-label="Minimize assistant"
              title="Minimize"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
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
    </>
  );
}
