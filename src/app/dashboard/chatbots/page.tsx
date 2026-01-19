'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getChatbots, scrapeClinic, ChatbotSummary } from '@/lib/api';
import styles from '../dashboard.module.css';

export default function ChatbotsPage() {
  const [chatbots, setChatbots] = useState<ChatbotSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUrl, setCreateUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    loadChatbots();
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    try {
      const result = await scrapeClinic(createUrl);
      setShowCreateModal(false);
      setCreateUrl('');
      // Redirect to the new chatbot
      window.location.href = `/dashboard/chatbots/${result.chatbotId}`;
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create chatbot');
    } finally {
      setCreating(false);
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
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create New Chatbot</h2>
            </div>
            <form onSubmit={handleCreate}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label htmlFor="url">Website URL</label>
                  <input
                    type="url"
                    id="url"
                    value={createUrl}
                    onChange={(e) => setCreateUrl(e.target.value)}
                    placeholder="https://example.com"
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
                  {creating ? (
                    <>
                      <div className={styles.spinner} style={{ width: 16, height: 16, borderWidth: 2 }}></div>
                      Scraping...
                    </>
                  ) : (
                    'Create Chatbot'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
