'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getChatbots, scrapeClinicStreamWithController, importDemoChatbot, ChatbotSummary, ScrapeProgressEvent, ScrapeController } from '@/lib/api';
import { loadSession, clearSession } from '@/lib/storage';
import { ChatState } from '@/types/clinic';
import styles from '../dashboard.module.css';

interface ScrapedPage {
  url: string;
  title?: string;
  contentLength?: number;
  status: 'scraping' | 'done' | 'error';
}

export default function ChatbotsPage() {
  const [chatbots, setChatbots] = useState<ChatbotSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUrl, setCreateUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [demoImport, setDemoImport] = useState<ChatState | null>(null);
  const [demoImportPending, setDemoImportPending] = useState(false);
  const [demoImporting, setDemoImporting] = useState(false);
  const [demoImportError, setDemoImportError] = useState<string | null>(null);

  // Scraping progress state
  const [scrapeProgress, setScrapeProgress] = useState<{
    status: string;
    pagesScraped: number;
    maxPages: number;
    totalLinksFound: number;
    currentUrl: string;
    scrapedPages: ScrapedPage[];
    phase: 'scraping' | 'extracting' | 'saving' | 'complete';
    extractedColor?: string;
    stopping?: boolean;
  } | null>(null);

  // Scrape controller ref for stop functionality
  const scrapeControllerRef = useRef<ScrapeController | null>(null);

  // Link limit threshold - show warning above this
  const LINK_WARNING_THRESHOLD = 500;

  useEffect(() => {
    loadChatbots();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const pending = localStorage.getItem('xelochat-demo-import-pending');
    if (!pending) return;
    const saved = loadSession();
    if (saved?.clinicData) {
      setDemoImport(saved);
      setDemoImportPending(true);
    }
  }, []);

  async function loadChatbots() {
    try {
      const data = await getChatbots();
      setChatbots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chatbots');
    } finally {
      setLoading(false);
    }
  }

  async function handleImportDemo() {
    if (!demoImport?.clinicData) return;
    setDemoImporting(true);
    setDemoImportError(null);

    try {
      const sourceUrl =
        demoImport.clinicData.sourceUrl ||
        demoImport.clinicData.source_pages?.[0] ||
        undefined;
      const result = await importDemoChatbot(demoImport.clinicData, demoImport.theme, sourceUrl);
      localStorage.removeItem('xelochat-demo-import-pending');
      clearSession();
      setDemoImportPending(false);
      window.location.href = `/dashboard/chatbots/${result.chatbotId}`;
    } catch (err) {
      setDemoImportError(err instanceof Error ? err.message : 'Failed to import demo chatbot');
    } finally {
      setDemoImporting(false);
    }
  }

  function handleDismissDemo() {
    localStorage.removeItem('xelochat-demo-import-pending');
    setDemoImportPending(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    setScrapeProgress({
      status: 'Starting...',
      pagesScraped: 0,
      maxPages: 50,
      totalLinksFound: 0,
      currentUrl: createUrl,
      scrapedPages: [],
      phase: 'scraping'
    });

    try {
      const controller = scrapeClinicStreamWithController(createUrl, (event: ScrapeProgressEvent) => {
        setScrapeProgress(prev => {
          if (!prev) return prev;

          const newState = { ...prev };

          switch (event.type) {
            case 'start':
              newState.status = 'Connecting to website...';
              newState.maxPages = event.maxPages || 50;
              break;

            case 'scraping':
              newState.currentUrl = event.url || '';
              newState.status = `Scraping page ${(event.pagesScraped || 0) + 1}...`;
              // Add to list if not already there
              if (event.url && !newState.scrapedPages.find(p => p.url === event.url)) {
                newState.scrapedPages = [...newState.scrapedPages, {
                  url: event.url,
                  status: 'scraping'
                }];
              }
              break;

            case 'page_done':
              newState.pagesScraped = event.pagesScraped || 0;
              newState.totalLinksFound = event.totalLinksFound || 0;
              newState.status = `Scraped ${event.pagesScraped}/${event.maxPages} pages`;
              // Update page status
              newState.scrapedPages = newState.scrapedPages.map(p =>
                p.url === event.url
                  ? { ...p, status: 'done' as const, title: event.title, contentLength: event.contentLength }
                  : p
              );
              break;

            case 'page_error':
              newState.scrapedPages = newState.scrapedPages.map(p =>
                p.url === event.url ? { ...p, status: 'error' as const } : p
              );
              break;

            case 'scrape_complete':
              newState.status = 'Processing content...';
              newState.phase = 'extracting';
              break;

            case 'extracting':
              newState.phase = 'extracting';
              newState.status = event.message || 'Extracting data...';
              break;

            case 'saving':
              newState.phase = 'saving';
              newState.status = event.message || 'Saving chatbot...';
              break;

            case 'colors_done':
              if (event.primaryColor) {
                newState.extractedColor = event.primaryColor;
              }
              break;

            case 'stopped':
              newState.status = 'Finishing with scraped content...';
              break;

            case 'complete':
              newState.phase = 'complete';
              newState.status = 'Complete!';
              break;
          }

          return newState;
        });
      });

      scrapeControllerRef.current = controller;
      const result = await controller.promise;

      // Brief delay to show completion
      await new Promise(resolve => setTimeout(resolve, 500));

      setShowCreateModal(false);
      setCreateUrl('');
      setScrapeProgress(null);
      scrapeControllerRef.current = null;
      // Redirect to the new chatbot
      window.location.href = `/dashboard/chatbots/${result.chatbotId}`;
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create chatbot');
      setScrapeProgress(null);
      scrapeControllerRef.current = null;
    } finally {
      setCreating(false);
    }
  }

  function handleStopScraping() {
    if (scrapeControllerRef.current) {
      setScrapeProgress(prev => prev ? { ...prev, stopping: true, status: 'Stopping...' } : prev);
      scrapeControllerRef.current.stop();
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading chatbots...</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Chatbots</h1>
        <button onClick={() => setShowCreateModal(true)} className={styles.primaryBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create Chatbot
        </button>
      </div>

      {demoImportPending && demoImport && (
        <div className={styles.demoBanner}>
          <div>
            <h3>Import your demo chatbot</h3>
            <p>We saved your demo chatbot. Import it to generate API keys and embed it on your site.</p>
          </div>
          <div className={styles.demoActions}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleImportDemo}
              disabled={demoImporting}
            >
              {demoImporting ? 'Importing...' : 'Import demo bot'}
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={handleDismissDemo}
              disabled={demoImporting}
            >
              Dismiss
            </button>
          </div>
          {demoImportError && <div className={styles.warning}>{demoImportError}</div>}
        </div>
      )}

      {error && (
        <div className={styles.warning}>{error}</div>
      )}

      {chatbots.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" style={{ marginBottom: '1rem' }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <p>No chatbots yet. Create your first one by entering a website URL.</p>
          <button onClick={() => setShowCreateModal(true)} className={styles.primaryBtn}>
            Create Your First Chatbot
          </button>
        </div>
      ) : (
        <div className={styles.cardsGrid}>
          {chatbots.map((chatbot) => (
            <Link
              key={chatbot.id}
              href={`/dashboard/chatbots/${chatbot.id}`}
              className={styles.cardLink}
            >
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{chatbot.name}</h3>
                  <span className={`${styles.cardBadge} ${chatbot.status === 'ACTIVE' ? styles.active : styles.paused}`}>
                    {chatbot.status}
                  </span>
                </div>
                <p className={styles.cardUrl}>{chatbot.sourceUrl}</p>
                <div className={styles.cardMeta}>
                  <span>{chatbot._count.conversations} conversations</span>
                  <span>{new Date(chatbot.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => !creating && setShowCreateModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={scrapeProgress ? { width: '600px', maxWidth: '90vw' } : {}}>
            <div className={styles.modalHeader}>
              <h2>{scrapeProgress ? 'Creating Chatbot' : 'Create New Chatbot'}</h2>
            </div>

            {scrapeProgress ? (
              <div className={styles.modalBody}>
                {/* Progress Header */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  {/* Animated spinner */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    margin: '0 auto 1rem',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      border: '3px solid #e2e8f0',
                      borderTopColor: '#3b82f6',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    {scrapeProgress.phase === 'complete' && (
                      <svg
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: '#22c55e'
                        }}
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>

                  <p style={{ fontSize: '1rem', fontWeight: 500, color: '#1e293b' }}>
                    {scrapeProgress.status}
                  </p>

                  {/* Progress bar */}
                  {scrapeProgress.phase === 'scraping' && (
                    <div style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: '#e2e8f0',
                      borderRadius: '3px',
                      marginTop: '1rem',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(scrapeProgress.pagesScraped / scrapeProgress.maxPages) * 100}%`,
                        height: '100%',
                        backgroundColor: '#3b82f6',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  )}

                  {/* Stats */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '2rem',
                    marginTop: '1rem',
                    fontSize: '0.875rem',
                    color: '#64748b'
                  }}>
                    <span>{scrapeProgress.pagesScraped} pages scraped</span>
                    <span>{scrapeProgress.totalLinksFound} links found</span>
                  </div>

                  {/* Large site warning */}
                  {scrapeProgress.phase === 'scraping' && scrapeProgress.totalLinksFound > LINK_WARNING_THRESHOLD && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem 1rem',
                      backgroundColor: '#fef3c7',
                      border: '1px solid #fcd34d',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      color: '#92400e'
                    }}>
                      <strong>Large website detected!</strong> This site has {scrapeProgress.totalLinksFound.toLocaleString()} links.
                      We&apos;ll scrape up to {scrapeProgress.maxPages} pages. You can stop anytime and use what&apos;s been collected.
                    </div>
                  )}

                  {/* Stop button */}
                  {scrapeProgress.phase === 'scraping' && scrapeProgress.pagesScraped >= 3 && !scrapeProgress.stopping && (
                    <button
                      onClick={handleStopScraping}
                      style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        color: '#dc2626',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#fee2e2';
                        e.currentTarget.style.borderColor = '#fca5a5';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#fef2f2';
                        e.currentTarget.style.borderColor = '#fecaca';
                      }}
                    >
                      Stop &amp; use {scrapeProgress.pagesScraped} pages
                    </button>
                  )}
                </div>

                {/* Pages list */}
                <div style={{
                  maxHeight: '250px',
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc'
                }}>
                  {scrapeProgress.scrapedPages.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>
                      Waiting for pages...
                    </div>
                  ) : (
                    scrapeProgress.scrapedPages.map((page, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem 1rem',
                          borderBottom: idx < scrapeProgress.scrapedPages.length - 1 ? '1px solid #e2e8f0' : 'none',
                          fontSize: '0.875rem'
                        }}
                      >
                        {/* Status indicator */}
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          flexShrink: 0,
                          backgroundColor: page.status === 'done' ? '#22c55e' : page.status === 'error' ? '#ef4444' : '#3b82f6',
                          animation: page.status === 'scraping' ? 'pulse 1s infinite' : 'none'
                        }} />

                        {/* Page info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: '#1e293b'
                          }}>
                            {page.title || new URL(page.url).pathname || '/'}
                          </div>
                          <div style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: '#94a3b8',
                            fontSize: '0.75rem'
                          }}>
                            {page.url}
                          </div>
                        </div>

                        {/* Content size */}
                        {page.contentLength !== undefined && (
                          <span style={{ color: '#64748b', fontSize: '0.75rem', flexShrink: 0 }}>
                            {(page.contentLength / 1000).toFixed(1)}k chars
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Extracted color indicator */}
                {scrapeProgress.extractedColor && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      backgroundColor: scrapeProgress.extractedColor,
                      border: '1px solid rgba(0,0,0,0.1)'
                    }} />
                    <span style={{ fontSize: '0.875rem', color: '#166534' }}>
                      Brand color detected: {scrapeProgress.extractedColor}
                    </span>
                  </div>
                )}

                {/* Phase indicator */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '1.5rem'
                }}>
                  {['scraping', 'extracting', 'saving', 'complete'].map((phase, idx) => (
                    <div
                      key={phase}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: scrapeProgress.phase === phase ? '#3b82f6' :
                          ['scraping', 'extracting', 'saving', 'complete'].indexOf(scrapeProgress.phase) > idx ? '#22c55e' : '#94a3b8',
                        fontSize: '0.75rem'
                      }}
                    >
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'currentColor'
                      }} />
                      {phase.charAt(0).toUpperCase() + phase.slice(1)}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreate}>
                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label htmlFor="url">Website URL</label>
                    <input
                      type="text"
                      id="url"
                      value={createUrl}
                      onChange={(e) => setCreateUrl(e.target.value)}
                      placeholder="example.com"
                      required
                      disabled={creating}
                    />
                    <small>Enter the URL of the website you want to create a chatbot for.</small>
                  </div>
                  {createError && (
                    <div className={styles.warning}>{createError}</div>
                  )}
                </div>
                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className={styles.secondaryBtn}
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.primaryBtn} disabled={creating}>
                    Create Chatbot
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CSS animations */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
