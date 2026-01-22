import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy - XeloChat',
  description: 'Privacy Policy for XeloChat AI chatbot platform',
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
            <li><strong>Conversation Data:</strong> Chat messages and interactions with chatbots (stored for service functionality)</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the collected information for the following purposes:</p>
          <ul>
            <li>To provide, maintain, and improve the Service</li>
            <li>To process and fulfill your requests</li>
            <li>To train and improve our AI models (using anonymized data where possible)</li>
            <li>To send notifications, updates, and administrative messages</li>
            <li>To monitor and analyze usage patterns and trends</li>
            <li>To detect, prevent, and address technical issues and security threats</li>
            <li>To comply with legal obligations and enforce our Terms of Service</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Processing and AI Training</h2>
          <p>
            We use artificial intelligence to process website content and generate chatbot responses. This involves:
          </p>
          <ul>
            <li>Analyzing and extracting information from websites you provide</li>
            <li>Training AI models on publicly available content (with appropriate safeguards)</li>
            <li>Generating conversational responses based on your content</li>
          </ul>
          <p>
            We only process publicly available website content. We do not access private, password-protected, or restricted content unless explicitly authorized by you.
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
            We retain your information for as long as necessary to provide the Service and fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal or legitimate business purposes.
          </p>
        </section>

        <section>
          <h2>8. Your Rights and Choices</h2>
          <p>Depending on your jurisdiction, you may have the following rights:</p>
          <ul>
            <li><strong>Access:</strong> Request access to your personal information</li>
            <li><strong>Correction:</strong> Request correction of inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
            <li><strong>Opt-out:</strong> Opt out of certain data processing activities (where applicable)</li>
            <li><strong>Account Management:</strong> Update or delete your account through the dashboard</li>
          </ul>
          <p>
            To exercise these rights, please contact us through the Service or your account dashboard.
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
            Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. We take appropriate measures to ensure your information receives adequate protection in accordance with this Privacy Policy.
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
            XeloChat is operated by Vivero s.r.o. If you have any questions about this Privacy Policy or our data practices, please contact us through the Service or via the contact information provided in your account dashboard.
          </p>
        </section>
      </div>
    </div>
  );
}
