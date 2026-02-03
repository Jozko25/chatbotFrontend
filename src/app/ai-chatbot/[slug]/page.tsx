import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
  PROGRAMMATIC_VARIATIONS,
  getVariationBySlug,
  getProgrammaticSlugs,
} from '@/data/programmatic-seo';
import styles from './page.module.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://www.xelochat.com';
const BASE_PATH = '/ai-chatbot';

export async function generateStaticParams() {
  return getProgrammaticSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const variation = getVariationBySlug(slug);
  if (!variation) {
    return { title: 'Not Found' };
  }
  const canonical = `${SITE_URL.replace(/\/$/, '')}${BASE_PATH}/${slug}`;
  return {
    title: variation.metaTitle,
    description: variation.metaDescription,
    alternates: {
      canonical,
    },
    openGraph: {
      title: variation.metaTitle,
      description: variation.metaDescription,
      url: canonical,
      type: 'website',
    },
  };
}

function getRelatedSlugs(currentSlug: string, count: number = 8): string[] {
  const others = PROGRAMMATIC_VARIATIONS.filter((v) => v.slug !== currentSlug);
  return others.slice(0, count).map((v) => v.slug);
}

export default async function ProgrammaticPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const variation = getVariationBySlug(slug);
  if (!variation) {
    notFound();
  }

  const relatedSlugs = getRelatedSlugs(slug);
  const relatedVariations = relatedSlugs
    .map((s) => PROGRAMMATIC_VARIATIONS.find((v) => v.slug === s))
    .filter(Boolean) as typeof PROGRAMMATIC_VARIATIONS;

  return (
    <div className={styles.container}>
      <Navbar />

      <main className={styles.main}>
        <article className={styles.content}>
          <header className={styles.hero}>
            <h1>Best AI Chatbot for {variation.title}</h1>
            <p className={styles.intro}>{variation.introParagraph}</p>
          </header>

          <section className={styles.section}>
            <h2>Why {variation.title} Needs an AI Chatbot</h2>
            <p>
              Visitors to {variation.title.toLowerCase()} websites expect instant answers—about
              services, pricing, availability, and next steps. An AI chatbot trained on your
              content can answer these questions 24/7, capture leads, and book appointments
              without adding headcount. XeloChat crawls your site once and keeps responses
              accurate and on-brand.
            </p>
          </section>

          <section className={styles.section}>
            <h2>How XeloChat Helps {variation.title}</h2>
            <ul>
              <li>
                <strong>One embed, no coding</strong> — Add a script tag to your site and
                point the chatbot at your URL. It learns your pages automatically.
              </li>
              <li>
                <strong>Multilingual</strong> — Replies in the visitor&apos;s language
                (Slovak, German, Spanish, and more).
              </li>
              <li>
                <strong>Booking</strong> — Pro plans include Google Calendar integration
                so visitors can book appointments from the chat.
              </li>
              <li>
                <strong>Lead capture</strong> — Collect emails and requests directly in the
                conversation.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>How to Choose an AI Chatbot Provider</h2>
            <p>
              Look for a solution that trains on your own content (not generic scripts),
              offers transparent pricing, and lets you own your data. XeloChat gives you
              one free chatbot and 50 messages per month to try—no credit card required.
              Upgrade when you need more bots, messages, or features like calendar
              booking.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Getting Started</h2>
            <p>
              Paste your website URL on the XeloChat homepage. We crawl your site, build
              the knowledge base, and give you an embed code. Add it to your {variation.title.toLowerCase()}{' '}
              site and go live in minutes. You can customize the chatbot&apos;s name,
              colors, and tagline from your dashboard.
            </p>
          </section>

          <section className={styles.ctaSection}>
            <p className={styles.ctaTitle}>Ready to add an AI chatbot to your {variation.title} site?</p>
            <p className={styles.ctaSub}>Free to start. No credit card required.</p>
            <Link href="/#cta" className={styles.ctaButton}>
              Get Started Free
            </Link>
          </section>

          {relatedVariations.length > 0 && (
            <nav className={styles.related} aria-label="Related industries">
              <p className={styles.relatedTitle}>AI chatbot by industry</p>
              <div className={styles.relatedLinks}>
                {relatedVariations.map((v) => (
                  <Link
                    key={v.slug}
                    href={`${BASE_PATH}/${v.slug}`}
                    className={styles.relatedLink}
                  >
                    {v.title}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </article>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerGrid}>
            <div className={styles.footerSection}>
              <div className={styles.footerBrand}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                XeloChat
              </div>
              <p className={styles.footerDescription}>
                AI-powered chatbots that turn any website into an intelligent customer support solution.
              </p>
            </div>
            <div className={styles.footerSection}>
              <h4 className={styles.footerHeading}>Product</h4>
              <ul className={styles.footerList}>
                <li><a href="/#features" className={styles.footerLink}>Features</a></li>
                <li><a href="/#how" className={styles.footerLink}>How it Works</a></li>
                <li><a href="/pricing" className={styles.footerLink}>Pricing</a></li>
                <li><a href="/dashboard" className={styles.footerLink}>Dashboard</a></li>
              </ul>
            </div>
            <div className={styles.footerSection}>
              <h4 className={styles.footerHeading}>Resources</h4>
              <ul className={styles.footerList}>
                <li><a href="/ai-chatbot/healthcare" className={styles.footerLink}>Use cases</a></li>
                <li><a href="/embed-guide" className={styles.footerLink}>Integration Guide</a></li>
                <li><a href="/#faq" className={styles.footerLink}>FAQ</a></li>
                <li><a href="mailto:support@xelochat.com" className={styles.footerLink}>Support</a></li>
              </ul>
            </div>
            <div className={styles.footerSection}>
              <h4 className={styles.footerHeading}>Legal</h4>
              <ul className={styles.footerList}>
                <li><a href="/terms" className={styles.footerLink}>Terms</a></li>
                <li><a href="/privacy" className={styles.footerLink}>Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p className={styles.footerCopyright}>
              © {new Date().getFullYear()} XeloChat. All rights reserved.
            </p>
            <div className={styles.footerLegal}>
              <a href="/terms" className={styles.footerLink}>Terms</a>
              <span className={styles.footerSeparator}>•</span>
              <a href="/privacy" className={styles.footerLink}>Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
