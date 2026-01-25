import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import './styles.css';

export default function SignInPage() {
  return (
    <div className="auth-container">
      {/* Decorative background elements */}
      <div className="auth-bg-orb auth-bg-orb-1"></div>
      <div className="auth-bg-orb auth-bg-orb-2"></div>
      <div className="auth-bg-orb auth-bg-orb-3"></div>

      <div className="auth-wrapper">
        {/* Brand header */}
        <div className="auth-brand">
          <Link href="/" className="auth-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>XeloChat</span>
          </Link>
        </div>

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
            },
          }}
        />

        {/* Footer links */}
        <div className="auth-footer">
          <div className="auth-footer-links">
            <Link href="/terms" className="auth-footer-link-small">Terms</Link>
            <span className="auth-footer-separator">•</span>
            <Link href="/privacy" className="auth-footer-link-small">Privacy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
