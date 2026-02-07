import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminDevices } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { requireAdminSecret } from '@/lib/chat/admin-auth';
import { withCorsHeaders, corsOptionsResponse } from '@/lib/cors';
import { ensureDatabaseUrl, ensureAdminInboxSecret } from '@/lib/env';

function shortenToken(token: string, maxLen = 12): string {
  if (!token || token.length <= maxLen) return token;
  return `${token.slice(0, maxLen)}…`;
}

export async function OPTIONS(request: Request) {
  return corsOptionsResponse(request);
}

export async function GET(request: Request) {
  ensureDatabaseUrl();
  ensureAdminInboxSecret();
  if (!requireAdminSecret(request)) {
    return withCorsHeaders(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      request
    );
  }
  try {
    const rows = await db.select().from(adminDevices).orderBy(desc(adminDevices.lastSeenAt));
    const items = rows.map((r) => ({
      id: r.id,
      label: r.label,
      tokenShort: shortenToken(r.fcmToken),
      platform: r.platform,
      lastSeenAt: r.lastSeenAt?.toISOString() ?? null,
      isActive: r.isActive,
    }));
    return withCorsHeaders(NextResponse.json({ items }), request);
  } catch (e) {
    console.error('chat admin devices list', e);
    return withCorsHeaders(
      NextResponse.json({ error: 'Server error' }, { status: 500 }),
      request
    );
  }
}
