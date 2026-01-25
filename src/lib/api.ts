import { ClinicData, ChatTheme, Message } from '@/types/clinic';

// Normalize to avoid double slashes like https://api.example.com//api/...
// Use production URL if env var is not set (happens when NEXT_PUBLIC is not baked at build time)
const getApiUrl = () => {
  // Check if we have the env var
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  // In browser, check if we're on production domain
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'xelochat.com' || host === 'www.xelochat.com' || host.includes('railway.app')) {
      return 'https://chatbotbackend-production-814f.up.railway.app';
    }
  }
  // Default to localhost for local dev
  return 'http://localhost:3001';
};

const API_URL = getApiUrl();

// ========== DEBUG LOGGING ==========
const DEBUG = true;
function debugLog(category: string, ...args: unknown[]) {
  if (DEBUG) {
    console.log(`[API:${category}]`, ...args);
  }
}

// Log API URL on load
debugLog('CONFIG', 'API_URL =', API_URL);
debugLog('CONFIG', 'NEXT_PUBLIC_API_URL env =', process.env.NEXT_PUBLIC_API_URL);

const normalizeWebsiteUrl = (input: string): string => {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, '')}`;
};

// Token cache to avoid fetching on every request
let tokenCache: { token: string; expiresAt: number } | null = null;
const TOKEN_BUFFER_MS = 60000; // Refresh 1 minute before expiry

// Clear token cache (call on logout)
export function clearTokenCache(): void {
  debugLog('TOKEN', 'Clearing token cache');
  tokenCache = null;
}

// Helper to get auth headers with caching
async function getAuthHeaders(): Promise<HeadersInit> {
  debugLog('AUTH', 'getAuthHeaders called');

  // Return cached token if still valid
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + TOKEN_BUFFER_MS) {
    debugLog('AUTH', 'Using cached token, expires in', Math.round((tokenCache.expiresAt - now) / 1000), 'seconds');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenCache.token}`
    };
  }

  debugLog('AUTH', 'Fetching new token from /api/auth/token');
  try {
    const response = await fetch('/api/auth/token');
    debugLog('AUTH', 'Token response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      debugLog('AUTH', 'Token received, length:', data.accessToken?.length || 0);

      // Cache the token (Clerk tokens typically expire in 60 seconds, but we'll use 55s to be safe)
      tokenCache = {
        token: data.accessToken,
        expiresAt: now + 55000
      };
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.accessToken}`
      };
    }

    // Check if session expired and redirect to login
    if (response.status === 401 && typeof window !== 'undefined') {
      debugLog('AUTH', '401 received, redirecting to sign-in');
      tokenCache = null;
      window.location.href = '/sign-in';
      throw new Error('Not authenticated. Redirecting to login...');
    }

    // Handle other errors (network issues, server errors)
    const errorText = await response.text().catch(() => 'unknown');
    debugLog('AUTH', 'Token fetch failed:', response.status, errorText);
    throw new Error(`Token fetch failed with status ${response.status}: ${errorText}`);
  } catch (error) {
    debugLog('AUTH', 'Token fetch error:', error);
    tokenCache = null;
    throw error;
  }
}

// Debug wrapper for fetch calls
async function debugFetch(url: string, options: RequestInit = {}): Promise<Response> {
  debugLog('FETCH', 'Request:', options.method || 'GET', url);
  debugLog('FETCH', 'Headers:', JSON.stringify(options.headers));

  const startTime = Date.now();
  try {
    const response = await fetch(url, options);
    const elapsed = Date.now() - startTime;
    debugLog('FETCH', 'Response:', response.status, response.statusText, `(${elapsed}ms)`);
    debugLog('FETCH', 'Response headers:', Object.fromEntries(response.headers.entries()));
    return response;
  } catch (error) {
    const elapsed = Date.now() - startTime;
    debugLog('FETCH', 'Request FAILED after', elapsed, 'ms:', error);
    throw error;
  }
}

// ============================================
// DASHBOARD API (authenticated)
// ============================================

export interface ChatbotSummary {
  id: string;
  name: string;
  sourceUrl: string;
  theme: Record<string, unknown>;
  status: string;
  lastScrapedAt: string;
  createdAt: string;
  _count: { conversations: number };
}

export interface Chatbot extends ChatbotSummary {
  clinicData: ClinicData;
  rawContent: string;
  systemPrompt: string | null;
  customKnowledge: string | null;
  welcomeMessage: string | null;
  // Communication style
  communicationStyle: 'PROFESSIONAL' | 'FRIENDLY' | 'CASUAL' | 'CONCISE';
  language: string;
  customGreeting: string | null;
  // Notification settings
  notificationEmail: string | null;
  notificationWebhook: string | null;
  notifyOnBooking: boolean;
  notifyOnMessage: boolean;
  // Booking settings
  bookingEnabled: boolean;
  bookingFields: string[];
  bookingPromptMessage: string | null;
  // Page display restrictions
  pageDisplayMode: 'ALL' | 'INCLUDE' | 'EXCLUDE';
  allowedPages: string[];
}

export interface ApiKey {
  id: string;
  keyPrefix: string;
  name: string;
  chatbotId: string | null;
  allowedDomains: string[];
  scopes: string[];
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  chatbot?: { name: string };
}

export interface UsageStats {
  plan: string;
  messagesUsed: number;
  messageLimit: number;
  messagesRemaining: number;
  chatbotCount: number;
  chatbotLimit: number;
  conversationCount: number;
  limitResetAt: string;
  percentageUsed: number;
}

export interface BillingStatus {
  plan: string;
  stripeCustomerId: string | null;
  subscription: {
    id: string;
    status: string;
    priceId: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export async function importDemoChatbot(
  clinicData: ClinicData,
  theme: ChatTheme,
  sourceUrl?: string
): Promise<{ chatbotId: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/chatbots/import`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ clinicData, theme, sourceUrl }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to import chatbot' }));
    throw new Error(error.error || 'Failed to import chatbot');
  }

  return response.json();
}

