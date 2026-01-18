import { ChatState } from '@/types/clinic';

const STORAGE_KEY = 'sitebot-session';

export function saveSession(state: ChatState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadSession(): ChatState | null {
  if (typeof window === 'undefined') return null;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  return null;
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
