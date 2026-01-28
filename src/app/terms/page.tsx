import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'XeloChat Terms of Service. Read our terms and conditions for using the AI chatbot platform. Fair usage policy and user responsibilities.',
  alternates: {
    canonical: '/terms',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Terms of Service</h1>
        <p className={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of XeloChat, an AI-powered chatbot platform operated by Vivero s.r.o (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing and using XeloChat (&quot;Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            XeloChat is an AI-powered chatbot platform that allows users to create, customize, and deploy chatbots on their websites. The Service includes web crawling, content processing, AI-powered conversation generation, and widget embedding capabilities.
          </p>
        </section>

        <section>
          <h2>3. User Accounts and Registration</h2>
          <p>
            To use certain features of the Service, you must register for an account. You agree to:
          </p>
          <ul>
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and update your information to keep it accurate</li>
            <li>Maintain the security of your password and identification</li>
            <li>Accept all responsibility for activities that occur under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>
        </section>

        <section>
          <h2>4. Acceptable Use</h2>
          <p>You agree not to use the Service to:</p>
          <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe upon the rights of others</li>
            <li>Transmit any harmful, offensive, or illegal content</li>
            <li>Attempt to gain unauthorized access to the Service or related systems</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Use the Service for any fraudulent or malicious purposes</li>
            <li>Scrape or crawl websites without proper authorization</li>
            <li>Generate content that violates intellectual property rights</li>
          </ul>
        </section>

        <section>
          <h2>5. Content and Intellectual Property</h2>
          <p>
            You retain all rights to the content you provide to the Service. By using the Service, you grant Vivero s.r.o (the operator of XeloChat) a license to use, process, and store your content solely for the purpose of providing the Service. You represent and warrant that you have all necessary rights to the content you provide.
          </p>
          <p>
            The Service, including its original content, features, and functionality, is owned by Vivero s.r.o and is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>
        </section>

        <section>
          <h2>6. AI-Generated Content</h2>
          <p>
            The Service uses artificial intelligence to generate responses. You acknowledge that:
          </p>
          <ul>
            <li>AI-generated content may contain errors or inaccuracies</li>
            <li>AI responses are informational only and not legal, financial, or medical advice</li>
            <li>You are responsible for reviewing and verifying all AI-generated content</li>
            <li>Vivero s.r.o (operator of XeloChat) is not liable for any consequences resulting from reliance on AI-generated content</li>
          </ul>
        </section>

        <section>
          <h2>7. Privacy and Data Protection</h2>
          <p>
            Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand how we collect, use, and protect your information.
          </p>
        </section>

        <section>
          <h2>8. Service Availability</h2>
          <p>
            We strive to maintain high availability of the Service but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or unforeseen circumstances. We reserve the right to modify, suspend, or discontinue the Service at any time.
          </p>
        </section>

        <section>
          <h2>9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Vivero s.r.o (operator of XeloChat) shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
          </p>
        </section>

        <section>
          <h2>10. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Vivero s.r.o, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising out of your use of the Service, violation of these Terms, or infringement of any rights of another.
          </p>
        </section>

        <section>
          <h2>11. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Service will cease immediately.
          </p>
        </section>

        <section>
          <h2>12. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the &quot;Last updated&quot; date. Your continued use of the Service after such changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2>13. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions. Any disputes arising from these Terms or the Service shall be resolved through appropriate legal channels.
          </p>
        </section>

        <section>
          <h2>14. Contact Information</h2>
          <p>
            XeloChat is operated by Vivero s.r.o. If you have any questions about these Terms, please contact us through the Service or via the contact information provided in your account dashboard.
          </p>
        </section>
      </div>
    </div>
  );
}