// Get all chatbots
export async function getChatbots(): Promise<ChatbotSummary[]> {
  debugLog('API', 'getChatbots() called');
  const headers = await getAuthHeaders();
  const response = await debugFetch(`${API_URL}/api/chatbots`, { headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch chatbots' }));
    debugLog('API', 'getChatbots failed:', error);
    throw new Error(error.error || 'Failed to fetch chatbots');
  }
  const data = await response.json();
  debugLog('API', 'getChatbots success:', data?.length, 'chatbots');
  return data;
}

// Get single chatbot
export async function getChatbot(id: string): Promise<Chatbot> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/chatbots/${id}`, { headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Chatbot not found' }));
    throw new Error(error.error || 'Chatbot not found');
  }
  return response.json();
}

// Update chatbot theme
export async function updateChatbotTheme(id: string, theme: Record<string, unknown>): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/chatbots/${id}/theme`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ theme })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update theme' }));
    throw new Error(error.error || 'Failed to update theme');
  }
}

// Update chatbot name
export async function updateChatbotName(id: string, name: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/chatbots/${id}/name`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ name })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update name' }));
    throw new Error(error.error || 'Failed to update name');
  }
}

// Update chatbot settings (system prompt, knowledge base, welcome message, clinic data)
export async function updateChatbotSettings(id: string, settings: {
  systemPrompt?: string | null;
  customKnowledge?: string | null;
  welcomeMessage?: string | null;
  clinicData?: Partial<ClinicData>;
}): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/chatbots/${id}/settings`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(settings)
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update settings' }));
    throw new Error(error.error || 'Failed to update settings');
  }
}

// Delete chatbot
export async function deleteChatbot(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/chatbots/${id}`, {
    method: 'DELETE',
    headers
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete chatbot' }));
    throw new Error(error.error || 'Failed to delete chatbot');
  }
}

// Update notification and communication settings
export async function updateNotificationSettings(id: string, settings: {
  notificationEmail?: string | null;
  notificationWebhook?: string | null;
  notifyOnBooking?: boolean;
  notifyOnMessage?: boolean;
  bookingEnabled?: boolean;
  bookingFields?: string[];
  bookingPromptMessage?: string | null;
  communicationStyle?: 'PROFESSIONAL' | 'FRIENDLY' | 'CASUAL' | 'CONCISE';
  language?: string;
  customGreeting?: string | null;
  pageDisplayMode?: 'ALL' | 'INCLUDE' | 'EXCLUDE';
  allowedPages?: string[];
}): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/chatbots/${id}/notifications`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(settings)
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update settings' }));
    throw new Error(error.error || 'Failed to update settings');
  }
}

