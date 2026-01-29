import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Pricing - Simple, Transparent Plans',
  description:
    'XeloChat pricing starts free. Choose from Starter ($18/mo), Pro ($49/mo), or Enterprise ($99/mo) plans. No hidden fees, cancel anytime.',
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
      'Start free with 50 messages. Upgrade to Starter, Pro, or Enterprise as you grow.',
    url: '/pricing',
    type: 'website',
  },
};

const pricingSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'XeloChat',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'AI-powered chatbot platform that turns any website into an intelligent customer support assistant with Google Calendar integration, multilingual support, and automatic website crawling.',
  url: 'https://xelochat.com',
  offers: [
    {
      '@type': 'Offer',
      name: 'Free Plan',
      price: '0',
      priceCurrency: 'USD',
      priceValidUntil: '2025-12-31',
      description: 'Try XeloChat free with 1 chatbot, 50 messages/month, website-trained AI, and basic lead capture',
      availability: 'https://schema.org/InStock',
      itemOffered: {
        '@type': 'Service',
        name: 'XeloChat Free',
        description: '1 chatbot, 50 messages/month, website-trained AI'
      }
    },
    {
      '@type': 'Offer',
      name: 'Starter Plan',
      price: '18',
      priceCurrency: 'USD',
      priceValidUntil: '2025-12-31',
      description: 'Starter plan for small businesses: 2 chatbots, 500 messages/month, remove branding, booking requests via email',
      availability: 'https://schema.org/InStock',
      itemOffered: {
        '@type': 'Service',
        name: 'XeloChat Starter',
        description: '2 chatbots, 500 messages/month, remove branding'
      }
    },
    {
      '@type': 'Offer',
      name: 'Pro Plan',
      price: '49',
      priceCurrency: 'USD',
      priceValidUntil: '2025-12-31',
      description: 'Pro plan for growing businesses: 4 chatbots, 2000 messages/month, Google Calendar integration, auto booking, priority support',
      availability: 'https://schema.org/InStock',
      itemOffered: {
        '@type': 'Service',
        name: 'XeloChat Pro',
        description: '4 chatbots, 2000 messages/month, Google Calendar integration'
      }
    },
    {
      '@type': 'Offer',
      name: 'Enterprise Plan',
      price: '99',
      priceCurrency: 'USD',
      priceValidUntil: '2025-12-31',
      description: 'Enterprise plan for high-volume businesses: Unlimited chatbots, unlimited messages, all integrations included',
      availability: 'https://schema.org/InStock',
      itemOffered: {
        '@type': 'Service',
        name: 'XeloChat Enterprise',
        description: 'Unlimited chatbots and messages, all integrations'
      }
    }
  ],
  featureList: [
    'Smart website crawling - automatically scans up to 25 pages',
    'GPT-4 powered natural language conversations',
    'Multilingual support - responds in customer language',
    'Google Calendar integration for appointment booking',
    'One-line embed code - works on any website',
    'White-label customization',
    'Lead capture and booking requests',
    '90-second setup - no coding required'
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '127',
    bestRating: '5',
    worstRating: '1'
  }
};

const PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    price: 0,
    description: 'Try XeloChat on your website',
    features: [
      { text: '50 messages/month', included: true },
      { text: '1 chatbot', included: true },
      { text: 'Website-trained AI', included: true },
      { text: 'Basic lead capture', included: true },
      { text: 'XeloChat branding', included: false, note: 'Branding shown' },
    ],
    cta: 'Get Started',
    href: '/sign-up',
    popular: false,
  },
  {
    id: 'STARTER',
    name: 'Starter',
    price: 18,
    description: 'For small businesses getting started',
    features: [
      { text: '500 messages/month', included: true },
      { text: '2 chatbots', included: true },
      { text: 'Website-trained AI', included: true },
      { text: 'Email lead capture', included: true },
      { text: 'Remove XeloChat branding', included: true },
      { text: 'Booking requests via email', included: true },
    ],
    cta: 'Start Free Trial',
    href: '/sign-up',
    popular: false,
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 49,
    description: 'For growing businesses with automation needs',
    features: [
      { text: '2,000 messages/month', included: true },
      { text: 'Up to 4 chatbots', included: true },
      { text: 'Website-trained AI', included: true },
      { text: 'Advanced lead capture', included: true },
      { text: 'Remove XeloChat branding', included: true },
      { text: 'Google Calendar integration', included: true },
      { text: 'Auto booking', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'Start Free Trial',
    href: '/sign-up',
    popular: true,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 99,
    description: 'For high-volume businesses at scale',
    features: [
      { text: 'Unlimited messages', included: true },
      { text: 'Unlimited chatbots', included: true },
      { text: 'Website-trained AI', included: true },
      { text: 'Advanced lead capture', included: true },
      { text: 'All integrations', included: true },

    ],
    cta: 'Contact Sales',
    href: '/sign-up',
    popular: false,
  },
];

const FAQ = [
  {
    q: 'Can I change plans later?',
    a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated.',
  },
  {
    q: 'What happens if I exceed my message limit?',
    a: 'Your chatbot will pause until the next billing cycle. We\'ll notify you before you reach your limit so you can upgrade if needed.',
  },
  {
    q: 'Is there a free trial?',
    a: 'The Free plan lets you try XeloChat with 50 messages/month. No credit card required to start.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.',
  },
];

export default function PricingPage() {
  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />

      <Navbar />

      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <span className={styles.badge}>Pricing</span>
          <h1 className={styles.title}>
            Simple pricing for every stage
          </h1>
          <p className={styles.subtitle}>
            Start free, upgrade as you grow. No hidden fees, cancel anytime.
          </p>
        </section>

        {/* Plans Grid */}
        <section className={styles.plansSection}>
          <div className={styles.plansGrid}>
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`${styles.planCard} ${plan.popular ? styles.popularCard : ''}`}
              >
                {plan.popular && (
                  <div className={styles.popularBadge}>Most Popular</div>
                )}

                <div className={styles.planHeader}>
                  <h2 className={styles.planName}>{plan.name}</h2>
                  <p className={styles.planDescription}>{plan.description}</p>
                </div>

                <div className={styles.planPricing}>
                  <span className={styles.price}>
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className={styles.period}>/month</span>
                  )}
                </div>

                <Link
                  href={plan.href}
                  className={`${styles.planCta} ${plan.popular ? styles.ctaPrimary : styles.ctaSecondary}`}
                >
                  {plan.cta}
                </Link>

                <ul className={styles.featureList}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className={styles.featureItem}>
                      {feature.included ? (
                        <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className={styles.crossIcon} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={!feature.included ? styles.featureDisabled : ''}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <h2 className={styles.faqTitle}>Frequently asked questions</h2>
          <div className={styles.faqGrid}>
            {FAQ.map((item, idx) => (
              <div key={idx} className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>{item.q}</h3>
                <p className={styles.faqAnswer}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Ready to automate your customer support?</h2>
          <p className={styles.ctaSubtitle}>Create your first AI chatbot in under 90 seconds.</p>
          <Link href="/sign-up" className={styles.ctaButton}>
            Get Started Free
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>&copy; {new Date().getFullYear()} XeloChat. All rights reserved.</p>
          <div className={styles.footerLinks}>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
