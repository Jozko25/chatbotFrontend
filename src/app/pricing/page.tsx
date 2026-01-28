import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Pricing - Simple, Transparent Plans',
  description:
    'XeloChat pricing starts free. Choose from Starter ($19/mo), Pro ($49/mo), or Enterprise ($149/mo) plans. No hidden fees, cancel anytime. Start with 50 free messages.',
  keywords: [
    'chatbot pricing',
    'AI chatbot cost',
    'customer support pricing',
    'chatbot plans',
    'affordable chatbot',
    'free chatbot trial',
  ],
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'XeloChat Pricing - Plans for Every Business Size',
    description:
      'Start free with 50 messages. Upgrade to Starter, Pro, or Enterprise as you grow. Transparent pricing, no surprises.',
    url: '/pricing',
    type: 'website',
  },
  twitter: {
    title: 'XeloChat Pricing - Start Free, Scale As You Grow',
    description:
      'Free plan available. Pro features from $19/mo. See our transparent pricing.',
  },
};

// JSON-LD for Pricing Page
const pricingSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'XeloChat',
  description: 'AI-powered chatbot for websites',
  brand: {
    '@type': 'Brand',
    name: 'XeloChat',
  },
  offers: [
    {
      '@type': 'Offer',
      name: 'Free Plan',
      price: '0',
      priceCurrency: 'USD',
      description: '1 chatbot, 50 messages per month',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'Starter Plan',
      price: '19',
      priceCurrency: 'USD',
      priceValidUntil: '2027-12-31',
      description: '2 chatbots, 500 messages per month',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'Pro Plan',
      price: '49',
      priceCurrency: 'USD',
      priceValidUntil: '2027-12-31',
      description: '4 chatbots, 2000+ messages per month',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'Enterprise Plan',
      price: '149',
      priceCurrency: 'USD',
      priceValidUntil: '2027-12-31',
      description: 'Unlimited chatbots and messages',
      availability: 'https://schema.org/InStock',
    },
  ],
};

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    subtitle: 'Perfect for trying the widget on one site.',
    features: [
      '50 messages/month',
      '1 chatbot',
      'Website-trained AI',
      'Lead capture',
      'XeloChat branding',
    ],
    highlight: false,
    cta: { label: 'Start Free', href: '/sign-up' },
  },
  {
    name: 'Starter',
    price: '$19',
    subtitle: 'For small businesses capturing leads.',
    features: [
      '500 messages/month',
      '2 chatbots',
      'Email lead capture',
      'Remove branding',
      'Booking requests via email',
    ],
    highlight: false,
    cta: { label: 'Choose Starter', href: '/sign-up' },
  },
  {
    name: 'Pro',
    price: '$49',
    subtitle: 'Bookings + automation for growing businesses.',
    features: [
      '2,000 messages/month',
      'Up to 4 chatbots',
      'Google Calendar integration',
      'Auto booking toggle',
      'Priority support',
    ],
    highlight: true,
    cta: { label: 'Choose Pro', href: '/sign-up' },
  },
  {
    name: 'Enterprise',
    price: '$149',
    subtitle: 'For high-volume businesses at scale.',
    features: [
      'Unlimited messages',
      'Unlimited chatbots',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
    ],
    highlight: false,
    cta: { label: 'Contact Sales', href: '/sign-up' },
  },
] as const;

export default function PricingPage() {
  return (
    <div className={styles.page}>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pricingSchema),
        }}
      />

      <Navbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.badge}>Pricing</div>
          <h1 className={styles.title}>Simple, transparent pricing</h1>
          <p className={styles.description}>
            Start free. Upgrade when you need more. No hidden fees, cancel anytime.
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
                {plan.price !== '$0' && <small>/month</small>}
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
            Need enterprise onboarding, security review, or custom limits?{' '}
            <a href="mailto:sales@xelochat.com">Contact our sales team</a>.
          </p>
        </section>
      </main>
    </div>
  );
}