// Get API keys
export async function getApiKeys(): Promise<ApiKey[]> {
  debugLog('API', 'getApiKeys() called');
  const headers = await getAuthHeaders();
  const response = await debugFetch(`${API_URL}/api/api-keys`, { headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch API keys' }));
    debugLog('API', 'getApiKeys failed:', error);
    throw new Error(error.error || 'Failed to fetch API keys');
  }
  const data = await response.json();
  debugLog('API', 'getApiKeys success:', data?.length, 'keys');
  return data;
}

// Create API key
export async function createApiKey(data: {
  name: string;
  chatbotId?: string;
  allowedDomains?: string[];
}): Promise<ApiKey & { key: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/api-keys`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create API key' }));
    throw new Error(error.error || 'Failed to create API key');
  }
  return response.json();
}

// Update API key
export async function updateApiKey(id: string, data: {
  name?: string;
  allowedDomains?: string[];
  isActive?: boolean;
}): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/api-keys/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update API key' }));
    throw new Error(error.error || 'Failed to update API key');
  }
}

// Revoke API key
export async function revokeApiKey(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/api-keys/${id}`, {
    method: 'DELETE',
    headers
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to revoke API key' }));
    throw new Error(error.error || 'Failed to revoke API key');
  }
}

// Get usage stats
export async function getUsageStats(): Promise<UsageStats> {
  debugLog('API', 'getUsageStats() called');
  const headers = await getAuthHeaders();
  const response = await debugFetch(`${API_URL}/api/usage/stats`, { headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch usage stats' }));
    debugLog('API', 'getUsageStats failed:', error);
    throw new Error(error.error || 'Failed to fetch usage stats');
  }
  const data = await response.json();
  debugLog('API', 'getUsageStats success:', data);
  return data;
}

// ============================================
// BILLING API (authenticated)
// ============================================

export async function getBillingStatus(): Promise<BillingStatus> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/billing/status`, { headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch billing status' }));
    throw new Error(error.error || 'Failed to fetch billing status');
  }
  return response.json();
}

export async function createCheckoutSession(data: {
  plan: 'STARTER' | 'PRO' | 'ENTERPRISE';
  currency: 'EUR';
}): Promise<{ url: string | null }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/billing/checkout`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create checkout session' }));
    throw new Error(error.error || 'Failed to create checkout session');
  }
  return response.json();
}

export async function createBillingPortalSession(): Promise<{ url: string | null }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/billing/portal`, {
    method: 'POST',
    headers
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create billing portal session' }));
    throw new Error(error.error || 'Failed to create billing portal session');
  }
  return response.json();
}

export async function deleteAccount(): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/account`, {
    method: 'DELETE',
    headers
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete account' }));
    throw new Error(error.error || 'Failed to delete account');
  }
}

// ============================================
// SCRAPE API (authenticated)
// ============================================

export async function scrapeClinic(url: string): Promise<ClinicData & { chatbotId: string }> {
  const headers = await getAuthHeaders();
  const normalizedUrl = normalizeWebsiteUrl(url);
  const response = await fetch(`${API_URL}/api/scrape`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url: normalizedUrl }),
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || 'Failed to scrape website');
    } catch {
      const text = await response.text();
      throw new Error(text || 'Failed to scrape website');
    }
  }

  return response.json();
}

