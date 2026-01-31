import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'XeloChat Privacy Policy. Learn how we collect, use, and protect your data. GDPR compliant. We never sell your information.',
  alternates: {
    canonical: '/privacy',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            XeloChat is operated by Vivero s.r.o (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI chatbot platform and services.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Information You Provide</h3>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, and authentication credentials</li>
            <li><strong>Website Content:</strong> URLs and content from websites you request us to crawl</li>
            <li><strong>Chatbot Configuration:</strong> Customization settings, branding, and preferences</li>
            <li><strong>Booking Information:</strong> Customer names, emails, phone numbers, and appointment details (when booking features are used)</li>
          </ul>

          <h3>2.2 Automatically Collected Information</h3>
          <ul>
            <li><strong>Usage Data:</strong> How you interact with the Service, features used, and time spent</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, and operating system</li>
            <li><strong>Log Data:</strong> Server logs, error reports, and performance metrics</li>
            <li><strong>Conversation Data:</strong> Chat messages and interactions with chatbots on websites that use our widget (stored for service provision, quality control, and support—see Section 2.4)</li>
          </ul>

          <h3>2.3 Chat Widget and Visitor Data</h3>
          <p>
            When visitors interact with an AI chatbot embedded on a client&apos;s website, we may collect and store:
          </p>
          <ul>
            <li><strong>Chat messages:</strong> The content of conversations between visitors and the chatbot</li>
            <li><strong>Session identifiers:</strong> Technical identifiers used to associate messages with a single conversation</li>
            <li><strong>Metadata:</strong> Timestamp, user agent (browser/device type), and optionally the page URL where the chat occurred</li>
          </ul>
          <p>
            <strong>Purpose and legal basis:</strong> We process this data under legitimate interest (GDPR Art. 6(1)(f)) for: providing and improving the service, quality control, debugging, fraud prevention, and generating aggregated analytics. We may also process under contract (Art. 6(1)(b)) where necessary to deliver the chatbot service.
          </p>
          <p>
            <strong>Transparency:</strong> We require our clients to inform their website visitors that chats may be monitored and stored. Our clients are responsible for providing appropriate notices in their privacy policies or near the chat widget.
          </p>

          <h3>2.4 Aggregated Analytics (No Raw Chats Shared With Clients)</h3>
          <p>
            We analyze chat interactions in aggregated and anonymized form. We provide our clients with insights such as: top requested services, most common topics, trends over time, and suggested website improvements. We do <strong>not</strong> share raw conversation transcripts, session IDs, or any personally identifiable information with our clients. This approach minimizes privacy risk and complies with data protection best practices.
          </p>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the collected information for the following purposes:</p>
          <ul>
            <li>To provide, maintain, and improve the Service</li>
            <li>To process and fulfill your requests</li>
            <li>To train and improve our AI models (using anonymized data where possible and as disclosed)</li>
            <li>To send notifications, updates, and administrative messages</li>
            <li>To monitor and analyze usage patterns and trends</li>
            <li>To detect, prevent, and address technical issues and security threats</li>
            <li>To provide clients with aggregated, anonymized analytics (e.g., top topics, service categories, website friction insights)—never raw chat transcripts</li>
            <li>To comply with legal obligations and enforce our Terms of Service</li>
          </ul>
          <p>
            We do not use chat data for marketing, profiling, or selling to third parties without explicit consent.
          </p>
        </section>

        <section>
          <h2>4. Data Processing and AI Training</h2>
          <p>
            We use artificial intelligence to process website content and generate chatbot responses. This involves:
          </p>
          <ul>
            <li>Analyzing and extracting information from websites you provide</li>
            <li>Generating conversational responses based on your content</li>
            <li>Optionally using anonymized or aggregated chat data to improve our AI models, where disclosed and in line with our legitimate interest—we do not use identifiable personal data for AI training without appropriate legal basis and transparency</li>
          </ul>
          <p>
            We only process publicly available website content. We do not access private, password-protected, or restricted content unless explicitly authorized by you.
          </p>
        </section>

        <section>
          <h2>4a. Chat Widget Notice (For Clients)</h2>
          <p>
            If you embed XeloChat on your website, we recommend you display a short notice near the chat widget, for example:
          </p>
          <p className={styles.noticeExample}>
            &quot;Chats may be monitored and stored for support, quality improvement, and anonymized analytics. See our Privacy Policy for details.&quot;
          </p>
          <p>
            This helps meet transparency requirements under GDPR and similar regulations.
          </p>
        </section>

        <section>
          <h2>5. Information Sharing and Disclosure</h2>
          <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
          <ul>
            <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our Service (e.g., cloud hosting, email services, analytics)</li>
            <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with notice to users)</li>
            <li><strong>Protection of Rights:</strong> To protect our rights, property, or safety, or that of our users</li>
            <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
          </ul>
        </section>

        <section>
          <h2>6. Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect your information, including:
          </p>
          <ul>
            <li>Encryption of data in transit and at rest</li>
            <li>Secure authentication and access controls</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Rate limiting and abuse prevention mechanisms</li>
            <li>Secure API endpoints with authentication requirements</li>
          </ul>
          <p>
            However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2>7. Data Retention</h2>
          <p>
            We retain your information for as long as necessary to provide the Service and fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
          </p>
          <ul>
            <li><strong>Raw chat messages:</strong> Typically 30 to 180 days, after which they are deleted or anonymized. We may retain longer only where required for debugging, legal obligations, or legitimate business needs.</li>
            <li><strong>Aggregated analytics:</strong> Anonymized statistics (e.g., topic counts, trends) may be retained longer for reporting and service improvement, as they do not constitute personal data.</li>
            <li><strong>Account data:</strong> When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal or legitimate business purposes.</li>
          </ul>
        </section>

        <section>
          <h2>8. Your Rights and Choices (GDPR)</h2>
          <p>If you are in the EU/EEA or your data is subject to GDPR, you have the following rights:</p>
          <ul>
            <li><strong>Access (Art. 15):</strong> Request a copy of your personal information</li>
            <li><strong>Correction (Art. 16):</strong> Request correction of inaccurate information</li>
            <li><strong>Deletion (Art. 17):</strong> Request deletion of your personal information, unless we have a legal basis to retain it</li>
            <li><strong>Portability (Art. 20):</strong> Request your data in a portable format</li>
            <li><strong>Objection (Art. 21):</strong> Object to processing based on legitimate interest</li>
            <li><strong>Restriction (Art. 18):</strong> Request restriction of processing in certain circumstances</li>
            <li><strong>Complaint:</strong> Lodge a complaint with your local data protection authority</li>
          </ul>
          <p>
            Visitors who use a chat widget on a client&apos;s website may also request access to or deletion of their chat data. To exercise any of these rights, contact us through the Service or your account dashboard. We will respond within the timeframes required by applicable law.
          </p>
        </section>

        <section>
          <h2>9. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our Service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
          </p>
        </section>

        <section>
          <h2>10. Third-Party Services</h2>
          <p>
            Our Service may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any information.
          </p>
        </section>

        <section>
          <h2>11. Children&apos;s Privacy</h2>
          <p>
            Our Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us, and we will take steps to delete such information.
          </p>
        </section>

        <section>
          <h2>12. International Data Transfers</h2>
          <p>
            We operate from the European Union (Slovakia). Your information may be transferred to and processed in countries outside the EU/EEA, including the United States (e.g., for cloud hosting, payment processing via Stripe, or AI providers). Where such transfers occur, we ensure adequate safeguards are in place:
          </p>
          <ul>
            <li><strong>Standard Contractual Clauses (SCCs):</strong> We use EU-approved Standard Contractual Clauses with sub-processors where required.</li>
            <li><strong>Data minimization:</strong> We transfer only the data necessary for the stated purposes and prefer EU hosting where feasible.</li>
          </ul>
          <p>
            If you have questions about international transfers, please contact us.
          </p>
        </section>

        <section>
          <h2>13. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section>
          <h2>14. Contact Us</h2>
          <p>
            XeloChat is operated by Vivero s.r.o. If you have any questions about this Privacy Policy, our data practices, or wish to exercise your GDPR rights (access, deletion, etc.), please contact us at support@xelochat.com or through the contact information provided in your account dashboard.
          </p>
        </section>
      </div>
    </div>
  );
}
