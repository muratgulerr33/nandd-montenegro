/**
 * Fail-fast env checks for chat/API. Missing required env → clear log + throw (caller returns 500).
 * UI redirect behaviour (e.g. inbox page) is unchanged.
 */

export function ensureDatabaseUrl(): void {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error('[env] DATABASE_URL is not set');
    throw new Error('DATABASE_URL is not set');
  }
}

export function ensureAdminInboxSecret(): void {
  if (!process.env.ADMIN_INBOX_SECRET?.trim()) {
    console.error('[env] ADMIN_INBOX_SECRET is not set');
    throw new Error('ADMIN_INBOX_SECRET is not set');
  }
}
