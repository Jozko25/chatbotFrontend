'use client';

import { useState, useEffect } from 'react';
import styles from './SetupForm.module.css';

const STEPS = [
  'Crawling pages',
  'Extracting content',
  'Processing with AI',
  'Building chatbot',
];

interface SetupFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  error: string | null;
  embedded?: boolean;
  info?: string | null;
  onReset?: () => void;
}

export default function SetupForm({ onSubmit, isLoading, error, embedded, info, onReset }: SetupFormProps) {
  const [url, setUrl] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const containerClass = embedded ? styles.embedContainer : styles.container;

  useEffect(() => {
    if (!isLoading) {
      setStepIndex(0);
      return;
    }

    setStepIndex(0);
    const id = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, 1200);

    return () => clearInterval(id);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(url.trim());
  };

  return (
    <div className={containerClass}>
      <div className={styles.card}>
        {info && <div className={styles.info}>{info}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-website.com"
              required
              disabled={isLoading}
            />
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
            <div className={styles.spinner} />
            <p>This usually takes about a minute</p>
            <div className={styles.progress}>
              {STEPS.map((label, idx) => {
                const status =
                  idx < stepIndex ? 'done' : idx === stepIndex ? 'active' : 'todo';
                return (
                  <div key={label} className={`${styles.step} ${styles[status]}`}>
                    <span className={styles.stepDot} />
                    <span className={styles.stepLabel}>{label}</span>
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
      </div>
    </div>
  );
}
