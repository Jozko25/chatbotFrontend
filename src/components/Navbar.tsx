'use client';

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  useUser
} from '@clerk/nextjs';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { isLoaded } = useUser();

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <div className={styles.centerGroup}>
          <a href="/" className={styles.brand}>
            <span className={styles.brandMark} a1a-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </span>
            XeloChat
          </a>

          <div className={styles.menu}>
            <a href="#features" className={styles.link}>Features</a>
            <a href="#how" className={styles.link}>How it works</a>
            <a href="/pricing" className={styles.link}>Pricing</a>
            <a href="/blog" className={styles.link}>Blog</a>
            
            {!isLoaded ? (
              <span className={styles.link}>Loading...</span>
            ) : (
              <>
                <SignedIn>
                  <a href="/dashboard" className={styles.cta}>Dashboard</a>
                </SignedIn>
                <SignedOut>
                  <SignInButton
                    forceRedirectUrl="/dashboard"
                    signUpForceRedirectUrl="/dashboard"
                  >
                    <button type="button" className={styles.link}>Login</button>
                  </SignInButton>
                  <SignUpButton
                    forceRedirectUrl="/dashboard"
                    signInForceRedirectUrl="/dashboard"
                  >
                    <button type="button" className={styles.cta}>Sign Up</button>
                  </SignUpButton>
                </SignedOut>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
