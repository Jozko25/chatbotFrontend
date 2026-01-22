'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function EmbedGuide() {
    const [activeTab, setActiveTab] = useState('wordpress');
    const [copied, setCopied] = useState(false);

    const embedCode = `<script 
  src="https://yourdomain.com/widget.js" 
  data-chatbot-id="YOUR_CHATBOT_ID"
  data-api-url="https://your-backend.railway.app" 
  async>
</script>`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(embedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={styles['guide-container']}>
            <div className={styles['guide-content']}>
                <a href="/" className={styles['back-button']}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Home
                </a>

                <div className={styles.header}>
                    <h1 className={styles.title}>📚 Embedding Guide</h1>
                    <p className={styles.subtitle}>
                        Step-by-step instructions to add your chatbot to any website platform
                    </p>
                </div>

                {/* Quick Start */}
                <div className={styles.card}>
                    <h2>
                        <span>⚡</span>
                        Quick Start
                    </h2>
                    <p>
                        Adding your chatbot is as simple as copying one line of code and pasting it into your website.
                        The widget works on any platform and automatically adapts to your site's design.
                    </p>

                    <div className={styles['code-block']}>
                        <button
                            className={`${styles['copy-button']} ${copied ? styles.copied : ''}`}
                            onClick={copyToClipboard}
                        >
                            {copied ? '✓ Copied!' : 'Copy'}
                        </button>
                        <pre>{embedCode}</pre>
                    </div>

                    <div className={`${styles.alert} ${styles.info}`}>
                        <div className={styles['alert-icon']}>ℹ️</div>
                        <p>
                            <strong>Replace the placeholders:</strong> You'll get your unique chatbot ID and API URL from your dashboard after creating a chatbot.
                        </p>
                    </div>
                </div>

                {/* Platform Selection */}
                <div className={styles.card}>
                    <h2>
                        <span>🌐</span>
                        Choose Your Platform
                    </h2>
                    <p>Select your website platform for detailed instructions:</p>

                    <div className={styles['platform-grid']}>
                        <div
                            className={styles['platform-card']}
                            onClick={() => setActiveTab('wordpress')}
                            style={{ borderColor: activeTab === 'wordpress' ? '#667eea' : '#dee2e6' }}
                        >
                            <h4>WordPress</h4>
                            <p>Most popular CMS platform</p>
                        </div>

                        <div
                            className={styles['platform-card']}
                            onClick={() => setActiveTab('wix')}
                            style={{ borderColor: activeTab === 'wix' ? '#667eea' : '#dee2e6' }}
                        >
                            <h4>Wix</h4>
                            <p>Drag-and-drop website builder</p>
                        </div>

                        <div
                            className={styles['platform-card']}
                            onClick={() => setActiveTab('shopify')}
                            style={{ borderColor: activeTab === 'shopify' ? '#667eea' : '#dee2e6' }}
                        >
                            <h4>Shopify</h4>
                            <p>E-commerce platform</p>
                        </div>

                        <div
                            className={styles['platform-card']}
                            onClick={() => setActiveTab('squarespace')}
                            style={{ borderColor: activeTab === 'squarespace' ? '#667eea' : '#dee2e6' }}
                        >
                            <h4>Squarespace</h4>
                            <p>All-in-one website builder</p>
                        </div>

                        <div
                            className={styles['platform-card']}
                            onClick={() => setActiveTab('custom')}
                            style={{ borderColor: activeTab === 'custom' ? '#667eea' : '#dee2e6' }}
                        >
                            <h4>Custom HTML</h4>
                            <p>Any other website</p>
                        </div>
                    </div>
                </div>

                {/* WordPress Instructions */}
                {activeTab === 'wordpress' && (
                    <div className={styles.card}>
                        <h2>WordPress Installation</h2>

                        <h3>Method 1: Using a Plugin (Recommended)</h3>
                        <ol className={styles.steps}>
                            <li>
                                <strong>Install "Insert Headers and Footers" plugin</strong><br />
                                Go to Plugins → Add New → Search for "Insert Headers and Footers" → Install and Activate
                            </li>
                            <li>
                                <strong>Navigate to Settings → Insert Headers and Footers</strong><br />
                                In your WordPress admin dashboard
                            </li>
                            <li>
                                <strong>Paste the embed code</strong><br />
                                Paste your chatbot script into the "Scripts in Footer" section
                            </li>
                            <li>
                                <strong>Save Changes</strong><br />
                                Click "Save" and visit your website to see the chatbot appear!
                            </li>
                        </ol>

                        <h3>Method 2: Edit Theme Files</h3>
                        <ol className={styles.steps}>
                            <li>
                                <strong>Go to Appearance → Theme File Editor</strong><br />
                                In your WordPress admin dashboard
                            </li>
                            <li>
                                <strong>Select footer.php</strong><br />
                                Find and click on "Theme Footer" (footer.php) in the right sidebar
                            </li>
                            <li>
                                <strong>Add the script before &lt;/body&gt;</strong><br />
                                Paste your embed code just before the closing &lt;/body&gt; tag
                            </li>
                            <li>
                                <strong>Update File</strong><br />
                                Click "Update File" to save your changes
                            </li>
                        </ol>

                        <div className={`${styles.alert} ${styles.alert}`}>
                            <div className={styles['alert-icon']}>⚠️</div>
                            <p>
                                <strong>Note:</strong> If you update your theme, you'll need to re-add the code. Using a plugin (Method 1) avoids this issue.
                            </p>
                        </div>
                    </div>
                )}

                {/* Wix Instructions */}
                {activeTab === 'wix' && (
                    <div className={styles.card}>
                        <h2>Wix Installation</h2>

                        <ol className={styles.steps}>
                            <li>
                                <strong>Open your Wix Editor</strong><br />
                                Log in to Wix and click "Edit Site" on your website
                            </li>
                            <li>
                                <strong>Add an Embed Element</strong><br />
                                Click the "+" button → Embed → Custom Embeds → "Embed a Widget"
                            </li>
                            <li>
                                <strong>Click "Add Custom Code"</strong><br />
                                In the settings panel that appears on the left
                            </li>
                            <li>
                                <strong>Paste your embed code</strong><br />
                                Paste the chatbot script into the code box
                            </li>
                            <li>
                                <strong>Set code placement</strong><br />
                                Choose "Body - end" for optimal performance
                            </li>
                            <li>
                                <strong>Apply to all pages</strong><br />
                                Select "All pages" so the chatbot appears site-wide
                            </li>
                            <li>
                                <strong>Publish your site</strong><br />
                                Click "Publish" in the top right to make your chatbot live
                            </li>
                        </ol>

                        <div className={`${styles.alert} ${styles.success}`}>
                            <div className={styles['alert-icon']}>✓</div>
                            <p>
                                <strong>Pro tip:</strong> The chatbot will automatically position itself in the bottom-right corner, so you don't need to worry about placement!
                            </p>
                        </div>
                    </div>
                )}

                {/* Shopify Instructions */}
                {activeTab === 'shopify' && (
                    <div className={styles.card}>
                        <h2>Shopify Installation</h2>

                        <ol className={styles.steps}>
                            <li>
                                <strong>Go to Online Store → Themes</strong><br />
                                In your Shopify admin dashboard
                            </li>
                            <li>
                                <strong>Click "Actions" → "Edit code"</strong><br />
                                On your current theme
                            </li>
                            <li>
                                <strong>Find theme.liquid</strong><br />
                                In the left sidebar under "Layout", click on "theme.liquid"
                            </li>
                            <li>
                                <strong>Locate the &lt;/body&gt; tag</strong><br />
                                Scroll down or use Ctrl+F (Cmd+F on Mac) to find the closing &lt;/body&gt; tag
                            </li>
                            <li>
                                <strong>Paste the embed code</strong><br />
                                Add your chatbot script just before the &lt;/body&gt; tag
                            </li>
                            <li>
                                <strong>Save the file</strong><br />
                                Click "Save" in the top right corner
                            </li>
                        </ol>

                        <div className={`${styles.alert} ${styles.info}`}>
                            <div className={styles['alert-icon']}>ℹ️</div>
                            <p>
                                <strong>E-commerce ready:</strong> Your chatbot can help customers with product questions, shipping info, and more!
                            </p>
                        </div>
                    </div>
                )}

                {/* Squarespace Instructions */}
                {activeTab === 'squarespace' && (
                    <div className={styles.card}>
                        <h2>Squarespace Installation</h2>

                        <ol className={styles.steps}>
                            <li>
                                <strong>Go to Settings → Advanced → Code Injection</strong><br />
                                In your Squarespace admin panel
                            </li>
                            <li>
                                <strong>Scroll to "Footer" section</strong><br />
                                This ensures the chatbot loads after your page content
                            </li>
                            <li>
                                <strong>Paste the embed code</strong><br />
                                Add your chatbot script in the Footer code box
                            </li>
                            <li>
                                <strong>Save your changes</strong><br />
                                Click "Save" at the top of the page
                            </li>
                            <li>
                                <strong>View your site</strong><br />
                                The chatbot should now appear on all pages of your website
                            </li>
                        </ol>

                        <div className={`${styles.alert} ${styles.success}`}>
                            <div className={styles['alert-icon']}>✓</div>
                            <p>
                                <strong>That's it!</strong> Squarespace makes it super easy with their Code Injection feature.
                            </p>
                        </div>
                    </div>
                )}

                {/* Custom HTML Instructions */}
                {activeTab === 'custom' && (
                    <div className={styles.card}>
                        <h2>Custom HTML / Other Platforms</h2>

                        <p>
                            For any website where you can edit HTML, simply add the embed code before the closing &lt;/body&gt; tag:
                        </p>

                        <ol className={styles.steps}>
                            <li>
                                <strong>Open your HTML file</strong><br />
                                Or access your website's HTML editor
                            </li>
                            <li>
                                <strong>Find the &lt;/body&gt; tag</strong><br />
                                Usually near the end of your HTML file
                            </li>
                            <li>
                                <strong>Paste the embed code</strong><br />
                                Add your chatbot script just before &lt;/body&gt;
                            </li>
                            <li>
                                <strong>Save and upload</strong><br />
                                Save your file and upload it to your server if needed
                            </li>
                        </ol>

                        <div className={styles['code-block']}>
                            <pre>{`<!DOCTYPE html>
<html>
<head>
  <title>Your Website</title>
</head>
<body>
  <!-- Your website content -->
  
  <!-- SiteBot Widget -->
  <script 
    src="https://yourdomain.com/widget.js" 
    data-chatbot-id="YOUR_CHATBOT_ID"
    async>
  </script>
</body>
</html>`}</pre>
                        </div>

                        <div className={`${styles.alert} ${styles.info}`}>
                            <div className={styles['alert-icon']}>ℹ️</div>
                            <p>
                                <strong>Works everywhere:</strong> This method works on any platform that allows custom HTML, including Webflow, Carrd, Ghost, and more.
                            </p>
                        </div>
                    </div>
                )}

                {/* Customization Options */}
                <div className={styles.card}>
                    <h2>
                        <span>🎨</span>
                        Customization Options
                    </h2>
                    <p>You can customize your chatbot's appearance using data attributes:</p>

                    <div className={styles['code-block']}>
                        <pre>{`<script 
  src="https://yourdomain.com/widget.js" 
  data-chatbot-id="YOUR_CHATBOT_ID"
  data-bot-name="My Business"
  data-tagline="How can we help?"
  data-primary-color="#ff6b6b"
  data-position="bottom-left"
  async>
</script>`}</pre>
                    </div>

                    <h3>Available Options:</h3>
                    <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                        <li><strong>data-bot-name</strong> - Custom name for your chatbot</li>
                        <li><strong>data-tagline</strong> - Subtitle shown in the header</li>
                        <li><strong>data-primary-color</strong> - Brand color (hex code)</li>
                        <li><strong>data-position</strong> - "bottom-right" or "bottom-left"</li>
                    </ul>
                </div>

                {/* Troubleshooting */}
                <div className={styles.card}>
                    <h2>
                        <span>🔧</span>
                        Troubleshooting
                    </h2>

                    <h3>Chatbot not appearing?</h3>
                    <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                        <li>Clear your browser cache and refresh the page</li>
                        <li>Check that you've replaced YOUR_CHATBOT_ID with your actual ID</li>
                        <li>Make sure the script is placed before the &lt;/body&gt; tag</li>
                        <li>Check browser console for any JavaScript errors (F12 → Console)</li>
                    </ul>

                    <h3>Widget conflicts with my site?</h3>
                    <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                        <li>The widget uses Shadow DOM for complete CSS isolation</li>
                        <li>If you still see issues, try changing the position to "bottom-left"</li>
                        <li>Contact support if problems persist</li>
                    </ul>

                    <h3>Need help?</h3>
                    <p>
                        Contact us at <strong>support@xelochat.com</strong> and we'll help you get set up!
                    </p>
                </div>

                {/* Get Started CTA */}
                <div className={styles.card} style={{ textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <h2 style={{ color: 'white' }}>Ready to add your chatbot?</h2>
                    <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '25px' }}>
                        Create your first chatbot in under 90 seconds
                    </p>
                    <a
                        href="/dashboard"
                        style={{
                            display: 'inline-block',
                            background: 'white',
                            color: '#667eea',
                            padding: '14px 32px',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '1.1rem',
                            transition: 'transform 0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Go to Dashboard →
                    </a>
                </div>
            </div>
        </div>
    );
}
