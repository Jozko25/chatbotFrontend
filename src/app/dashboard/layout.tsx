'use client';

import { useUser } from '@auth0/nextjs-auth0';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import XeloChatAssistant from '@/components/XeloChatAssistant';
import styles from './dashboard.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Extract chatbot ID if on a chatbot detail page
  const chatbotIdMatch = pathname.match(/\/dashboard\/chatbots\/([^/]+)/);
  const currentChatbotId = chatbotIdMatch ? chatbotIdMatch[1] : undefined;

  // Don't show assistant on chatbot detail pages (they have their own with section navigation)
  const showAssistant = !currentChatbotId;

  useEffect(() => {
    if (!isLoading && !user) {
      // Use <a> tag style redirect for auth routes as per Auth0 v4 docs
      window.location.href = '/auth/login';
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.dashboard}>
      <nav className={styles.sidebar}>
        <div className={styles.logo}>
          <Link href="/">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            XeloChat
          </Link>
        </div>

        <div className={styles.navLinks}>
          <Link href="/dashboard" className={styles.navLink}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="9"/>
              <rect x="14" y="3" width="7" height="5"/>
              <rect x="14" y="12" width="7" height="9"/>
              <rect x="3" y="16" width="7" height="5"/>
            </svg>
            Dashboard
          </Link>
          <Link href="/dashboard/chatbots" className={styles.navLink}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Chatbots
          </Link>
          <Link href="/dashboard/api-keys" className={styles.navLink}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
            API Keys
          </Link>
        </div>

        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            {user.picture && (
              <img src={user.picture} alt="" className={styles.avatar} />
            )}
            <div className={styles.userName}>
              <span>{user.name || user.email}</span>
              <small>{user.email}</small>
            </div>
          </div>
          <a href="/auth/logout" className={styles.logoutBtn}>
            Logout
          </a>
        </div>
      </nav>

      <main className={styles.main}>
        {children}
      </main>

      {/* XeloChat Assistant - shown on all pages except chatbot detail (which has its own) */}
      {showAssistant && (
        <XeloChatAssistant mode="dashboard" />
      )}
    </div>
  );
}
