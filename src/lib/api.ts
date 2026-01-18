import { ClinicData, Message } from '@/types/clinic';

// Normalize to avoid double slashes like https://api.example.com//api/...
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

export async function scrapeClinic(url: string): Promise<ClinicData> {
  const response = await fetch(`${API_URL}/api/scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    // Handle HTML error responses (e.g., 404 pages)
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

export async function sendChatMessageStream(
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
