import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import EmbedGuideContent from './EmbedGuideContent';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'How to Add Chatbot to Your Website - Integration Guide',
  description:
    'Step-by-step guide to add XeloChat to WordPress, Shopify, Wix, Squarespace, or any website. One line of code, 2-minute setup. Works everywhere.',
  keywords: [
    'add chatbot to website',
    'WordPress chatbot plugin',
    'Shopify chatbot',
    'Wix chatbot integration',
    'Squarespace chatbot',
    'embed chatbot',
    'website chat widget',
    'install chatbot',
    'chatbot integration guide',
  ],
  alternates: {
    canonical: '/embed-guide',
  },
  openGraph: {
    title: 'Add AI Chatbot to Any Website - XeloChat Integration Guide',
    description:
      'Simple integration for WordPress, Shopify, Wix, Squarespace, and custom sites. Copy, paste, done.',
    url: '/embed-guide',
    type: 'article',
  },
  twitter: {
    title: 'How to Add XeloChat to Your Website',
    description:
      'One line of code. Works on WordPress, Shopify, Wix, and any website.',
  },
};

// JSON-LD for How-To Guide
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Add a Chatbot to Your Website',
  description:
    'Step-by-step guide to add an AI chatbot to any website in under 2 minutes.',
  totalTime: 'PT2M',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'USD',
    value: '0',
  },
  tool: [
    {
      '@type': 'HowToTool',
      name: 'XeloChat account',
    },
    {
      '@type': 'HowToTool',
      name: 'Access to your website code or CMS',
    },
  ],
  step: [
    {
      '@type': 'HowToStep',
      name: 'Get your embed code',
      text: 'Sign up for XeloChat and copy your unique embed code from the dashboard.',
      url: 'https://www.xelochat.com/dashboard',
    },
    {
      '@type': 'HowToStep',
      name: 'Add the code to your website',
      text: 'Paste the script tag before the closing </body> tag in your website HTML.',
    },
    {
      '@type': 'HowToStep',
      name: 'Customize (optional)',
      text: 'Add data attributes to customize colors, position, and bot name.',
    },
    {
      '@type': 'HowToStep',
      name: 'Go live',
      text: 'Save your changes and refresh your website. The chatbot will appear in the bottom-right corner.',
    },
  ],
};

export default function EmbedGuide() {
  return (
    <div className={styles.page}>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToSchema),
        }}
      />

      <Navbar />

      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.badge}>Integration Guide</div>
          <h1 className={styles.title}>
            Add your chatbot to <span>any website</span>
          </h1>
          <p className={styles.description}>
            One line of code. Works on WordPress, Wix, Shopify, Squarespace, and
            any custom website.
          </p>
        </section>

        <EmbedGuideContent />
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerCopyright}>
            &copy; {new Date().getFullYear()} XeloChat. All rights reserved.
          </p>
          <div className={styles.footerLinks}>
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <a href="/">Home</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
