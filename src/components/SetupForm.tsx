'use client';

import { useState } from 'react';
import styles from './SetupForm.module.css';

const PHASES: Array<'scraping' | 'extracting' | 'saving' | 'complete'> = [
  'scraping',
  'extracting',
  'saving',
  'complete',
];

interface ScrapedPage {
  url: string;
  title?: string;
  contentLength?: number;
  status: 'scraping' | 'done' | 'error';
}

interface ScrapeProgress {
  status: string;
  pagesScraped: number;
  maxPages: number;
  totalLinksFound: number;
  currentUrl: string;
  scrapedPages: ScrapedPage[];
  phase: 'scraping' | 'extracting' | 'saving' | 'complete';
}

interface SetupFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  error: string | null;
  embedded?: boolean;
  info?: string | null;
  onReset?: () => void;
  progress?: ScrapeProgress | null;
}

export default function SetupForm({ onSubmit, isLoading, error, embedded, info, onReset, progress }: SetupFormProps) {
  const [url, setUrl] = useState('');
  const containerClass = embedded ? styles.embedContainer : styles.container;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(url.trim());
  };

  const progressData: ScrapeProgress = progress || {
    status: 'Creating chatbot...',
    pagesScraped: 0,
    maxPages: 50,
    totalLinksFound: 0,
    currentUrl: '',
    scrapedPages: [],
    phase: 'scraping',
  };

  const progressPercent = progressData.maxPages
    ? Math.min(100, Math.round((progressData.pagesScraped / progressData.maxPages) * 100))
    : 0;

  return (
    <div className={containerClass}>
      <div className={styles.card}>
        {info && <div className={styles.info}>{info}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="url">Website URL</label>
            <span className={styles.inputIcon}>🔗</span>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="your-website.com"
              required
              disabled={isLoading}
            />
            <p className={styles.helpText}>We&apos;ll crawl up to 50 pages automatically.</p>
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={isLoading || !url}
          >
            {isLoading ? 'Building...' : 'Create Chatbot'}
          </button>

          {onReset && !isLoading && (
            <button
              type="button"
              className={styles.secondary}
              onClick={onReset}
            >
              Start over
            </button>
          )}
        </form>

        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.loadingHeader}>
              <div className={styles.loadingSpinnerWrap}>
                <div className={styles.loadingSpinner} />
                {progressData.phase === 'complete' && (
                  <svg
                    className={styles.loadingCheck}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <p className={styles.loadingStatus}>{progressData.status}</p>
              {progressData.phase === 'scraping' && (
                <div className={styles.loadingBar}>
                  <div
                    className={styles.loadingBarFill}
                    style={{ ['--progress' as string]: `${progressPercent}%` }}
                  />
                </div>
              )}
              <div className={styles.loadingStats}>
                <span>{progressData.pagesScraped} pages scraped</span>
                <span>{progressData.totalLinksFound} links found</span>
              </div>
            </div>

            <div className={styles.loadingList}>
              {progressData.scrapedPages.length === 0 ? (
                <div className={styles.loadingEmpty}>Waiting for pages...</div>
              ) : (
                progressData.scrapedPages.map((page, idx) => {
                  let title = page.title;
                  if (!title) {
                    try {
                      title = new URL(page.url).pathname || '/';
                    } catch {
                      title = page.url;
                    }
                  }

                  const statusClass =
                    page.status === 'done'
                      ? styles.dotDone
                      : page.status === 'error'
                        ? styles.dotError
                        : styles.dotActive;

                  return (
                    <div key={`${page.url}-${idx}`} className={styles.loadingRow}>
                      <div className={`${styles.loadingDot} ${statusClass}`} />
                      <div className={styles.loadingRowInfo}>
                        <div className={styles.loadingRowTitle}>{title}</div>
                        <div className={styles.loadingRowUrl}>{page.url}</div>
                      </div>
                      {page.contentLength !== undefined && (
                        <span className={styles.loadingRowSize}>
                          {(page.contentLength / 1000).toFixed(1)}k chars
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className={styles.loadingPhases}>
              {PHASES.map((phase, idx) => {
                const phaseIdx = PHASES.indexOf(progressData.phase);
                const phaseClass =
                  phaseIdx > idx
                    ? styles.phaseDone
                    : phase === progressData.phase
                      ? styles.phaseActive
                      : styles.phaseTodo;
                return (
                  <div key={phase} className={`${styles.phaseItem} ${phaseClass}`}>
                    <span className={styles.phaseDot} />
                    {phase.charAt(0).toUpperCase() + phase.slice(1)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <p className={styles.legal}>
          By continuing you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a> and confirm the chatbot responses are informational only and not legal, financial, or medical advice.
        </p>
      </div>
    </div>
  );
}
