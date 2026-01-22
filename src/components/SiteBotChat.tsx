'use client';

import { useState, useRef, useEffect, CSSProperties } from 'react';
import styles from './SiteBotChat.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// SiteBot Knowledge Base - Everything about our product
const SITEBOT_KNOWLEDGE = {
  name: 'SiteBot',
  tagline: 'AI-powered chatbots for any website',
  description: 'SiteBot crawls your website, understands your content, and creates a smart AI assistant that can answer customer questions 24/7.',

  features: [
    { name: 'Smart Crawling', description: 'Automatically scans up to 25 pages and extracts products, services, pricing, and FAQs from your website.' },
    { name: 'Natural Conversations', description: 'Powered by GPT-4, your chatbot understands context and provides accurate, helpful answers to visitors.' },
    { name: 'Easy Integration', description: 'One script tag to embed anywhere. Works on any website - Webflow, Shopify, WordPress, Squarespace, or custom sites. No coding required.' },
    { name: 'Multilingual Support', description: 'Automatically responds in the customer\'s language - supports Slovak, Czech, English, German, Hungarian, Polish, Spanish, and more.' },
    { name: 'Brand Customization', description: 'White-label ready. Customize colors, name, and styling to match your brand identity perfectly.' },
    { name: 'Privacy First', description: 'Your data stays secure. We only read public website content to train your chatbot. No sensitive data is stored.' },
    { name: 'Booking System', description: 'Built-in appointment booking feature. Collect customer name, email, phone, preferred date/time, and service requests.' },
    { name: 'Notifications', description: 'Get email and webhook notifications when customers make booking requests. Integrate with your CRM or calendar.' },
  ],

  howItWorks: [
    { step: 1, title: 'Enter your URL', description: 'Paste your website address and we\'ll start crawling immediately.' },
    { step: 2, title: 'AI processes content', description: 'We extract and understand your products, services, FAQs, and business information.' },
    { step: 3, title: 'Deploy your chatbot', description: 'Copy the embed code and add it to your website. That\'s it - you\'re live!' },
  ],

  pricing: {
    trial: 'Free plan includes 50 messages and 1 chatbot',
    info: 'Upgrade when you need bookings and higher limits. See /pricing for details.',
  },

  useCases: [
    { industry: 'E-commerce', example: 'Answer product questions, check availability, recommend items' },
    { industry: 'Healthcare', example: 'Share opening hours, services, book appointments' },
    { industry: 'SaaS', example: 'Explain pricing plans, features, help with onboarding' },
    { industry: 'Car Dealerships', example: 'Compare vehicles, share specs, schedule test drives' },
    { industry: 'Restaurants', example: 'Share menu, hours, take reservations' },
    { industry: 'Real Estate', example: 'Answer property questions, schedule viewings' },
  ],

  platforms: ['Webflow', 'Shopify', 'WordPress', 'Squarespace', 'Wix', 'Custom websites'],

  setup: {
    time: '90 seconds',
    steps: 'Just paste your URL and we handle the rest',
  },
};

