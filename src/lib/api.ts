import { ClinicData, Message } from '@/types/clinic';

// Normalize to avoid double slashes like https://api.example.com//api/...
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

// Helper to get auth headers
async function getAuthHeaders(): Promise<HeadersInit> {
  try {
    const response = await fetch('/api/auth/token');
    if (response.ok) {
      const { accessToken } = await response.json();
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      };
    }
  } catch (error) {
    console.error('Failed to get auth token:', error);
  }
  return { 'Content-Type': 'application/json' };
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

// Get all chatbots
export async function getChatbots(): Promise<ChatbotSummary[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/chatbots`, { headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch chatbots' }));
    throw new Error(error.error || 'Failed to fetch chatbots');
  }
  return response.json();
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

// Get API keys
export async function getApiKeys(): Promise<ApiKey[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/api-keys`, { headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch API keys' }));
    throw new Error(error.error || 'Failed to fetch API keys');
  }
  return response.json();
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
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/usage/stats`, { headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch usage stats' }));
    throw new Error(error.error || 'Failed to fetch usage stats');
  }
  return response.json();
}

// ============================================
// SCRAPE API (authenticated)
// ============================================

export async function scrapeClinic(url: string): Promise<ClinicData & { chatbotId: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/scrape`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url }),
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
      try {
        const error = await response.json();
        onError(error.error || 'Stream failed');
      } catch {
        const text = await response.text();
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
      try {
        const error = await response.json();
        onError(error.error || 'Stream failed');
      } catch {
        const text = await response.text();
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
