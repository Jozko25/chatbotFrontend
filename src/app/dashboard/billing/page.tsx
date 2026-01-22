'use client';

import { useEffect, useState } from 'react';
import {
  createBillingPortalSession,
  createCheckoutSession,
  getBillingStatus,
  BillingStatus,
  deleteAccount
} from '@/lib/api';
import dashboardStyles from '../dashboard.module.css';
import styles from './billing.module.css';

type Currency = 'EUR';

const PLANS = [
  {
    id: 'STARTER',
    name: 'Starter',
    summary: 'Remove branding and capture booking requests by email.',
    features: ['500 messages', '2 chatbots', 'Email lead capture', 'Booking requests via email']
  },
  {
    id: 'PRO',
    name: 'Pro',
    summary: 'Serious booking workflows with calendar automation.',
    features: ['2000+ messages', 'Up to 4 chatbots', 'Google Calendar integration', 'Auto booking toggle', 'Priority support']
  },
] as const;

function formatDate(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
}

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const currency: Currency = 'EUR';
  const [loading, setLoading] = useState(true);
  const [actionPlan, setActionPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      const { url } = await createCheckoutSession({ plan, currency });
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Checkout session did not return a URL');
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
      } else {
        throw new Error('Portal session did not return a URL');
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
      setDeleteError('Type DELETE to confirm account removal.');
      return;
    }
    setIsDeleting(true);
    try {
      await deleteAccount();
      window.location.href = '/auth/logout';
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

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Billing</h1>
          <p className={styles.intro}>
            Upgrade to unlock higher message limits for your widget chatbots.
          </p>
        </div>
        {billing?.subscription && (
          <button
            className={dashboardStyles.secondaryBtn}
            onClick={handlePortal}
            disabled={portalLoading}
          >
            {portalLoading ? 'Opening...' : 'Manage Subscription'}
          </button>
        )}
      </div>

      {error && (
        <div className={dashboardStyles.emptyState}>
          <p>Error: {error}</p>
        </div>
      )}

      <section className={styles.section}>
        <div className={styles.statusCard}>
          <h2>Current Plan</h2>
          <div className={styles.statusRow}>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Plan</span>
              <span>{billing?.plan || 'FREE'}</span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Subscription Status</span>
              <span>{billing?.subscription?.status || 'none'}</span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Renews On</span>
              <span>{formatDate(billing?.subscription?.currentPeriodEnd || null)}</span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Cancel At Period End</span>
              <span>{billing?.subscription?.cancelAtPeriodEnd ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Choose a Plan</h2>
        <div className={styles.plansGrid}>
          {PLANS.map((plan) => {
            const isCurrent = billing?.plan === plan.id;
            return (
              <div key={plan.id} className={styles.planCard}>
                <div>
                  <div className={styles.planTitle}>{plan.name}</div>
                  <div className={styles.planMeta}>{plan.summary}</div>
                </div>
                <div className={styles.planFeatures}>
                  {plan.features.join(' • ')}
                </div>
                <div className={styles.planActions}>
                  {isCurrent ? (
                    <span className={styles.planMeta}>Current plan</span>
                  ) : (
                    <button
                      className={dashboardStyles.primaryBtn}
                      onClick={() => handleCheckout(plan.id)}
                      disabled={actionPlan === plan.id}
                    >
                      {actionPlan === plan.id ? 'Redirecting...' : 'Upgrade'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className={styles.note}>
          Pricing is billed in EUR for now. Taxes are handled in Stripe Checkout.
        </p>
      </section>

      <section className={styles.section}>
        <div className={styles.dangerCard}>
          <div className={styles.dangerHeader}>
            <div>
              <h2>Delete account</h2>
              <p className={styles.dangerText}>
                This permanently removes all chatbots, data, and cancels active subscriptions.
              </p>
            </div>
            <button
              type="button"
              className={styles.dangerToggle}
              onClick={() => setShowDelete((prev) => !prev)}
            >
              {showDelete ? 'Hide' : 'Delete Account'}
            </button>
          </div>

          {showDelete && (
            <div className={styles.dangerActions}>
              <label className={styles.dangerLabel}>
                Type DELETE to confirm
                <input
                  className={styles.dangerInput}
                  value={deleteInput}
                  onChange={(event) => setDeleteInput(event.target.value)}
                  placeholder="DELETE"
                />
              </label>
              <button
                type="button"
                className={styles.dangerBtn}
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
              {deleteError && (
                <div className={styles.dangerWarning}>{deleteError}</div>
              )}
              <div className={styles.dangerNote}>
                This action cannot be undone.
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
