import type { Metadata } from 'next';
import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import './styles.css';

export const metadata: Metadata = {
  title: 'Sign In',
  description:
    'Sign in to your XeloChat account. Manage your AI chatbots, view analytics, and customize your widgets.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function SignInPage() {
  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          {/* Brand header */}
          <Link href="/" className="auth-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>XeloChat</span>
          </Link>

          {/* Welcome message */}
          <div className="auth-header">
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to manage your AI chatbots</p>
          </div>

          {/* Clerk sign-in component */}
          <SignIn
            forceRedirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: 'auth-clerk-root',
                card: 'auth-clerk-card',
                formButtonPrimary: 'auth-clerk-button',
                footerActionLink: 'auth-clerk-link',
                headerTitle: 'auth-clerk-hidden',
                headerSubtitle: 'auth-clerk-hidden',
                footer: 'auth-clerk-footer',
                socialButtonsBlockButton: 'auth-clerk-social',
                socialButtonsProviderIcon: 'auth-clerk-social-icon',
              },
              layout: {
                socialButtonsVariant: 'blockButton',
              },
            }}
          />

          {/* Switch to sign up */}
          <div className="auth-switch">
            <span>Don&apos;t have an account?</span>
            <Link href="/sign-up" className="auth-switch-link">Sign up</Link>
          </div>
        </div>

        {/* Footer links */}
        <div className="auth-footer">
          <div className="auth-footer-links">
            <Link href="/terms" className="auth-footer-link-small">Terms</Link>
            <span className="auth-footer-separator">&middot;</span>
            <Link href="/privacy" className="auth-footer-link-small">Privacy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
