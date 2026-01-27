'use client';

import { useState, useRef, useEffect, CSSProperties } from 'react';
import styles from './XeloChatChat.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  showBookingButton?: boolean;
}

interface BookingData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
}

interface XeloChatChatProps {
  floating?: boolean;
  onSwitchToDemo?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// System prompt for the XeloChat landing page assistant
const SYSTEM_PROMPT = `You are the XeloChat assistant on the XeloChat landing page. XeloChat is an AI-powered chatbot platform that helps businesses automate customer support.

About XeloChat:
- Crawls websites automatically (up to 25 pages) to understand business content
- Creates AI chatbots that answer customer questions 24/7
- Supports multiple languages (English, Slovak, Czech, German, Spanish, etc.)
- Easy integration with one script tag - works on any website
- Customizable branding (colors, name, styling)
- Built-in booking system with Google Calendar integration
- 90-second setup, free trial available

You have access to tools:
- show_booking_form: Use this when the user wants to book a demo, schedule an appointment, make a reservation, or anything related to booking/scheduling

Be helpful, concise, and friendly. When users want to book something, use the show_booking_form tool.`;

export default function XeloChatChat({
  floating = true,
  onSwitchToDemo,
  open,
  onOpenChange,
}: XeloChatChatProps) {
  const [isOpen, setIsOpen] = useState(open ?? false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    service: '',
    preferredDate: '',
    preferredTime: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarRefreshing, setIsCalendarRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const setOpen = (next: boolean) => {
    setIsOpen(next);
    onOpenChange?.(next);
  };

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Welcome! I'm the XeloChat assistant.\n\nI can help you understand how XeloChat works, answer questions about features, pricing, and help you get started.\n\nWant to see the booking feature in action? Just ask me to book a demo!\n\nWhat would you like to know?`
      }]);
    }
  }, [messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Function to refresh the calendar iframe with loading overlay
  const refreshCalendar = () => {
    setIsCalendarRefreshing(true);
    const calendarWrapper = document.querySelector('[data-calendar-wrapper]');
    if (calendarWrapper) {
      calendarWrapper.classList.add('refreshing');
    }

    setTimeout(() => {
      const calendarIframe = document.getElementById('xelochat-calendar') as HTMLIFrameElement;
      if (calendarIframe) {
        const src = calendarIframe.src;
        calendarIframe.src = '';
        setTimeout(() => {
          calendarIframe.src = src;
          setTimeout(() => {
            setIsCalendarRefreshing(false);
            if (calendarWrapper) {
              calendarWrapper.classList.remove('refreshing');
            }
          }, 1000);
        }, 100);
      }
    }, 2000);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    setInput('');
    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);

    setIsTyping(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      // Build conversation history for the API
      const conversationHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch(`${apiUrl}/api/demo/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory,
          systemPrompt: SYSTEM_PROMPT
        })
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const data = await response.json();

      setIsTyping(false);

      // Check if AI called the booking tool
      if (data.toolCall === 'show_booking_form') {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message,
          showBookingButton: true
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message
        }]);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    }
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

  const triggerClose = (callback?: () => void) => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setIsClosing(false);
      setOpen(false);
      callback?.();
    }, 240);
  };

  const handleBookingSubmit = async () => {
    if (!bookingData.customerName) return;

    setIsSubmitting(true);
    const submittedData = { ...bookingData };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const res = await fetch(`${apiUrl}/api/demo/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingData,
          source: 'landing-page-demo'
        })
      });

      if (res.ok) {
        setShowBookingForm(false);
        setBookingData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          service: '',
          preferredDate: '',
          preferredTime: '',
          notes: ''
        });
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Excellent! Your booking request has been submitted successfully!\n\n**Booking Details:**\n- Name: ${submittedData.customerName}\n- Date: ${submittedData.preferredDate || 'To be confirmed'}\n- Time: ${submittedData.preferredTime || 'To be confirmed'}\n\nA calendar event has been created. The calendar above will refresh in a moment to show your booking!\n\nThis is exactly how it works on your website - customers can book appointments through the chatbot, and you get notified instantly.`
        }]);

        refreshCalendar();
      } else {
        throw new Error('Booking failed');
      }
    } catch {
      setShowBookingForm(false);
      setBookingData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        service: '',
        preferredDate: '',
        preferredTime: '',
        notes: ''
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Your demo booking for **${submittedData.customerName}** on **${submittedData.preferredDate || 'your preferred date'}** has been recorded!\n\nScroll up to see the calendar where bookings appear!`
      }]);
    } finally {
      setIsSubmitting(false);
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
        onClick={() => setOpen(true)}
        aria-label="Open XeloChat chat"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
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
  const animatedClass = `${containerClass} ${isClosing ? styles.closing : ''}`;

  return (
    <div className={animatedClass} onClick={handleContainerClick} style={themeVars}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.headerAvatar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <h1>XeloChat</h1>
            <p className={styles.headerSub}>AI-powered assistant</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          {floating && (
            <>
              {onSwitchToDemo && (
                <button
                  className={styles.switchButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerClose(onSwitchToDemo);
                  }}
                  aria-label="Switch to your chatbot"
                  title="Switch to your chatbot"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 23l-4-4 4-4"/>
                    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                    <path d="M17 1l4 4-4 4"/>
                    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                  </svg>
                  <span>My chatbot</span>
                </button>
              )}
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
            </>
          )}
        </div>
      </header>

      <div className={`${styles.body} ${collapsed ? styles.bodyCollapsed : ''}`}>
        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i}>
              <div
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
              {msg.showBookingButton && (
                <div className={styles.bookingButtonWrapper}>
                  <button
                    className={styles.bookingButton}
                    onClick={() => setShowBookingForm(true)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Book Appointment
                  </button>
                </div>
              )}
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
          <span>AI responses are informational and may be imperfect.</span>
          <a className={styles.legalLink} href="/terms">Terms</a>
          <span className={styles.legalSeparator}>•</span>
          <a className={styles.legalLink} href="/privacy">Privacy</a>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className={styles.bookingOverlay}>
          <div className={styles.bookingForm}>
            <div className={styles.bookingHeader}>
              <h3>Book an Appointment</h3>
              <button
                className={styles.bookingClose}
                onClick={() => setShowBookingForm(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className={styles.bookingFields}>
              <div className={styles.bookingField}>
                <label>Name *</label>
                <input
                  type="text"
                  value={bookingData.customerName}
                  onChange={(e) => setBookingData({...bookingData, customerName: e.target.value})}
                  placeholder="Your name"
                />
              </div>

              <div className={styles.bookingField}>
                <label>Email</label>
                <input
                  type="email"
                  value={bookingData.customerEmail}
                  onChange={(e) => setBookingData({...bookingData, customerEmail: e.target.value})}
                  placeholder="your@email.com"
                />
              </div>

              <div className={styles.bookingField}>
                <label>Phone</label>
                <input
                  type="tel"
                  value={bookingData.customerPhone}
                  onChange={(e) => setBookingData({...bookingData, customerPhone: e.target.value})}
                  placeholder="+421 xxx xxx xxx"
                />
              </div>

              <div className={styles.bookingRow}>
                <div className={styles.bookingField}>
                  <label>Preferred Date</label>
                  <input
                    type="date"
                    value={bookingData.preferredDate}
                    onChange={(e) => setBookingData({...bookingData, preferredDate: e.target.value})}
                  />
                </div>

                <div className={styles.bookingField}>
                  <label>Preferred Time</label>
                  <input
                    type="time"
                    value={bookingData.preferredTime}
                    onChange={(e) => setBookingData({...bookingData, preferredTime: e.target.value})}
                  />
                </div>
              </div>

              <div className={styles.bookingField}>
                <label>Service</label>
                <input
                  type="text"
                  value={bookingData.service}
                  onChange={(e) => setBookingData({...bookingData, service: e.target.value})}
                  placeholder="e.g., Demo, Consultation"
                />
              </div>

              <div className={styles.bookingField}>
                <label>Notes</label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                  placeholder="Any additional information..."
                  rows={2}
                />
              </div>
            </div>

            <button
              className={styles.bookingSubmit}
              onClick={handleBookingSubmit}
              disabled={!bookingData.customerName || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