// Generate response based on user message
function generateResponse(message: string): string {
  const lower = message.toLowerCase();

  // Greetings
  if (lower.match(/^(hi|hello|hey|good morning|good afternoon|good evening|ahoj|dobrý|nazdar)/i)) {
    return `Hello! 👋 I'm the SiteBot assistant. I can help you learn about our AI chatbot platform.\n\nYou can ask me about:\n• How SiteBot works\n• Features and capabilities\n• Pricing and getting started\n• Integration with your website\n\nWhat would you like to know?`;
  }

  // How it works
  if (lower.includes('how') && (lower.includes('work') || lower.includes('funguje') || lower.includes('funkcuje'))) {
    const steps = SITEBOT_KNOWLEDGE.howItWorks.map(s => `${s.step}. **${s.title}** - ${s.description}`).join('\n');
    return `Here's how SiteBot works:\n\n${steps}\n\nThe whole process takes about ${SITEBOT_KNOWLEDGE.setup.time}. Would you like to try it?`;
  }

  // Features
  if (lower.includes('feature') || lower.includes('funkci') || lower.includes('what can') || lower.includes('čo vie') || lower.includes('capabilities')) {
    const features = SITEBOT_KNOWLEDGE.features.slice(0, 6).map(f => `• **${f.name}**: ${f.description}`).join('\n');
    return `SiteBot comes with powerful features:\n\n${features}\n\nWould you like to know more about any specific feature?`;
  }

  // Pricing
  if (lower.includes('price') || lower.includes('cost') || lower.includes('pricing') || lower.includes('cena') || lower.includes('stojí') || lower.includes('free')) {
    return `**Pricing**\n\n${SITEBOT_KNOWLEDGE.pricing.trial}\n\n${SITEBOT_KNOWLEDGE.pricing.info}\n\nJust scroll up and enter your website URL to get started!`;
  }

  // Languages / Multilingual
  if (lower.includes('language') || lower.includes('jazyk') || lower.includes('multilingual') || lower.includes('slovak') || lower.includes('czech') || lower.includes('german')) {
    return `**Multilingual Support**\n\nSiteBot automatically detects and responds in your customer's language. We support:\n\n• English\n• Slovak\n• Czech\n• German\n• Hungarian\n• Polish\n• Spanish\n• And many more!\n\nThe chatbot matches the visitor's language automatically.`;
  }

  // Integration / Embed
  if (lower.includes('integrat') || lower.includes('embed') || lower.includes('install') || lower.includes('add to') || lower.includes('website') || lower.includes('wordpress') || lower.includes('shopify')) {
    const platforms = SITEBOT_KNOWLEDGE.platforms.join(', ');
    return `**Easy Integration**\n\nSiteBot works with any website platform:\n${platforms}\n\n**How to add it:**\n1. Create your chatbot by entering your URL\n2. Copy the embed code (one line of JavaScript)\n3. Paste it into your website's HTML\n\nNo coding skills required! The chatbot will appear as a floating widget on your site.`;
  }

  // Booking / Appointments
  if (lower.includes('book') || lower.includes('appointment') || lower.includes('rezerv') || lower.includes('objedna') || lower.includes('schedule')) {
    return `**Booking System**\n\nSiteBot includes a built-in booking feature:\n\n• Collect customer information (name, email, phone)\n• Let customers choose preferred date and time\n• Specify which service they want\n• Add notes or special requests\n\n**Notifications:**\nGet instant email alerts when someone makes a booking. You can also set up webhooks to integrate with your CRM or calendar system.`;
  }

  // Customization
  if (lower.includes('custom') || lower.includes('brand') || lower.includes('color') || lower.includes('style') || lower.includes('look') || lower.includes('farb')) {
    return `**Customization Options**\n\nMake SiteBot match your brand:\n\n• **Bot Name**: Give it your company name\n• **Tagline**: Custom subtitle\n• **Primary Color**: Match your brand colors\n• **Panel Background**: Light or dark themes\n• **Chat Bubbles**: Custom colors for user and assistant messages\n\nYou can customize everything in the dashboard after creating your chatbot.`;
  }

  // Use cases / Industries
  if (lower.includes('use case') || lower.includes('industr') || lower.includes('example') || lower.includes('business') || lower.includes('who')) {
    const cases = SITEBOT_KNOWLEDGE.useCases.map(c => `• **${c.industry}**: ${c.example}`).join('\n');
    return `**Built for Every Business**\n\nSiteBot adapts to any industry:\n\n${cases}\n\nNo matter your business, SiteBot learns from your website content and helps your customers.`;
  }

  // Setup time
  if (lower.includes('long') || lower.includes('time') || lower.includes('quick') || lower.includes('fast') || lower.includes('minute')) {
    return `**Quick Setup**\n\nSiteBot takes about **90 seconds** to set up:\n\n1. Paste your website URL (5 seconds)\n2. We crawl up to 25 pages automatically (60-90 seconds)\n3. Copy the embed code to your site (10 seconds)\n\nThat's it! Your AI chatbot is ready to help customers 24/7.`;
  }

  // Crawling / Pages
  if (lower.includes('crawl') || lower.includes('scan') || lower.includes('page') || lower.includes('content') || lower.includes('extract')) {
    return `**Smart Crawling**\n\nWhen you enter your URL, SiteBot:\n\n• Automatically discovers and crawls up to **25 pages**\n• Extracts products, services, and pricing\n• Finds FAQs and common questions\n• Captures contact info and opening hours\n• Understands your business context\n\nThe AI then uses this information to answer customer questions accurately.`;
  }

  // Getting started
  if (lower.includes('start') || lower.includes('begin') || lower.includes('try') || lower.includes('create') || lower.includes('začať') || lower.includes('skúsiť')) {
    return `**Get Started in 90 Seconds**\n\n1. Scroll up to the hero section\n2. Enter your website URL in the input field\n3. Click "Create Chatbot"\n4. Watch as we crawl and analyze your site\n5. Copy the embed code to your website\n\n${SITEBOT_KNOWLEDGE.pricing.trial}. Give it a try!`;
  }

  // What is SiteBot
  if (lower.includes('what is') || lower.includes('čo je') || lower.includes('about') || lower.includes('tell me')) {
    return `**What is SiteBot?**\n\n${SITEBOT_KNOWLEDGE.description}\n\n**Key Benefits:**\n• 24/7 customer support automation\n• Answers based on YOUR website content\n• No AI hallucinations - only factual info\n• Works in any language\n• Easy 90-second setup\n\nWant to see how it works?`;
  }

  // Default response
  return `I can help you learn about SiteBot! Here are some things you can ask me:\n\n• "How does SiteBot work?"\n• "What features does it have?"\n• "How much does it cost?"\n• "How do I add it to my website?"\n• "What languages are supported?"\n• "Tell me about the booking system"\n\nOr just scroll up and enter your website URL to try it yourself! 🚀`;
}

