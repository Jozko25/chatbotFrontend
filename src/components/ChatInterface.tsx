'use client';

import { useState, useRef, useEffect, CSSProperties } from 'react';
import { ChatTheme, ClinicData, Message } from '@/types/clinic';
import { sendChatMessageStreamLegacy } from '@/lib/api';
import styles from './ChatInterface.module.css';

interface ChatInterfaceProps {
  clinicData: ClinicData;
  theme: ChatTheme;
  messages: Message[];
  onMessagesUpdate: (messages: Message[]) => void;
  onReset: () => void;
  embedded?: boolean;
  floating?: boolean;
  showMeta?: boolean;
  onClose?: () => void;
  onSwitchToAssistant?: () => void;
}

export default function ChatInterface({
  clinicData,
  theme,
  messages,
  onMessagesUpdate,
  onReset,
  embedded,
  floating,
  showMeta = true,
  onClose,
  onSwitchToAssistant,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAllPages, setShowAllPages] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerClass = `${styles.container} ${embedded ? styles.embedded : ''} ${floating ? styles.floating : ''} ${collapsed ? styles.collapsed : ''}`;
  const themeVars: CSSProperties = {
    ['--chat-primary' as any]: theme.primaryColor,
    ['--chat-bg' as any]: theme.backgroundColor,
    ['--chat-text' as any]: theme.textColor,
    ['--chat-muted' as any]: theme.textColor,
    ['--chat-user' as any]: theme.userBubbleColor,
    ['--chat-user-text' as any]: theme.backgroundColor,
    ['--chat-assistant' as any]: theme.assistantBubbleColor,
  };

  const handleContainerClick = () => {
    if (floating && collapsed) {
      setCollapsed(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const message = input.trim();
    if (!message || isLoading) return;

    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: message }];
    onMessagesUpdate(newMessages);

    setIsLoading(true);

    let accumulated = '';

    await sendChatMessageStreamLegacy(
      clinicData,
      messages,
      message,
      (chunk: string) => {
        accumulated += chunk;
      },
      () => {
        if (accumulated) {
          onMessagesUpdate([
            ...newMessages,
            { role: 'assistant', content: accumulated },
          ]);
        }
        setIsLoading(false);
      },
      (error: string) => {
        onMessagesUpdate([
          ...newMessages,
          { role: 'assistant', content: error || 'Sorry, something went wrong.' },
        ]);
        setIsLoading(false);
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={containerClass} onClick={handleContainerClick} style={themeVars}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <div>
            <h1>{theme.name || clinicData.clinic_name || 'Assistant'}</h1>
            <p className={styles.headerSub}>{theme.tagline || 'AI-powered assistant'}</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          {floating && (
            <>
              {onSwitchToAssistant && (
                <button
                  className={styles.switchButton}
                  onClick={onSwitchToAssistant}
                  title="Switch to SiteBot Assistant"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 23l-4-4 4-4"/>
                    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                    <path d="M17 1l4 4-4 4"/>
                    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                  </svg>
                  Help
                </button>
              )}
              <button
                className={styles.actionButton}
                onClick={() => setCollapsed((prev) => !prev)}
                aria-label={collapsed ? 'Expand chat' : 'Minimize chat'}
                title={collapsed ? 'Expand' : 'Minimize'}
              >
                {collapsed ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                )}
              </button>
              <button
                className={styles.actionButton}
                onClick={onClose}
                aria-label="Close chat"
                title="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </>
          )}
        </div>
      </header>

      <div className={`${styles.body} ${collapsed ? styles.bodyCollapsed : ''}`}>
        {showMeta && (
          <section className={styles.metaPanel}>
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <p className={styles.metaLabel}>Pages analyzed</p>
                <p className={styles.metaValue}>{clinicData.source_pages.length}</p>
              </div>
              <div className={styles.metaItem}>
                <p className={styles.metaLabel}>Status</p>
                <p className={styles.metaValue}>Ready</p>
              </div>
            </div>

            {clinicData.source_pages.length > 0 && (
              <div className={styles.pageList}>
                <div className={styles.pageListHeader}>
                  <span>Sources</span>
                  {clinicData.source_pages.length > 5 && (
                    <button
                      className={styles.pageToggle}
                      onClick={() => setShowAllPages((prev) => !prev)}
                    >
                      {showAllPages ? 'Show less' : 'Show all'}
                    </button>
                  )}
                </div>
                <ul>
                  {(showAllPages
                    ? clinicData.source_pages
                    : clinicData.source_pages.slice(0, 5)
                  ).map((url, idx) => (
                    <li key={url + idx} className={styles.pageItem}>
                      <span className={styles.pageIndex}>{idx + 1}.</span>
                      <span className={styles.pageUrl}>{url}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.message} ${msg.role === 'user' ? styles.user : styles.assistant}`}
            >
              <div className={styles.bubble}>{msg.content}</div>
            </div>
          ))}

          {isLoading && (
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
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={styles.sendButton}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>

        <div className={styles.legalBar}>
          <span>
            AI responses are informational and may be imperfect. Confirm details before acting.
          </span>
          <a className={styles.legalLink} href="#terms">Terms</a>
        </div>
      </div>
    </div>
  );
}
