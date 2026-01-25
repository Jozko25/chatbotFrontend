import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Pricing - XeloChat',
  description: 'Simple pricing for XeloChat chatbot plans.',
};

const PLANS = [
  {
    name: 'Free',
    price: 'Free',
    subtitle: 'Perfect for trying the widget on one site.',
    features: [
      '50 messages',
      '1 chatbot',
      'Website-trained',
      'Lead capture only',
      'No calendar integration'
    ],
    highlight: false,
    cta: { label: 'Start Free', href: '/sign-up' }
  },
  {
    name: 'Starter',
    price: 'EUR 12',
    subtitle: 'For early-stage teams capturing leads by email.',
    features: [
      '500 messages',
      '2 chatbots',
      'Email lead capture',
      'Remove branding',
      'Booking requests via email'
    ],
    highlight: false,
    cta: { label: 'Choose Starter', href: '/sign-up' }
  },
  {
    name: 'Pro',
    price: 'EUR 39',
    subtitle: 'Bookings + automation for serious businesses.',
    features: [
      '2000+ messages',
      'Up to 4 chatbots',
      'Google Calendar integration',
      'Auto booking toggle',
      'Priority support'
    ],
    highlight: true,
    cta: { label: 'Choose Pro', href: '/sign-up' }
  }
] as const;

export default function PricingPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.badge}>Pricing</div>
          <h1 className={styles.title}>Honest pricing for real bookings.</h1>
          <p className={styles.description}>
            Start with lead capture, upgrade when bookings become core to your business.
          </p>
        </section>

        <section className={styles.plans}>
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`${styles.planCard} ${plan.highlight ? styles.highlight : ''}`}
            >
              <div className={styles.planHeader}>
                <div>
                  <h2>{plan.name}</h2>
                  <p className={styles.planSubtitle}>{plan.subtitle}</p>
                </div>
                {plan.highlight && <span className={styles.planBadge}>Most Popular</span>}
              </div>
              <div className={styles.planPrice}>
                <span>{plan.price}</span>
                {plan.price !== 'Free' && <small>per month</small>}
              </div>
              <ul className={styles.planFeatures}>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <a href={plan.cta.href} className={styles.planCta}>
                {plan.cta.label}
              </a>
            </div>
          ))}
        </section>

        <section className={styles.footerNote}>
          <p>
            Need enterprise onboarding, security review, or custom limits? Reach out and we&apos;ll tailor a plan.
          </p>
        </section>
      </main>
    </div>
  );
}