// Demo scrape with streaming (public)
export async function scrapeClinicDemoStream(
  url: string,
  onProgress?: (event: ScrapeProgressEvent) => void
): Promise<ClinicData> {
  const normalizedUrl = normalizeWebsiteUrl(url);
  const response = await fetch(`${API_URL}/api/demo/scrape/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: normalizedUrl }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to scrape website' }));
    throw new Error(error.error || 'Failed to scrape website');
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let result: ClinicData | null = null;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;

      try {
        const data = JSON.parse(line.slice(6));

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.type && onProgress) {
          onProgress(data as ScrapeProgressEvent);
        }

        if (data.type === 'complete' && data.clinicData) {
          result = data.clinicData as ClinicData;
        }
      } catch (err) {
        if (err instanceof Error) {
          throw err;
        }
      }
    }
  }

  if (!result) {
    throw new Error('Scrape completed without data');
  }

  return result;
}

// Scrape progress event types
export interface ScrapeProgressEvent {
  type: 'start' | 'depth' | 'scraping' | 'page_done' | 'page_error' | 'scrape_complete' | 'extracting' | 'saving' | 'complete' | 'error';
  url?: string;
  title?: string;
  contentLength?: number;
  linksFound?: number;
  pagesScraped?: number;
  maxPages?: number;
  totalLinksFound?: number;
  depth?: number;
  pagesToScrape?: number;
  step?: string;
  message?: string;
  chatbotId?: string;
  name?: string;
  servicesFound?: number;
  phone?: string;
  email?: string;
  error?: string;
}

// Streaming scrape with progress updates
export async function scrapeClinicStream(
  url: string,
  onProgress: (event: ScrapeProgressEvent) => void
): Promise<{ chatbotId: string; name: string }> {
  const headers = await getAuthHeaders();
  const normalizedUrl = normalizeWebsiteUrl(url);
  const response = await fetch(`${API_URL}/api/scrape/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url: normalizedUrl }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to scrape website' }));
    throw new Error(error.error || 'Failed to scrape website');
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let result: { chatbotId: string; name: string } | null = null;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6)) as ScrapeProgressEvent;
          onProgress(data);

          if (data.type === 'complete' && data.chatbotId) {
            result = { chatbotId: data.chatbotId, name: data.name || '' };
          }

          if (data.type === 'error') {
            throw new Error(data.error || 'Scraping failed');
          }
        } catch (e) {
          if (e instanceof Error && e.message !== 'Scraping failed') {
            console.error('Failed to parse SSE data:', e);
          } else {
            throw e;
          }
        }
      }
    }
  }

  if (!result) {
    throw new Error('Scraping completed but no chatbot was created');
  }

  return result;
}

// ============================================
// CHAT API (authenticated - for dashboard testing)
// ============================================

export async function sendChatMessageStream(
  chatbotId: string,
  conversationHistory: Message[],
  message: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/chat/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        chatbotId,
        conversationHistory,
        message,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      try {
        const error = JSON.parse(text);
        onError(error.error || text || 'Stream failed');
      } catch {
        onError(text || 'Stream failed');
      }
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError('No response body');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onComplete();
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.error) {
              onError(data.error);
              return;
            }

            if (data.done) {
              onComplete();
              return;
            }

            if (data.content) {
              onChunk(data.content);
            }
          } catch {
            console.error('Failed to parse SSE data');
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Connection error');
  }
}

// ============================================
// LEGACY API (for backward compatibility)
// ============================================

export async function sendChatMessageStreamLegacy(
  clinicData: ClinicData,
  conversationHistory: Message[],
  message: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clinicData,
        conversationHistory,
        message,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      try {
        const error = JSON.parse(text);
        onError(error.error || text || 'Stream failed');
      } catch {
        onError(text || 'Stream failed');
      }
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError('No response body');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onComplete();
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.error) {
              onError(data.error);
              return;
            }

            if (data.done) {
              onComplete();
              return;
            }

            if (data.content) {
              onChunk(data.content);
            }
          } catch {
            console.error('Failed to parse SSE data');
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Connection error');
  }
}

// Public demo chat stream (custom bot on landing page)
export async function sendDemoChatMessageStream(
  clinicData: ClinicData,
  conversationHistory: Message[],
  message: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/demo/chatbot/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clinicData,
        conversationHistory,
        message,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      try {
        const error = JSON.parse(text);
        onError(error.error || text || 'Stream failed');
      } catch {
        onError(text || 'Stream failed');
      }
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError('No response body');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onComplete();
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.error) {
              onError(data.error);
              return;
            }

            if (data.done) {
              onComplete();
              return;
            }

            if (data.content) {
              onChunk(data.content);
            }
          } catch {
            console.error('Failed to parse SSE data');
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Connection error');
  }
}
