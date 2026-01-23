'use client';

import { useState, useEffect } from 'react';
import { getApiKeys, createApiKey, revokeApiKey, getChatbots, ApiKey, ChatbotSummary } from '@/lib/api';
import styles from '../dashboard.module.css';

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [chatbots, setChatbots] = useState<ChatbotSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyChatbot, setNewKeyChatbot] = useState('');
  const [newKeyDomains, setNewKeyDomains] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [editDomains, setEditDomains] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [keysData, chatbotsData] = await Promise.all([
        getApiKeys(),
        getChatbots()
      ]);
      setApiKeys(keysData);
      setChatbots(chatbotsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault();
    setCreatingKey(true);

    try {
      const domains = newKeyDomains
        .split(',')
        .map(d => d.trim())
        .filter(d => d.length > 0);

      const result = await createApiKey({
        name: newKeyName || 'API Key',
        chatbotId: newKeyChatbot || undefined,
        allowedDomains: domains
      });

      setNewlyCreatedKey(result.key);
      setApiKeys([result, ...apiKeys]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setCreatingKey(false);
    }
  }

  async function handleRevoke(keyId: string) {
    if (!confirm('Are you sure you want to revoke this API key? This cannot be undone.')) {
      return;
    }

    try {
      await revokeApiKey(keyId);
      setApiKeys(apiKeys.map(k => k.id === keyId ? { ...k, isActive: false } : k));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke API key');
    }
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openEditDomains(key: ApiKey) {
    setEditingKey(key);
    setEditDomains(key.allowedDomains.join(', '));
    setError(null);
  }

  async function handleUpdateDomains(e: React.FormEvent) {
    e.preventDefault();
    if (!editingKey) return;
    setIsUpdating(true);
    setError(null);

    try {
      const domains = editDomains
        .split(',')
        .map(d => d.trim())
        .filter(d => d.length > 0);

      await updateApiKey(editingKey.id, { allowedDomains: domains });
      setApiKeys(apiKeys.map(k => (
        k.id === editingKey.id ? { ...k, allowedDomains: domains } : k
      )));
      setEditingKey(null);
      setEditDomains('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update API key');
    } finally {
      setIsUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading API keys...</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>API Keys</h1>
        <button onClick={() => setShowCreateModal(true)} className={styles.primaryBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create API Key
        </button>
      </div>

      {error && (
        <div className={styles.warning}>{error}</div>
      )}

      {apiKeys.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" style={{ marginBottom: '1rem' }}>
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
          </svg>
          <p>No API keys yet. Create one to embed your chatbot on websites.</p>
          <button onClick={() => setShowCreateModal(true)} className={styles.primaryBtn}>
            Create Your First API Key
          </button>
        </div>
      ) : (
        <div className={styles.table}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Key</th>
                <th>Chatbot</th>
                <th>Allowed Domains</th>
                <th>Last Used</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((key) => (
                <tr key={key.id}>
                  <td>{key.name}</td>
                  <td><code className={styles.keyPrefix}>{key.keyPrefix}</code></td>
                  <td>{key.chatbot?.name || <span style={{ color: '#94a3b8' }}>All chatbots</span>}</td>
                  <td>
                    <div className={styles.domainsList}>
                      {key.allowedDomains.length === 0 ? (
                        <span style={{ color: '#94a3b8' }}>All domains</span>
                      ) : (
                        key.allowedDomains.slice(0, 3).map((d, i) => (
                          <span key={i} className={styles.domainTag}>{d}</span>
                        ))
                      )}
                      {key.allowedDomains.length > 3 && (
                        <span className={styles.domainTag}>+{key.allowedDomains.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : <span style={{ color: '#94a3b8' }}>Never</span>}
                  </td>
                  <td>
                    <span className={`${styles.cardBadge} ${key.isActive ? styles.active : styles.paused}`}>
                      {key.isActive ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td>
                    {key.isActive && (
                      <button
                        onClick={() => handleRevoke(key.id)}
                        className={`${styles.iconBtn} ${styles.danger}`}
                        title="Revoke Key"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => openEditDomains(key)}
                      className={styles.iconBtn}
                      title="Edit allowed domains"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => {
          if (!newlyCreatedKey) {
            setShowCreateModal(false);
            setNewKeyName('');
            setNewKeyChatbot('');
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
                    setShowCreateModal(false);
                    setNewlyCreatedKey(null);
                    setNewKeyName('');
                    setNewKeyChatbot('');
                    setNewKeyDomains('');
                  }}
                  className={styles.secondaryBtn}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateKey}>
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
                    <label htmlFor="chatbot">Chatbot (optional)</label>
                    <select
                      id="chatbot"
                      value={newKeyChatbot}
                      onChange={(e) => setNewKeyChatbot(e.target.value)}
                    >
                      <option value="">All chatbots</option>
                      {chatbots.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <small>Restrict this key to a specific chatbot, or leave empty for all.</small>
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
                    onClick={() => setShowCreateModal(false)}
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

      {editingKey && (
        <div className={styles.modalOverlay} onClick={() => {
          if (!isUpdating) {
            setEditingKey(null);
            setEditDomains('');
          }
        }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Edit Allowed Domains</h2>
            </div>
            <form onSubmit={handleUpdateDomains}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label htmlFor="editDomains">Domains (comma-separated)</label>
                  <input
                    id="editDomains"
                    type="text"
                    value={editDomains}
                    onChange={(e) => setEditDomains(e.target.value)}
                    placeholder="example.com, www.example.com"
                  />
                  <small>Leave empty to allow all domains.</small>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => {
                    setEditingKey(null);
                    setEditDomains('');
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Domains'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
