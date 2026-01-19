'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getChatbot, deleteChatbot, createApiKey, getApiKeys, updateChatbotSettings, updateNotificationSettings, Chatbot, ApiKey } from '@/lib/api';
import styles from '../../dashboard.module.css';

export default function ChatbotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;

  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyDomains, setNewKeyDomains] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  // AI Settings state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [customKnowledge, setCustomKnowledge] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Editable clinic data state
  const [editClinicName, setEditClinicName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editOpeningHours, setEditOpeningHours] = useState('');
  const [editServices, setEditServices] = useState('');
  const [savingClinicData, setSavingClinicData] = useState(false);
  const [clinicDataSuccess, setClinicDataSuccess] = useState(false);

  // Notification & Communication settings state
  const [notificationEmail, setNotificationEmail] = useState('');
  const [notificationWebhook, setNotificationWebhook] = useState('');
  const [notifyOnBooking, setNotifyOnBooking] = useState(true);
  const [bookingEnabled, setBookingEnabled] = useState(true);
  const [communicationStyle, setCommunicationStyle] = useState<'PROFESSIONAL' | 'FRIENDLY' | 'CASUAL' | 'CONCISE'>('PROFESSIONAL');
  const [language, setLanguage] = useState('auto');
  const [customGreeting, setCustomGreeting] = useState('');
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [notificationsSuccess, setNotificationsSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, [chatbotId]);

  async function loadData() {
    try {
      const [chatbotData, keysData] = await Promise.all([
        getChatbot(chatbotId),
        getApiKeys()
      ]);
      setChatbot(chatbotData);
      // Filter API keys for this chatbot or global keys
      setApiKeys(keysData.filter(k => k.chatbotId === chatbotId || k.chatbotId === null));
      // Initialize AI settings
      setSystemPrompt(chatbotData.systemPrompt || '');
      setCustomKnowledge(chatbotData.customKnowledge || '');
      setWelcomeMessage(chatbotData.welcomeMessage || '');
      // Initialize editable clinic data
      const cd = chatbotData.clinicData;
      setEditClinicName(cd.clinic_name || '');
      setEditPhone(cd.phone || '');
      setEditEmail(cd.email || '');
      setEditAddress(cd.address || '');
      setEditOpeningHours(cd.opening_hours || '');
      // Convert services array to editable text format
      setEditServices((cd.services || []).map((s: { name: string; price: string }) => `${s.name}: ${s.price}`).join('\n'));
      // Initialize notification & communication settings
      setNotificationEmail(chatbotData.notificationEmail || '');
      setNotificationWebhook(chatbotData.notificationWebhook || '');
      setNotifyOnBooking(chatbotData.notifyOnBooking ?? true);
      setBookingEnabled(chatbotData.bookingEnabled ?? true);
      setCommunicationStyle(chatbotData.communicationStyle || 'PROFESSIONAL');
      setLanguage(chatbotData.language || 'auto');
      setCustomGreeting(chatbotData.customGreeting || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chatbot');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteChatbot(chatbotId);
      router.push('/dashboard/chatbots');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete chatbot');
      setDeleting(false);
    }
  }

  async function handleCreateApiKey(e: React.FormEvent) {
    e.preventDefault();
    setCreatingKey(true);

    try {
      const domains = newKeyDomains
        .split(',')
        .map(d => d.trim())
        .filter(d => d.length > 0);

      const result = await createApiKey({
        name: newKeyName || 'API Key',
        chatbotId,
        allowedDomains: domains
      });

      setNewlyCreatedKey(result.key);
      setApiKeys([...apiKeys, result]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setCreatingKey(false);
    }
  }

  function generateEmbedCode(apiKey: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `<script
  src="${window.location.origin}/embed.js"
  data-chatbot-id="${chatbotId}"
  data-api-key="${apiKey}"
  data-api-url="${apiUrl}"
  defer
></script>`;
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);

    try {
      await updateChatbotSettings(chatbotId, {
        systemPrompt: systemPrompt || null,
        customKnowledge: customKnowledge || null,
        welcomeMessage: welcomeMessage || null
      });
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleSaveNotifications(e: React.FormEvent) {
    e.preventDefault();
    setSavingNotifications(true);
    setNotificationsSuccess(false);

    try {
      await updateNotificationSettings(chatbotId, {
        notificationEmail: notificationEmail || null,
        notificationWebhook: notificationWebhook || null,
        notifyOnBooking,
        bookingEnabled,
        communicationStyle,
        language,
        customGreeting: customGreeting || null
      });
      setNotificationsSuccess(true);
      setTimeout(() => setNotificationsSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notification settings');
    } finally {
      setSavingNotifications(false);
    }
  }

  async function handleSaveClinicData(e: React.FormEvent) {
    e.preventDefault();
    setSavingClinicData(true);
    setClinicDataSuccess(false);

    try {
      // Parse services from text format back to array
      const servicesArray = editServices
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const colonIndex = line.indexOf(':');
          if (colonIndex > -1) {
            return {
              name: line.substring(0, colonIndex).trim(),
              price: line.substring(colonIndex + 1).trim()
            };
          }
          return { name: line.trim(), price: '' };
        });

      await updateChatbotSettings(chatbotId, {
        clinicData: {
          clinic_name: editClinicName,
          phone: editPhone,
          email: editEmail,
          address: editAddress,
          opening_hours: editOpeningHours,
          services: servicesArray
        }
      });
      setClinicDataSuccess(true);
      setTimeout(() => setClinicDataSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save knowledge base');
    } finally {
      setSavingClinicData(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading chatbot...</p>
      </div>
    );
  }

  if (error || !chatbot) {
    return (
      <div className={styles.emptyState}>
        <p>{error || 'Chatbot not found'}</p>
        <Link href="/dashboard/chatbots" className={styles.primaryBtn}>
          Back to Chatbots
        </Link>
      </div>
    );
  }

  const clinicData = chatbot.clinicData;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <Link href="/dashboard/chatbots" style={{ color: '#64748b', fontSize: '0.875rem', textDecoration: 'none' }}>
            ← Back to Chatbots
          </Link>
          <h1 style={{ marginTop: '0.5rem' }}>{chatbot.name}</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{chatbot.sourceUrl}</p>
        </div>
        <div className={styles.actions}>
          <button onClick={() => setShowDeleteModal(true)} className={styles.dangerBtn}>
            Delete
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Status</h3>
          <p className={styles.statValue}>
            <span className={`${styles.cardBadge} ${chatbot.status === 'ACTIVE' ? styles.active : styles.paused}`}>
              {chatbot.status}
            </span>
          </p>
        </div>
        <div className={styles.statCard}>
          <h3>Conversations</h3>
          <p className={styles.statValue}>{(chatbot as Chatbot & { _count?: { conversations: number } })._count?.conversations || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Created</h3>
          <p className={styles.statValue} style={{ fontSize: '1rem' }}>
            {new Date(chatbot.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className={styles.statCard}>
          <h3>Last Scraped</h3>
          <p className={styles.statValue} style={{ fontSize: '1rem' }}>
            {new Date(chatbot.lastScrapedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Embed Code Section */}
      <div className={styles.card} style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Embed Code</h2>

        {apiKeys.length === 0 ? (
          <div>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
              Create an API key to get your embed code.
            </p>
            <button onClick={() => setShowApiKeyModal(true)} className={styles.primaryBtn}>
              Create API Key
            </button>
          </div>
        ) : (
          <div>
            <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.875rem' }}>
              Add this code to your website to embed the chatbot widget.
            </p>
            <div className={styles.snippetCode}>
              {generateEmbedCode(apiKeys[0].keyPrefix.replace('...', '••••••••'))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button
                onClick={() => copyToClipboard(generateEmbedCode('YOUR_API_KEY'))}
                className={styles.secondaryBtn}
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
              <button onClick={() => setShowApiKeyModal(true)} className={styles.secondaryBtn}>
                Create New API Key
              </button>
            </div>
          </div>
        )}
      </div>

      {/* API Keys Table */}
      {apiKeys.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>API Keys</h2>
          <div className={styles.table}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Key</th>
                  <th>Allowed Domains</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((key) => (
                  <tr key={key.id}>
                    <td>{key.name}</td>
                    <td><code className={styles.keyPrefix}>{key.keyPrefix}</code></td>
                    <td>
                      <div className={styles.domainsList}>
                        {key.allowedDomains.length === 0 ? (
                          <span style={{ color: '#94a3b8' }}>All domains</span>
                        ) : (
                          key.allowedDomains.map((d, i) => (
                            <span key={i} className={styles.domainTag}>{d}</span>
                          ))
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.cardBadge} ${key.isActive ? styles.active : styles.paused}`}>
                        {key.isActive ? 'Active' : 'Revoked'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Settings Section */}
      <div className={styles.card} style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', margin: 0 }}>AI Settings</h2>
          {settingsSuccess && (
            <span style={{ color: '#22c55e', fontSize: '0.875rem' }}>Settings saved!</span>
          )}
        </div>
        <form onSubmit={handleSaveSettings}>
          <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="welcomeMessage">Welcome Message</label>
            <input
              type="text"
              id="welcomeMessage"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="Welcome! How can I help you today?"
              style={{ width: '100%' }}
            />
            <small style={{ color: '#64748b' }}>The first message shown to users when they open the chat.</small>
          </div>

          <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="systemPrompt">Custom System Prompt (optional)</label>
            <textarea
              id="systemPrompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Override the default AI behavior. Leave empty to use the default prompt that works well for most websites."
              rows={6}
              style={{ width: '100%', fontFamily: 'inherit', resize: 'vertical' }}
            />
            <small style={{ color: '#64748b' }}>
              Advanced: Customize how the AI responds. This replaces the default system prompt.
            </small>
          </div>

          <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="customKnowledge">Additional Knowledge Base</label>
            <textarea
              id="customKnowledge"
              value={customKnowledge}
              onChange={(e) => setCustomKnowledge(e.target.value)}
              placeholder="Add information that wasn't captured by the scraper, such as:&#10;- Special promotions or discounts&#10;- FAQs and their answers&#10;- Policies (return policy, cancellation, etc.)&#10;- Any corrections to scraped data"
              rows={8}
              style={{ width: '100%', fontFamily: 'inherit', resize: 'vertical' }}
            />
            <small style={{ color: '#64748b' }}>
              Add extra information the chatbot should know. This supplements the scraped website data.
            </small>
          </div>

          <button type="submit" className={styles.primaryBtn} disabled={savingSettings}>
            {savingSettings ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>

      {/* Communication & Notification Settings */}
      <div className={styles.card} style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Communication & Notifications</h2>
            <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Configure how the chatbot communicates and how you receive booking notifications.
            </p>
          </div>
          {notificationsSuccess && (
            <span style={{ color: '#22c55e', fontSize: '0.875rem' }}>Settings saved!</span>
          )}
        </div>
        <form onSubmit={handleSaveNotifications}>
          {/* Communication Style */}
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: '#334155' }}>Communication Style</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label htmlFor="communicationStyle">Tone</label>
                <select
                  id="communicationStyle"
                  value={communicationStyle}
                  onChange={(e) => setCommunicationStyle(e.target.value as typeof communicationStyle)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                >
                  <option value="PROFESSIONAL">Professional - Formal, business-like</option>
                  <option value="FRIENDLY">Friendly - Warm, conversational</option>
                  <option value="CASUAL">Casual - Relaxed, informal</option>
                  <option value="CONCISE">Concise - Brief, to-the-point</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="language">Response Language</label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                >
                  <option value="auto">Auto-detect (match user)</option>
                  <option value="sk">Slovak</option>
                  <option value="cs">Czech</option>
                  <option value="en">English</option>
                  <option value="de">German</option>
                  <option value="hu">Hungarian</option>
                  <option value="pl">Polish</option>
                </select>
              </div>
            </div>
            <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
              <label htmlFor="customGreeting">Custom Greeting (optional)</label>
              <input
                type="text"
                id="customGreeting"
                value={customGreeting}
                onChange={(e) => setCustomGreeting(e.target.value)}
                placeholder="e.g., Ahoj! Ako ti mozem pomoct?"
                style={{ width: '100%' }}
              />
              <small style={{ color: '#64748b' }}>Custom greeting the AI will use when starting conversations.</small>
            </div>
          </div>

          {/* Booking Settings */}
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: '#334155' }}>Booking & Appointments</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={bookingEnabled}
                onChange={(e) => setBookingEnabled(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#0ea5e9' }}
              />
              <div>
                <span style={{ fontWeight: 500 }}>Enable booking requests</span>
                <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>
                  Allow customers to request appointments through the chatbot
                </p>
              </div>
            </label>
          </div>

          {/* Notification Settings */}
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: '#334155' }}>Notifications</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '1rem' }}>
              <input
                type="checkbox"
                checked={notifyOnBooking}
                onChange={(e) => setNotifyOnBooking(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#0ea5e9' }}
              />
              <div>
                <span style={{ fontWeight: 500 }}>Notify on new bookings</span>
                <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>
                  Send email/webhook when a customer submits a booking request
                </p>
              </div>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label htmlFor="notificationEmail">Notification Email</label>
                <input
                  type="email"
                  id="notificationEmail"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  placeholder="bookings@yourcompany.com"
                  style={{ width: '100%' }}
                />
                <small style={{ color: '#64748b' }}>Email to receive booking notifications</small>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="notificationWebhook">Webhook URL (optional)</label>
                <input
                  type="url"
                  id="notificationWebhook"
                  value={notificationWebhook}
                  onChange={(e) => setNotificationWebhook(e.target.value)}
                  placeholder="https://your-crm.com/webhook"
                  style={{ width: '100%' }}
                />
                <small style={{ color: '#64748b' }}>For CRM/calendar integrations</small>
              </div>
            </div>
          </div>

          <button type="submit" className={styles.primaryBtn} disabled={savingNotifications}>
            {savingNotifications ? 'Saving...' : 'Save Communication & Notification Settings'}
          </button>
        </form>
      </div>

      {/* Knowledge Base - Editable Scraped Data */}
      <div className={styles.card} style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Knowledge Base</h2>
            <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              This is the information the chatbot uses to answer questions. Edit any incorrect data.
            </p>
          </div>
          {clinicDataSuccess && (
            <span style={{ color: '#22c55e', fontSize: '0.875rem' }}>Saved!</span>
          )}
        </div>
        <form onSubmit={handleSaveClinicData}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className={styles.formGroup}>
              <label htmlFor="editClinicName">Business Name</label>
              <input
                type="text"
                id="editClinicName"
                value={editClinicName}
                onChange={(e) => setEditClinicName(e.target.value)}
                placeholder="Business name"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="editPhone">Phone</label>
              <input
                type="text"
                id="editPhone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="editEmail">Email</label>
              <input
                type="text"
                id="editEmail"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Email address"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="editAddress">Address</label>
              <input
                type="text"
                id="editAddress"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="Business address"
              />
            </div>
          </div>

          <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
            <label htmlFor="editOpeningHours">Opening Hours</label>
            <textarea
              id="editOpeningHours"
              value={editOpeningHours}
              onChange={(e) => setEditOpeningHours(e.target.value)}
              placeholder="Mon-Fri: 9:00-17:00&#10;Sat: 10:00-14:00&#10;Sun: Closed"
              rows={3}
              style={{ width: '100%', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
            <label htmlFor="editServices">Services & Prices</label>
            <textarea
              id="editServices"
              value={editServices}
              onChange={(e) => setEditServices(e.target.value)}
              placeholder="Service Name: Price&#10;Another Service: €50&#10;Third Service: Free consultation"
              rows={10}
              style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.875rem', resize: 'vertical' }}
            />
            <small style={{ color: '#64748b' }}>
              One service per line. Format: &quot;Service Name: Price&quot;
            </small>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
              {(clinicData.source_pages || []).length} pages were scraped from {chatbot.sourceUrl}
            </span>
            <button type="submit" className={styles.primaryBtn} disabled={savingClinicData}>
              {savingClinicData ? 'Saving...' : 'Save Knowledge Base'}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Delete Chatbot</h2>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to delete <strong>{chatbot.name}</strong>?</p>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                This will also deactivate all API keys associated with this chatbot.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={() => setShowDeleteModal(false)} className={styles.secondaryBtn}>
                Cancel
              </button>
              <button onClick={handleDelete} className={styles.dangerBtn} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete Chatbot'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create API Key Modal */}
      {showApiKeyModal && (
        <div className={styles.modalOverlay} onClick={() => {
          if (!newlyCreatedKey) {
            setShowApiKeyModal(false);
            setNewKeyName('');
            setNewKeyDomains('');
          }
        }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{newlyCreatedKey ? 'API Key Created' : 'Create API Key'}</h2>
            </div>

            {newlyCreatedKey ? (
              <div className={styles.modalBody}>
                <div className={styles.warning}>
                  Save this key now! It will not be shown again.
                </div>
                <div className={styles.keyDisplay}>
                  {newlyCreatedKey}
                </div>
                <button
                  onClick={() => copyToClipboard(newlyCreatedKey)}
                  className={styles.primaryBtn}
                  style={{ width: '100%' }}
                >
                  {copied ? 'Copied!' : 'Copy API Key'}
                </button>
                <button
                  onClick={() => {
                    setShowApiKeyModal(false);
                    setNewlyCreatedKey(null);
                    setNewKeyName('');
                    setNewKeyDomains('');
                  }}
                  className={styles.secondaryBtn}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateApiKey}>
                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label htmlFor="keyName">Key Name</label>
                    <input
                      type="text"
                      id="keyName"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="Production Key"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="domains">Allowed Domains (optional)</label>
                    <input
                      type="text"
                      id="domains"
                      value={newKeyDomains}
                      onChange={(e) => setNewKeyDomains(e.target.value)}
                      placeholder="example.com, www.example.com"
                    />
                    <small>Comma-separated list of domains. Leave empty to allow all domains.</small>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    onClick={() => setShowApiKeyModal(false)}
                    className={styles.secondaryBtn}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.primaryBtn} disabled={creatingKey}>
                    {creatingKey ? 'Creating...' : 'Create Key'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
