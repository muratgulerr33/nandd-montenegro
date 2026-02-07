/**
 * In-memory rate limiter (MVP). Key → { count, resetAt }.
 * Not distributed: resets on process restart.
 */

const store = new Map<string, { count: number; resetAt: number }>();

/**
 * Returns true if the key is under the limit (request allowed), false if over (rate limited).
 */
export function checkRateLimit(
  key: string,
  windowMs: number,
  maxPerWindow: number
): boolean {
  const now = Date.now();
  let entry = store.get(key);
  if (!entry) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return true;
  }
  if (entry.count >= maxPerWindow) return false;
  entry.count += 1;
  return true;
}
