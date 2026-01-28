'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function EmbedGuideContent() {
  const [activeTab, setActiveTab] = useState('wordpress');
  const [copied, setCopied] = useState(false);

  const embedCode = `<script
  src="https://www.xelochat.com/embed.js"
  data-chatbot-id="YOUR_CHATBOT_ID"
  async>
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Quick Start */}
      <section className={styles.quickStart}>
        <h2 className={styles.sectionTitle}>Quick Start</h2>
        <p className={styles.sectionSub}>
          Copy this embed code and paste it into your website. That&apos;s it.
        </p>

        <div className={styles.codeBlock}>
          <button
            className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
            onClick={copyToClipboard}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <pre>{embedCode}</pre>
        </div>

        <div className={styles.note}>
          <strong>Note:</strong> Replace <code>YOUR_CHATBOT_ID</code> with your
          actual chatbot ID from the dashboard.
        </div>
      </section>

      {/* Platform Instructions */}
      <section className={styles.platforms}>
        <h2 className={styles.sectionTitle}>Platform Instructions</h2>
        <p className={styles.sectionSub}>
          Select your platform for step-by-step instructions
        </p>

        <div className={styles.platformGrid}>
          {['wordpress', 'wix', 'shopify', 'squarespace', 'custom'].map(
            (platform) => (
              <button
                key={platform}
                className={`${styles.platformBtn} ${activeTab === platform ? styles.active : ''}`}
                onClick={() => setActiveTab(platform)}
              >
                <h4>{platform.charAt(0).toUpperCase() + platform.slice(1)}</h4>
                <p>
                  {platform === 'custom' ? 'Any website' : 'Website builder'}
                </p>
              </button>
            )
          )}
        </div>

        <div className={styles.instructions}>
          {activeTab === 'wordpress' && (
            <>
              <h3>WordPress</h3>
              <p className={styles.instructionsSub}>
                Two easy methods to add the chatbot to your WordPress site
              </p>

              <h4 className={styles.methodTitle}>
                Method 1: Using a Plugin (Recommended)
              </h4>
              <ol className={styles.steps}>
                <li>
                  <strong>
                    Install &quot;Insert Headers and Footers&quot; plugin
                  </strong>
                  <span>
                    Go to Plugins &rarr; Add New &rarr; Search &rarr; Install and
                    Activate
                  </span>
                </li>
                <li>
                  <strong>
                    Navigate to Settings &rarr; Insert Headers and Footers
                  </strong>
                  <span>In your WordPress admin dashboard</span>
                </li>
                <li>
                  <strong>
                    Paste the embed code in &quot;Scripts in Footer&quot;
                  </strong>
                  <span>
                    This ensures the widget loads after your page content
                  </span>
                </li>
                <li>
                  <strong>Save Changes</strong>
                  <span>Visit your site to see the chatbot in action</span>
                </li>
              </ol>

              <h4 className={styles.methodTitle}>Method 2: Edit Theme Files</h4>
              <ol className={styles.steps}>
                <li>
                  <strong>Go to Appearance &rarr; Theme File Editor</strong>
                  <span>In your WordPress admin dashboard</span>
                </li>
                <li>
                  <strong>Select footer.php</strong>
                  <span>Find &quot;Theme Footer&quot; in the right sidebar</span>
                </li>
                <li>
                  <strong>Paste the code before &lt;/body&gt;</strong>
                  <span>Right before the closing body tag</span>
                </li>
                <li>
                  <strong>Update File</strong>
                  <span>Save your changes</span>
                </li>
              </ol>

              <div className={styles.warning}>
                <strong>Note:</strong> If you update your theme, you&apos;ll need
                to re-add the code. Using a plugin avoids this issue.
              </div>
            </>
          )}

          {activeTab === 'wix' && (
            <>
              <h3>Wix</h3>
              <p className={styles.instructionsSub}>
                Add the chatbot using Wix&apos;s custom code feature
              </p>

              <ol className={styles.steps}>
                <li>
                  <strong>Open your Wix Editor</strong>
                  <span>Log in and click &quot;Edit Site&quot;</span>
                </li>
                <li>
                  <strong>Click Settings &rarr; Custom Code</strong>
                  <span>Or go to Marketing &amp; SEO &rarr; Custom Code</span>
                </li>
                <li>
                  <strong>Click &quot;+ Add Custom Code&quot;</strong>
                  <span>In the Body - end section</span>
                </li>
                <li>
                  <strong>Paste your embed code</strong>
                  <span>Give it a name like &quot;Chatbot Widget&quot;</span>
                </li>
                <li>
                  <strong>Apply to All Pages</strong>
                  <span>Select this option for site-wide coverage</span>
                </li>
                <li>
                  <strong>Publish your site</strong>
                  <span>Click Publish to make changes live</span>
                </li>
              </ol>

              <div className={styles.tip}>
                <strong>Pro tip:</strong> The chatbot automatically positions
                itself, so you don&apos;t need to worry about placement!
              </div>
            </>
          )}

          {activeTab === 'shopify' && (
            <>
              <h3>Shopify</h3>
              <p className={styles.instructionsSub}>
                Add the chatbot to your Shopify store theme
              </p>

              <ol className={styles.steps}>
                <li>
                  <strong>Go to Online Store &rarr; Themes</strong>
                  <span>In your Shopify admin dashboard</span>
                </li>
                <li>
                  <strong>Click Actions &rarr; Edit code</strong>
                  <span>On your current active theme</span>
                </li>
                <li>
                  <strong>Find theme.liquid</strong>
                  <span>Under Layout in the left sidebar</span>
                </li>
                <li>
                  <strong>Locate the &lt;/body&gt; tag</strong>
                  <span>Use Ctrl+F (Cmd+F on Mac) to search</span>
                </li>
                <li>
                  <strong>Paste the embed code before &lt;/body&gt;</strong>
                  <span>Add it right before the closing tag</span>
                </li>
                <li>
                  <strong>Save</strong>
                  <span>Click Save in the top right corner</span>
                </li>
              </ol>
            </>
          )}

          {activeTab === 'squarespace' && (
            <>
              <h3>Squarespace</h3>
              <p className={styles.instructionsSub}>
                Use Squarespace&apos;s Code Injection feature
              </p>

              <ol className={styles.steps}>
                <li>
                  <strong>
                    Go to Settings &rarr; Advanced &rarr; Code Injection
                  </strong>
                  <span>In your Squarespace admin panel</span>
                </li>
                <li>
                  <strong>Scroll to the Footer section</strong>
                  <span>
                    This loads the chatbot after your page content
                  </span>
                </li>
                <li>
                  <strong>Paste the embed code</strong>
                  <span>Add it directly in the Footer code box</span>
                </li>
                <li>
                  <strong>Save</strong>
                  <span>Click Save at the top</span>
                </li>
              </ol>

              <div className={styles.tip}>
                <strong>That&apos;s it!</strong> Squarespace makes it super easy
                with Code Injection.
              </div>
            </>
          )}

          {activeTab === 'custom' && (
            <>
              <h3>Custom HTML / Any Website</h3>
              <p className={styles.instructionsSub}>
                Works on Webflow, Carrd, Ghost, and any custom site
              </p>

              <ol className={styles.steps}>
                <li>
                  <strong>Open your HTML file</strong>
                  <span>Or access your website&apos;s HTML editor</span>
                </li>
                <li>
                  <strong>Find the &lt;/body&gt; tag</strong>
                  <span>Usually near the end of your HTML file</span>
                </li>
                <li>
                  <strong>Paste the embed code before &lt;/body&gt;</strong>
                  <span>Right before the closing tag</span>
                </li>
                <li>
                  <strong>Save and upload</strong>
                  <span>Deploy your updated file</span>
                </li>
              </ol>
            </>
          )}
        </div>
      </section>

      {/* Customization */}
      <section className={styles.customization}>
        <h2 className={styles.sectionTitle}>Customization</h2>
        <p className={styles.sectionSub}>
          Personalize your chatbot with these optional attributes
        </p>

        <div className={styles.optionsGrid}>
          <ul className={styles.optionsList}>
            <li>
              <code>data-bot-name</code> &mdash; Custom name for your chatbot
            </li>
            <li>
              <code>data-tagline</code> &mdash; Subtitle shown in the header
            </li>
          </ul>
          <ul className={styles.optionsList}>
            <li>
              <code>data-primary-color</code> &mdash; Brand color (hex code)
            </li>
            <li>
              <code>data-position</code> &mdash; &quot;bottom-right&quot; or
              &quot;bottom-left&quot;
            </li>
          </ul>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className={styles.troubleshooting}>
        <h2 className={styles.sectionTitle}>Troubleshooting</h2>
        <p className={styles.sectionSub}>Common issues and solutions</p>

        <div className={styles.troubleGrid}>
          <div className={styles.troubleItem}>
            <h4>Chatbot not appearing?</h4>
            <ul>
              <li>Clear your browser cache and refresh</li>
              <li>Check that you replaced YOUR_CHATBOT_ID</li>
              <li>Make sure the script is before &lt;/body&gt;</li>
              <li>Check browser console for errors (F12)</li>
            </ul>
          </div>
          <div className={styles.troubleItem}>
            <h4>Need help?</h4>
            <ul>
              <li>The widget uses Shadow DOM &mdash; no CSS conflicts</li>
              <li>Try changing position to &quot;bottom-left&quot;</li>
              <li>Contact support@xelochat.com for assistance</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <h2>Ready to add your chatbot?</h2>
        <p>Create your first chatbot in under 90 seconds</p>
        <a href="/dashboard" className={styles.ctaButton}>
          Go to Dashboard
        </a>
      </section>
    </>
  );
}
