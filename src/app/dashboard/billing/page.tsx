'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  createBillingPortalSession,
  createCheckoutSession,
  getBillingStatus,
  BillingStatus,
  deleteAccount
} from '@/lib/api';
import dashboardStyles from '../dashboard.module.css';
import styles from './billing.module.css';

const PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    price: 0,
    messages: '50',
    chatbots: '1',
    features: ['Basic lead capture', 'XeloChat branding'],
    popular: false,
  },
  {
    id: 'STARTER',
    name: 'Starter',
    price: 18,
    messages: '500',
    chatbots: '2',
    features: ['Email lead capture', 'Remove branding', 'Email booking requests'],
    popular: false,
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 49,
    messages: '2,000',
    chatbots: '4',
    features: ['Google Calendar', 'Auto booking', 'Priority support'],
    popular: true,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 99,
    messages: 'Unlimited',
    chatbots: 'Unlimited',
    features: ['All integrations'],
    popular: false,
  },
] as const;

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return '#22c55e';
    case 'trialing':
      return '#3b82f6';
    case 'past_due':
    case 'unpaid':
      return '#f59e0b';
    case 'canceled':
    case 'incomplete':
      return '#ef4444';
    default:
      return '#64748b';
  }
}

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionPlan, setActionPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentPlan = PLANS.find(p => p.id === billing?.plan) || PLANS[0];

  useEffect(() => {
    async function loadStatus() {
      try {
        const status = await getBillingStatus();
        setBilling(status);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load billing status');
      } finally {
        setLoading(false);
      }
    }
    loadStatus();
  }, []);

  async function handleCheckout(plan: 'STARTER' | 'PRO' | 'ENTERPRISE') {
    setActionPlan(plan);
    setError(null);
    try {
      const { url } = await createCheckoutSession({ plan, currency: 'EUR' });
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setActionPlan(null);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    setError(null);
    try {
      const { url } = await createBillingPortalSession();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteError(null);
    if (deleteInput !== 'DELETE') {
      setDeleteError('Type DELETE to confirm');
      return;
    }
    setIsDeleting(true);
    try {
      await deleteAccount();
      window.location.href = '/';
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className={dashboardStyles.loadingContainer}>
        <div className={dashboardStyles.spinner}></div>
        <p>Loading billing...</p>
      </div>
    );
  }

  const hasActiveSubscription = billing?.subscription &&
    ['active', 'trialing', 'past_due'].includes(billing.subscription.status);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Billing</h1>
          <p className={styles.subtitle}>Manage your subscription and billing details</p>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Current Plan Card */}
      <section className={styles.currentPlanSection}>
        <div className={styles.currentPlanCard}>
          <div className={styles.currentPlanHeader}>
            <div>
              <span className={styles.currentPlanLabel}>Current Plan</span>
              <h2 className={styles.currentPlanName}>{currentPlan.name}</h2>
            </div>
            <div className={styles.currentPlanPrice}>
              <span className={styles.priceAmount}>${currentPlan.price}</span>
              {currentPlan.price > 0 && <span className={styles.pricePeriod}>/month</span>}
            </div>
          </div>

          <div className={styles.usageStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Messages</span>
              <span className={styles.statValue}>{currentPlan.messages}/month</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Chatbots</span>
              <span className={styles.statValue}>{currentPlan.chatbots}</span>
            </div>
            {billing?.subscription && (
              <>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Status</span>
                  <span className={styles.statusBadge} style={{ background: `${getStatusColor(billing.subscription.status)}15`, color: getStatusColor(billing.subscription.status) }}>
                    {billing.subscription.status}
                  </span>
                </div>
                {billing.subscription.currentPeriodEnd && (
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>
                      {billing.subscription.cancelAtPeriodEnd ? 'Expires' : 'Renews'}
                    </span>
                    <span className={styles.statValue}>
                      {formatDate(billing.subscription.currentPeriodEnd)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {hasActiveSubscription && (
            <button
              className={styles.manageButton}
              onClick={handlePortal}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <>
                  <span className={styles.buttonSpinner}></span>
                  Opening...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Manage Subscription
                </>
              )}
            </button>
          )}
        </div>
      </section>

      {/* Upgrade Plans */}
      <section className={styles.plansSection}>
        <h2 className={styles.sectionTitle}>
          {hasActiveSubscription ? 'Change Plan' : 'Upgrade Your Plan'}
        </h2>
        <p className={styles.sectionSubtitle}>
          {hasActiveSubscription
            ? 'Switch to a different plan anytime. Changes are prorated.'
            : 'Get more messages and features for your chatbots.'
          }
        </p>

        <div className={styles.plansGrid}>
          {PLANS.filter(p => p.id !== 'FREE').map((plan) => {
            const isCurrent = billing?.plan === plan.id;
            const isDowngrade = currentPlan.price > plan.price;

            return (
              <div
                key={plan.id}
                className={`${styles.planCard} ${plan.popular ? styles.popularPlan : ''} ${isCurrent ? styles.currentPlanHighlight : ''}`}
              >
                {plan.popular && !isCurrent && (
                  <span className={styles.popularBadge}>Popular</span>
                )}
                {isCurrent && (
                  <span className={styles.currentBadge}>Current</span>
                )}

                <h3 className={styles.planName}>{plan.name}</h3>

                <div className={styles.planPrice}>
                  <span className={styles.amount}>${plan.price}</span>
                  <span className={styles.period}>/month</span>
                </div>

                <div className={styles.planLimits}>
                  <div className={styles.limitItem}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                    <span>{plan.messages} messages</span>
                  </div>
                  <div className={styles.limitItem}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    <span>{plan.chatbots} chatbots</span>
                  </div>
                </div>

                <ul className={styles.featureList}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button className={styles.currentPlanButton} disabled>
                    Current Plan
                  </button>
                ) : (
                  <button
                    className={`${styles.upgradeButton} ${isDowngrade ? styles.downgradeButton : ''}`}
                    onClick={() => handleCheckout(plan.id as 'STARTER' | 'PRO' | 'ENTERPRISE')}
                    disabled={actionPlan === plan.id}
                  >
                    {actionPlan === plan.id ? (
                      <>
                        <span className={styles.buttonSpinner}></span>
                        Processing...
                      </>
                    ) : isDowngrade ? (
                      'Downgrade'
                    ) : (
                      'Upgrade'
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className={styles.billingNote}>
          All prices in USD. Taxes calculated at checkout.{' '}
          <Link href="/pricing" className={styles.link}>View full pricing details</Link>
        </p>
      </section>

      {/* Danger Zone */}
      <section className={styles.dangerSection}>
        <h2 className={styles.dangerTitle}>Danger Zone</h2>

        <div className={styles.dangerCard}>
          <div className={styles.dangerInfo}>
            <h3>Delete Account</h3>
            <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
          </div>

          {!showDelete ? (
            <button
              className={styles.dangerToggle}
              onClick={() => setShowDelete(true)}
            >
              Delete Account
            </button>
          ) : (
            <div className={styles.deleteConfirm}>
              <p className={styles.deleteWarning}>
                This will permanently delete all your chatbots, conversations, and cancel any active subscriptions.
              </p>
              <div className={styles.deleteInputGroup}>
                <label htmlFor="deleteConfirm">Type DELETE to confirm:</label>
                <input
                  id="deleteConfirm"
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="DELETE"
                  className={styles.deleteInput}
                />
              </div>
              {deleteError && (
                <p className={styles.deleteError}>{deleteError}</p>
              )}
              <div className={styles.deleteActions}>
                <button
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowDelete(false);
                    setDeleteInput('');
                    setDeleteError(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmDeleteButton}
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
