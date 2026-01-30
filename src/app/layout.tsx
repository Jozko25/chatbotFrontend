import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.xelochat.com';

export const metadata: Metadata = {
  // Basic Meta Tags
  title: {
    default: 'XeloChat - AI Chatbots for Any Website | 90-Second Setup',
    template: '%s | XeloChat',
  },
  description:
    'Create AI-powered chatbots that learn from your website content and answer customer questions 24/7. Works on WordPress, Shopify, Wix, and any website. Free to start.',
  keywords: [
    'AI chatbot',
    'website chatbot',
    'customer support automation',
    'chatbot builder',
    'AI customer service',
    'live chat widget',
    'chatbot for website',
    'WordPress chatbot',
    'Shopify chatbot',
    'automated customer support',
    'GPT chatbot',
    'conversational AI',
    'website assistant',
    'lead capture chatbot',
    'booking chatbot',
  ],
  authors: [{ name: 'XeloChat', url: SITE_URL }],
  creator: 'XeloChat',
  publisher: 'XeloChat',
  applicationName: 'XeloChat',
  generator: 'Next.js',

  // Canonical & Alternate
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'XeloChat',
    title: 'XeloChat - AI Chatbots for Any Website',
    description:
      'Create AI-powered chatbots that learn from your website content and answer customer questions 24/7. 90-second setup, no coding required.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'XeloChat - AI Chatbots for Any Website',
        type: 'image/png',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'XeloChat - AI Chatbots for Any Website',
    description:
      'Create AI-powered chatbots that learn from your website content. 90-second setup, works on any website.',
    images: ['/og-image.png'],
    creator: '@xelochat',
    site: '@xelochat',
  },

  // Icons - using SVG for scalability, PNG can be generated from these
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icons/icon-512.svg', color: '#3b82f6' },
    ],
  },

  // Manifest
  manifest: '/manifest.json',

  // Verification (add your actual verification codes)
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    // yandex: 'your-yandex-verification',
    // bing: 'your-bing-verification',
  },

  // App Links
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'XeloChat',
  },

  // Format Detection
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // Category
  category: 'technology',

  // Other
  other: {
    'msapplication-TileColor': '#3b82f6',
    'msapplication-config': '/browserconfig.xml',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

// JSON-LD Structured Data
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'XeloChat',
  url: SITE_URL,
  logo: `${SITE_URL}/icons/icon-512.png`,
  description:
    'XeloChat provides AI-powered chatbots that learn from your website content and answer customer questions 24/7.',
  sameAs: [
    'https://twitter.com/xelochat',
    // 'https://linkedin.com/company/xelochat',
    // 'https://github.com/xelochat',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@xelochat.com',
    contactType: 'customer support',
    availableLanguage: ['English'],
  },
};

const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'XeloChat',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'AI-powered chatbot builder that automatically learns from your website content.',
  url: SITE_URL,
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '0',
    highPrice: '149',
    priceCurrency: 'USD',
    offerCount: '4',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free',
        price: '0',
        priceCurrency: 'USD',
        description: '1 chatbot, 50 messages/month',
      },
      {
        '@type': 'Offer',
        name: 'Starter',
        price: '19',
        priceCurrency: 'USD',
        description: '2 chatbots, 500 messages/month',
      },
      {
        '@type': 'Offer',
        name: 'Pro',
        price: '49',
        priceCurrency: 'USD',
        description: '4 chatbots, 2000 messages/month',
      },
      {
        '@type': 'Offer',
        name: 'Enterprise',
        price: '149',
        priceCurrency: 'USD',
        description: 'Unlimited chatbots and messages',
      },
    ],
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '150',
    bestRating: '5',
    worstRating: '1',
  },
  featureList: [
    'AI-powered responses',
    'Website content learning',
    '90-second setup',
    'Multi-language support',
    'Calendar integration',
    'Lead capture',
    'Custom branding',
    'Analytics dashboard',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'XeloChat',
  url: SITE_URL,
  description: 'AI Chatbots for Any Website',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
        <head>
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id="61ccaf47-dbae-46a4-9d52-6a94a3d945c4"
            strategy="afterInteractive"
          />
          {/* Preconnect to external domains for performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

          {/* JSON-LD Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationSchema),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(softwareApplicationSchema),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(websiteSchema),
            }}
          />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
