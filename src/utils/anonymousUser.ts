const STORAGE_KEY = 'cidade_alta_anonymous_id';

/**
 * Returns or generates a persistent anonymous user ID stored in localStorage.
 * Used for anti-spam voting and comments identification without requiring sign in.
 */
export function getAnonymousUserId(): string {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    const randomHex = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const screenSig = `${window.screen.width}x${window.screen.height}_${navigator.language}`;
    id = `anon_${randomHex}_${btoa(screenSig).replace(/=/g, '').substring(0, 8)}`;
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

/**
 * Simple HTML sanitizer to prevent XSS in comments and suggestions
 */
export function sanitizeInput(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}