interface SiteBotChatProps {
  floating?: boolean;
}

export default function SiteBotChat({ floating = true }: SiteBotChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Welcome! 👋 I'm the SiteBot assistant.\n\nI can help you understand how SiteBot works, answer questions about features, pricing, and help you get started.\n\nWhat would you like to know?`
      }]);
    }
  }, [messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    setInput('');
    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);

    // Simulate typing
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800));

    const response = generateResponse(text);
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleContainerClick = () => {
    if (floating && collapsed) {
      setCollapsed(false);
    }
  };

  const themeVars: CSSProperties = {
    ['--chat-primary' as string]: '#3b82f6',
    ['--chat-bg' as string]: '#ffffff',
    ['--chat-text' as string]: '#1e293b',
    ['--chat-muted' as string]: '#64748b',
    ['--chat-user' as string]: '#3b82f6',
    ['--chat-user-text' as string]: '#ffffff',
    ['--chat-assistant' as string]: '#f8fafc',
  };

  // FAB when closed
  if (floating && !isOpen) {
    return (
      <button
        className={styles.fab}
        onClick={() => setIsOpen(true)}
        aria-label="Open SiteBot chat"
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
    );
  }

  const containerClass = `${styles.container} ${floating ? styles.floating : ''} ${collapsed ? styles.collapsed : ''}`;

  return (
    <div className={containerClass} onClick={handleContainerClick} style={themeVars}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.headerAvatar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <h1>SiteBot</h1>
            <p className={styles.headerSub}>AI-powered assistant</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          {floating && (
            <>
              <button
                className={styles.actionButton}
                onClick={(e) => {
                  e.stopPropagation();
                  setCollapsed(prev => !prev);
                }}
                aria-label={collapsed ? 'Expand chat' : 'Minimize chat'}
                title={collapsed ? 'Expand' : 'Minimize'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <button
                className={styles.actionButton}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                aria-label="Close chat"
                title="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </header>

      <div className={`${styles.body} ${collapsed ? styles.bodyCollapsed : ''}`}>
        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.message} ${msg.role === 'user' ? styles.user : styles.assistant}`}
            >
              <div
                className={styles.bubble}
                dangerouslySetInnerHTML={{
                  __html: msg.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br/>')
                }}
              />
            </div>
          ))}

          {isTyping && (
            <div className={`${styles.message} ${styles.assistant}`}>
              <div className={styles.bubble}>
                <div className={styles.typing}>
                  <span />
                  <span />
                  <span />
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
            placeholder="Ask anything..."
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={styles.sendButton}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>

        <div className={styles.legalBar}>
          <span>AI responses are informational and may be imperfect. Confirm details before acting.</span>
          <a className={styles.legalLink} href="#terms">Terms</a>
        </div>
      </div>
    </div>
  );
}
