'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getChatbots, getUsageStats, ChatbotSummary, UsageStats } from '@/lib/api';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const [chatbots, setChatbots] = useState<ChatbotSummary[]>([]);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [chatbotsData, usageData] = await Promise.all([
          getChatbots(),
          getUsageStats()
        ]);
        setChatbots(chatbotsData);
        setUsage(usageData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()} className={styles.primaryBtn}>
          Retry
        </button>
      </div>
    );
  }

  const getProgressClass = (percentage: number) => {
    if (percentage >= 90) return `${styles.progress} ${styles.danger}`;
    if (percentage >= 70) return `${styles.progress} ${styles.warning}`;
    return styles.progress;
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Dashboard</h1>
        <Link href="/dashboard/chatbots" className={styles.primaryBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create Chatbot
        </Link>
      </div>

      {/* Usage Stats */}
      {usage && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Messages This Month</h3>
            <p className={styles.statValue}>
              {usage.messagesUsed} <small>/ {usage.messageLimit}</small>
            </p>
            <div className={styles.progressBar}>
              <div
                className={getProgressClass(usage.percentageUsed)}
                style={{ width: `${Math.min(usage.percentageUsed, 100)}%` }}
              />
            </div>
          </div>

          <div className={styles.statCard}>
            <h3>Chatbots</h3>
            <p className={styles.statValue}>
              {usage.chatbotCount} <small>/ {usage.chatbotLimit}</small>
            </p>
          </div>

          <div className={styles.statCard}>
            <h3>Total Conversations</h3>
            <p className={styles.statValue}>{usage.conversationCount}</p>
          </div>

          <div className={styles.statCard}>
            <h3>Current Plan</h3>
            <p className={styles.statValue}>{usage.plan}</p>
          </div>
        </div>
      )}

      {/* Recent Chatbots */}
      <div className={styles.pageHeader} style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Your Chatbots</h2>
        <Link href="/dashboard/chatbots" className={styles.secondaryBtn}>
          View All
        </Link>
      </div>

      {chatbots.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" style={{ marginBottom: '1rem' }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <p>No chatbots yet. Create your first one to get started!</p>
          <Link href="/dashboard/chatbots" className={styles.primaryBtn}>
            Create Your First Chatbot
          </Link>
        </div>
      ) : (
        <div className={styles.cardsGrid}>
          {chatbots.slice(0, 6).map((chatbot) => (
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
    </div>
  );
}
