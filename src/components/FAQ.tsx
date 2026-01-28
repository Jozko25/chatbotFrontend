'use client';

import { useState } from 'react';
import styles from './FAQ.module.css';

const faqs = [
  {
    question: 'How does XeloChat work?',
    answer:
      'XeloChat crawls your website, extracts information about your products, services, and FAQs, then creates an AI chatbot that can answer customer questions based on your content. Setup takes about 90 seconds.',
  },
  {
    question: 'Do I need coding skills to use XeloChat?',
    answer:
      'No coding skills required. Simply paste your website URL, wait for the AI to process your content, then copy a single line of embed code to your website. Works with WordPress, Shopify, Wix, Squarespace, and any custom site.',
  },
  {
    question: 'What languages does XeloChat support?',
    answer:
      "XeloChat automatically detects and responds in the customer's language. It supports English, Spanish, German, French, Italian, Portuguese, Slovak, Czech, Polish, and many other languages.",
  },
  {
    question: 'Is there a free plan?',
    answer:
      'Yes! The free plan includes 1 chatbot and 50 messages per month. No credit card required to start. Upgrade anytime as your needs grow.',
  },
  {
    question: 'Can the chatbot book appointments?',
    answer:
      'Yes, with the Pro plan and above, XeloChat integrates with Google Calendar to automatically book appointments. The AI handles the conversation and creates calendar events in real-time.',
  },
  {
    question: 'How do I add the chatbot to my website?',
    answer:
      'Add one line of JavaScript to your website before the closing </body> tag. Detailed instructions are available for WordPress, Shopify, Wix, Squarespace, and custom sites in our integration guide.',
  },
];

// JSON-LD Schema for FAQ (exported for use in head)
export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.faq} id="faq">
      <h2 className={styles.title}>Frequently Asked Questions</h2>
      <p className={styles.subtitle}>
        Everything you need to know about XeloChat
      </p>

      <div className={styles.faqList}>
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`${styles.faqItem} ${openIndex === index ? styles.open : ''}`}
          >
            <button
              className={styles.faqQuestion}
              onClick={() => toggleFaq(index)}
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span>{faq.question}</span>
              <svg
                className={styles.chevron}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div
              id={`faq-answer-${index}`}
              className={styles.faqAnswer}
              role="region"
              aria-labelledby={`faq-question-${index}`}
            >
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
