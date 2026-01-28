'use client';

import { useState, useEffect } from 'react';
import { ChatTheme, ClinicData, Message } from '@/types/clinic';
import { scrapeClinicDemoStream, ScrapeProgressEvent } from '@/lib/api';
import { saveSession, loadSession, clearSession } from '@/lib/storage';
import Navbar from '@/components/Navbar';
import SetupForm from '@/components/SetupForm';
import EmbedWidgetLoader from '@/components/EmbedWidgetLoader';
import FAQ, { faqSchema } from '@/components/FAQ';
import styles from './page.module.css';

const createDefaultTheme = (name?: string): ChatTheme => ({
  name: name || 'Assistant',
  tagline: 'AI-powered assistant',
  primaryColor: '#3b82f6',
  backgroundColor: '#ffffff',
  textColor: '#1e293b',
  userBubbleColor: '#3b82f6',
  assistantBubbleColor: '#ffffff',
});

export default function Home() {
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [theme, setTheme] = useState<ChatTheme>(createDefaultTheme());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showCustomizerModal, setShowCustomizerModal] = useState(false);
  const [draftTheme, setDraftTheme] = useState<ChatTheme | null>(null);
  const [scrapeProgress, setScrapeProgress] = useState<{
    status: string;
    pagesScraped: number;
    maxPages: number;
    totalLinksFound: number;
    currentUrl: string;
    scrapedPages: Array<{
      url: string;
      title?: string;
      contentLength?: number;
      status: 'scraping' | 'done' | 'error';
    }>;
    phase: 'scraping' | 'extracting' | 'saving' | 'complete';
  } | null>(null);

  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      setClinicData(saved.clinicData);
      setMessages(saved.messages);
      setTheme(saved.theme || createDefaultTheme(saved.clinicData?.clinic_name));
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (clinicData) {
      saveSession({ clinicData, messages, theme });
    }
  }, [clinicData, messages, theme]);

  const handleSetup = async (url: string) => {
    setError(null);
    setIsLoading(true);
    setScrapeProgress({
      status: 'Connecting to website...',
      pagesScraped: 0,
      maxPages: 50,
      totalLinksFound: 0,
      currentUrl: url,
      scrapedPages: [],
      phase: 'scraping',
    });

    try {
      const data = await scrapeClinicDemoStream(url, (event: ScrapeProgressEvent) => {
        setScrapeProgress(prev => {
          if (!prev) return prev;

          const next = { ...prev };

          switch (event.type) {
            case 'start':
              next.status = 'Connecting to website...';
              next.maxPages = event.maxPages || 50;
              break;
            case 'scraping':
              next.currentUrl = event.url || '';
              next.status = `Scraping page ${(event.pagesScraped || 0) + 1}...`;
              if (event.url && !next.scrapedPages.find(p => p.url === event.url)) {
                next.scrapedPages = [...next.scrapedPages, { url: event.url, status: 'scraping' }];
              }
              break;
            case 'page_done':
              next.pagesScraped = event.pagesScraped || 0;
              next.totalLinksFound = event.totalLinksFound || 0;
              next.status = `Scraped ${event.pagesScraped}/${event.maxPages} pages`;
              next.scrapedPages = next.scrapedPages.map(p =>
                p.url === event.url
                  ? { ...p, status: 'done' as const, title: event.title, contentLength: event.contentLength }
                  : p
              );
              break;
            case 'page_error':
              next.scrapedPages = next.scrapedPages.map(p =>
                p.url === event.url ? { ...p, status: 'error' as const } : p
              );
              break;
            case 'scrape_complete':
              next.status = 'Processing content...';
              next.phase = 'extracting';
              break;
            case 'extracting':
              next.phase = 'extracting';
              next.status = event.message || 'Extracting data...';
              break;
            case 'saving':
              next.phase = 'saving';
              next.status = event.message || 'Saving chatbot...';
              break;
            case 'complete':
              next.phase = 'complete';
              next.status = 'Complete!';
              break;
          }

          return next;
        });
      });
      setClinicData(data);
      setTheme(createDefaultTheme(data.clinic_name));

      if (data.welcomeMessage) {
        setMessages([{ role: 'assistant', content: data.welcomeMessage }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scrape website');
      setScrapeProgress(null);
    } finally {
      setIsLoading(false);
      setScrapeProgress(null);
    }
  };

  const handleReset = () => {
    clearSession();
    setClinicData(null);
    setMessages([]);
    setTheme(createDefaultTheme());
    setError(null);
    setScrapeProgress(null);
  };

  const openCustomizer = () => {
    if (!clinicData) return;
    setDraftTheme({ ...theme });
    setShowCustomizerModal(true);
  };

  const closeCustomizer = () => {
    setShowCustomizerModal(false);
    setDraftTheme(null);
  };

  useEffect(() => {
    const refreshCalendar = () => {
      const calendarWrapper = document.querySelector('[data-calendar-wrapper]');
      if (calendarWrapper) {
        calendarWrapper.classList.add('refreshing');
      }

      const calendarIframe = document.getElementById('xelochat-calendar') as HTMLIFrameElement | null;
      if (!calendarIframe) {
        if (calendarWrapper) {
          calendarWrapper.classList.remove('refreshing');
        }
        return;
      }

      const src = calendarIframe.src;
      calendarIframe.src = '';
      setTimeout(() => {
        calendarIframe.src = src;
        setTimeout(() => {
          if (calendarWrapper) {
            calendarWrapper.classList.remove('refreshing');
          }
        }, 1000);
      }, 100);
    };

    const handler = () => refreshCalendar();
    window.addEventListener('xelochat-booking-submitted', handler);
    return () => window.removeEventListener('xelochat-booking-submitted', handler);
  }, []);

  const applyCustomizer = () => {
    if (draftTheme) {
      setTheme(draftTheme);
    }
    closeCustomizer();
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        {/* Hero */}
        <section id="hero" className={styles.hero}>
          <div className={styles.badge}>AI-Powered Customer Support</div>
          <h1 className={styles.title}>
            Turn any website into<br /><span>an intelligent chatbot</span>
          </h1>
          <p className={styles.description}>
            XeloChat crawls your website, understands your content, and creates a
            smart AI assistant that can answer customer questions 24/7.
          </p>

          <div id="cta" className={styles.formWrapper}>
            <div className={styles.heroCard}>
              <SetupForm
                onSubmit={handleSetup}
                isLoading={isLoading}
                error={error}
                embedded
                onReset={clinicData ? handleReset : undefined}
                progress={scrapeProgress}
              />
              <div className={styles.heroHighlights}>
                <div className={styles.heroHighlight}>
                  <span className={styles.dot} />
                  <div>
                    <p>90-second setup</p>
                    <small>Paste a URL, we crawl the rest</small>
                  </div>
                </div>
                <div className={styles.heroHighlight}>
                  <span className={styles.dot} />
                  <div>
                    <p>One-line embed</p>
                    <small>Drop in the script and go live</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className={styles.subtext}>Free to try. No credit card required.</p>
          <button
            type="button"
            className={styles.customizeBtn}
            onClick={openCustomizer}
            disabled={!clinicData || isLoading}
            title={clinicData ? 'Customize the chatbot appearance' : 'Create your chatbot first'}
          >
            Customize chatbot
          </button>
        </section>

        {/* Social proof */}
        <section className={styles.social}>
          <p className={styles.socialText}>Works with any website</p>
          <div className={styles.logos}>
            <span>Webflow</span>
            <span>Shopify</span>
            <span>WordPress</span>
            <span>Squarespace</span>
            <span>Custom</span>
          </div>
        </section>

        {/* Live Bookings Calendar Demo */}
        <section className={styles.calendarSection}>
          <div className={styles.badge}>Live Demo</div>
          <h2 className={styles.sectionTitle}>AI-Powered Booking System</h2>
          <p className={styles.sectionSub}>
            Try the chatbot widget in the bottom-right corner. Ask to book an appointment and watch
            the AI create a calendar event in real-time. Google Calendar integration is live —
            more integrations like Calendly, Cal.com, and CRM webhooks are coming soon.
          </p>
          <div className={styles.calendarWrapper} data-calendar-wrapper>
            <div className={styles.calendarLoader}>
              <div className={styles.spinner} />
              <span>Refreshing calendar...</span>
            </div>
            <iframe
              id="xelochat-calendar"
              src="https://calendar.google.com/calendar/embed?src=18f28ab12e61762fbccb2124e396d399078f9bd1bcc80b635852d932b7b1a12b%40group.calendar.google.com&ctz=Europe%2FPrague&mode=WEEK&showTitle=0&showNav=1&showPrint=0&showTabs=0&showCalendars=0"
              style={{ border: 0 }}
              width="100%"
              height="500"
              frameBorder="0"
              scrolling="no"
            />
          </div>
        </section>

        {/* Features */}
        <section id="features" className={styles.features}>
          <h2 className={styles.sectionTitle}>Everything you need</h2>
          <p className={styles.sectionSub}>Powerful features to automate customer support</p>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
              </div>
              <h3>Smart Crawling</h3>
              <p>Automatically scans up to 25 pages and extracts products, services, pricing, and FAQs.</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3>Natural Conversations</h3>
              <p>Powered by GPT-4, your chatbot understands context and provides accurate, helpful answers.</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                </svg>
              </div>
              <h3>Easy Integration</h3>
              <p>One script tag to embed anywhere. Works on any website — no coding required.</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <h3>Multilingual</h3>
              <p>Automatically responds in the customer&apos;s language — Slovak, German, Spanish, and more.</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
                </svg>
              </div>
              <h3>Brand Customizable</h3>
              <p>White-label ready. Customize colors and styling to match your brand identity.</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3>Privacy First</h3>
              <p>Your data stays secure. We only read public website content to train your chatbot.</p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className={styles.howSection}>
          <h2 className={styles.sectionTitle}>How it works</h2>
          <p className={styles.sectionSub}>Three simple steps to get started</p>

          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNum}>1</div>
              <h3>Enter your URL</h3>
              <p>Paste your website address and we&apos;ll start crawling immediately</p>
            </div>
            <div className={styles.stepLine}></div>
            <div className={styles.step}>
              <div className={styles.stepNum}>2</div>
              <h3>AI processes content</h3>
              <p>We extract and understand your products, services, and FAQs</p>
            </div>
            <div className={styles.stepLine}></div>
            <div className={styles.step}>
              <div className={styles.stepNum}>3</div>
              <h3>Deploy your chatbot</h3>
              <p>Copy the embed code and add it to your website</p>
            </div>
          </div>
        </section>

        {/* Customization */}
        {clinicData && (
          <section className={styles.customizer}>
            <div className={styles.customizerHeader}>
              <div>
                <h3>Customize your bot</h3>
                <p>Rename it, tweak the tagline, and pick colors before you embed.</p>
              </div>
            </div>

            <div className={styles.customizerGrid}>
              <div className={styles.field}>
                <label htmlFor="botName">Bot name</label>
                <input
                  id="botName"
                  type="text"
                  value={theme.name}
                  onChange={(e) => setTheme({ ...theme, name: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="botTagline">Tagline</label>
                <input
                  id="botTagline"
                  type="text"
                  value={theme.tagline}
                  onChange={(e) => setTheme({ ...theme, tagline: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="primaryColor">Primary color</label>
                <div className={styles.colorRow}>
                  <input
                    id="primaryColor"
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                  />
                  <span>{theme.primaryColor}</span>
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="backgroundColor">Panel background</label>
                <div className={styles.colorRow}>
                  <input
                    id="backgroundColor"
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                  />
                  <span>{theme.backgroundColor}</span>
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="textColor">Text color</label>
                <div className={styles.colorRow}>
                  <input
                    id="textColor"
                    type="color"
                    value={theme.textColor}
                    onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                  />
                  <span>{theme.textColor}</span>
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="userBubbleColor">User bubble</label>
                <div className={styles.colorRow}>
                  <input
                    id="userBubbleColor"
                    type="color"
                    value={theme.userBubbleColor}
                    onChange={(e) => setTheme({ ...theme, userBubbleColor: e.target.value })}
                  />
                  <span>{theme.userBubbleColor}</span>
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="assistantBubbleColor">Assistant bubble</label>
                <div className={styles.colorRow}>
                  <input
                    id="assistantBubbleColor"
                    type="color"
                    value={theme.assistantBubbleColor}
                    onChange={(e) => setTheme({ ...theme, assistantBubbleColor: e.target.value })}
                  />
                  <span>{theme.assistantBubbleColor}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Use cases */}
        <section className={styles.useCases}>
          <h2 className={styles.sectionTitle}>Built for every business</h2>
          <p className={styles.sectionSub}>XeloChat adapts to your industry</p>

          <div className={styles.caseGrid}>
            <div className={styles.caseCard}>
              <span className={styles.caseIcon}>🛒</span>
              <h4>E-commerce</h4>
              <p>&quot;Do you have this in size M?&quot;</p>
            </div>
            <div className={styles.caseCard}>
              <span className={styles.caseIcon}>🚗</span>
              <h4>Car Dealerships</h4>
              <p>&quot;Which SUV has the best fuel economy?&quot;</p>
            </div>
            <div className={styles.caseCard}>
              <span className={styles.caseIcon}>💼</span>
              <h4>SaaS Companies</h4>
              <p>&quot;What&apos;s included in the Pro plan?&quot;</p>
            </div>
            <div className={styles.caseCard}>
              <span className={styles.caseIcon}>🏥</span>
              <h4>Healthcare</h4>
              <p>&quot;What are your opening hours?&quot;</p>
            </div>
          </div>
        </section>

        {/* Embed code section */}
        {clinicData && (
          <section id="embed" className={styles.embedSection}>
            <div className={styles.embedHeader}>
              <div>
                <h3>Ready to embed?</h3>
                <p>Sign up to generate your API key and embed script.</p>
              </div>
              <a href="/sign-in?redirect_url=/dashboard/chatbots" className={styles.copyBtn}>
                Sign up to embed
              </a>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <FAQ />

        {/* CTA */}
        <section className={styles.cta}>
          <h2>Ready to automate your customer support?</h2>
          <p>Create your AI chatbot in under a minute</p>
          <a href="#cta" className={styles.ctaButton}>Get Started Free</a>
        </section>
      </main>

      {/* FAQ Schema for rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerGrid}>
            {/* Brand Section */}
            <div className={styles.footerSection}>
              <div className={styles.footerBrand}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>XeloChat</span>
              </div>
              <p className={styles.footerDescription}>
                AI-powered chatbots that turn any website into an intelligent customer support solution.
              </p>
            </div>

            {/* Product Section */}
            <div className={styles.footerSection}>
              <h4 className={styles.footerHeading}>Product</h4>
              <ul className={styles.footerList}>
                <li><a href="#features" className={styles.footerLink}>Features</a></li>
                <li><a href="#how" className={styles.footerLink}>How it Works</a></li>
                <li><a href="/pricing" className={styles.footerLink}>Pricing</a></li>
                <li><a href="/dashboard" className={styles.footerLink}>Dashboard</a></li>
              </ul>
            </div>

            {/* Resources Section */}
            <div className={styles.footerSection}>
              <h4 className={styles.footerHeading}>Resources</h4>
              <ul className={styles.footerList}>
                <li><a href="/embed-guide" className={styles.footerLink}>Integration Guide</a></li>
                <li><a href="#faq" className={styles.footerLink}>FAQ</a></li>
                <li><a href="mailto:support@xelochat.com" className={styles.footerLink}>Support</a></li>
              </ul>
            </div>

            {/* Legal Section */}
            <div className={styles.footerSection}>
              <h4 className={styles.footerHeading}>Legal</h4>
              <ul className={styles.footerList}>
                <li><a href="/terms" className={styles.footerLink}>Terms of Service</a></li>
                <li><a href="/privacy" className={styles.footerLink}>Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
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

      {/* Widget loaded via embed code - same as what customers get */}
      <EmbedWidgetLoader
        chatbotId={process.env.NEXT_PUBLIC_WIDGET_CHATBOT_ID || ''}
        apiKey={process.env.NEXT_PUBLIC_WIDGET_API_KEY || ''}
        apiUrl={process.env.NEXT_PUBLIC_API_URL || ''}
      />


      {/* Customizer modal */}
      {showCustomizerModal && draftTheme && clinicData && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <h3>Customize chatbot</h3>
                <p>Adjust name, tagline, and colors with a live preview.</p>
              </div>
              <button className={styles.modalClose} onClick={closeCustomizer} aria-label="Close">
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalForm}>
                <div className={styles.field}>
                  <label htmlFor="modalBotName">Bot name</label>
                  <input
                    id="modalBotName"
                    type="text"
                    value={draftTheme.name}
                    onChange={(e) => setDraftTheme({ ...draftTheme, name: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="modalBotTagline">Tagline</label>
                  <input
                    id="modalBotTagline"
                    type="text"
                    value={draftTheme.tagline}
                    onChange={(e) => setDraftTheme({ ...draftTheme, tagline: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="modalPrimary">Primary color</label>
                  <div className={styles.colorRow}>
                    <input
                      id="modalPrimary"
                      type="color"
                      value={draftTheme.primaryColor}
                      onChange={(e) => setDraftTheme({ ...draftTheme, primaryColor: e.target.value })}
                    />
                    <span>{draftTheme.primaryColor}</span>
                  </div>
                </div>
                <div className={styles.field}>
                  <label htmlFor="modalBg">Panel background</label>
                  <div className={styles.colorRow}>
                    <input
                      id="modalBg"
                      type="color"
                      value={draftTheme.backgroundColor}
                      onChange={(e) => setDraftTheme({ ...draftTheme, backgroundColor: e.target.value })}
                    />
                    <span>{draftTheme.backgroundColor}</span>
                  </div>
                </div>
                <div className={styles.field}>
                  <label htmlFor="modalText">Text color</label>
                  <div className={styles.colorRow}>
                    <input
                      id="modalText"
                      type="color"
                      value={draftTheme.textColor}
                      onChange={(e) => setDraftTheme({ ...draftTheme, textColor: e.target.value })}
                    />
                    <span>{draftTheme.textColor}</span>
                  </div>
                </div>
                <div className={styles.field}>
                  <label htmlFor="modalUser">User bubble</label>
                  <div className={styles.colorRow}>
                    <input
                      id="modalUser"
                      type="color"
                      value={draftTheme.userBubbleColor}
                      onChange={(e) => setDraftTheme({ ...draftTheme, userBubbleColor: e.target.value })}
                    />
                    <span>{draftTheme.userBubbleColor}</span>
                  </div>
                </div>
                <div className={styles.field}>
                  <label htmlFor="modalAssistant">Assistant bubble</label>
                  <div className={styles.colorRow}>
                    <input
                      id="modalAssistant"
                      type="color"
                      value={draftTheme.assistantBubbleColor}
                      onChange={(e) => setDraftTheme({ ...draftTheme, assistantBubbleColor: e.target.value })}
                    />
                    <span>{draftTheme.assistantBubbleColor}</span>
                  </div>
                </div>
              </div>

              <div className={styles.modalPreview}>
                <div
                  className={styles.previewCard}
                  style={{
                    ['--chat-primary' as any]: draftTheme.primaryColor,
                    ['--chat-bg' as any]: draftTheme.backgroundColor,
                    ['--chat-text' as any]: draftTheme.textColor,
                    ['--chat-muted' as any]: draftTheme.textColor,
                    ['--chat-user' as any]: draftTheme.userBubbleColor,
                    ['--chat-user-text' as any]: draftTheme.backgroundColor,
                    ['--chat-assistant' as any]: draftTheme.assistantBubbleColor,
                    ['--chat-assistant-border' as any]: '#e4e4e7',
                  }}
                >
                  <div className={styles.previewHeader}>
                    <div>
                      <h4>{draftTheme.name || clinicData.clinic_name}</h4>
                      <p>{draftTheme.tagline || 'AI-powered assistant'}</p>
                    </div>
                  </div>
                  <div className={styles.previewMessages}>
                    <div className={`${styles.previewBubble} ${styles.previewAssistant}`}>
                      Hi! Ask me anything about your site.
                    </div>
                    <div className={`${styles.previewBubble} ${styles.previewUser}`}>
                      Show me your services.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.secondary} type="button" onClick={closeCustomizer}>
                Cancel
              </button>
              <button className={styles.button} type="button" onClick={applyCustomizer}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
