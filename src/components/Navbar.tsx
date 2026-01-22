'use client';

import { useUser } from '@auth0/nextjs-auth0';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, isLoading } = useUser();

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <div className={styles.centerGroup}>
          <a href="/" className={styles.brand}>
            <span className={styles.brandMark} a1a-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </span>
            XeloChat
          </a>

          <div className={styles.menu}>
            <a href="#features" className={styles.link}>Features</a>
            <a href="#how" className={styles.link}>How it works</a>
            <a href="/pricing" className={styles.link}>Pricing</a>
            <a href="/embed-guide" className={styles.link}>Embed Guide</a>

            {isLoading ? (
              <span className={styles.link}>Loading...</span>
            ) : user ? (
              <>
                <a href="/dashboard" className={styles.cta}>Dashboard</a>
              </>
            ) : (
              <>
                <a href="/auth/login" className={styles.link}>Login</a>
                <a href="/auth/login?screen_hint=signup" className={styles.cta}>Sign Up</a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
