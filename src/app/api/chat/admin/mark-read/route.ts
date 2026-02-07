import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdminSecret } from '@/lib/chat/admin-auth';
import { withCorsHeaders, corsOptionsResponse } from '@/lib/cors';
import { ensureDatabaseUrl, ensureAdminInboxSecret } from '@/lib/env';

export async function OPTIONS(request: Request) {
  return corsOptionsResponse(request);
}

export async function POST(request: Request) {
  ensureDatabaseUrl();
  ensureAdminInboxSecret();
  if (!requireAdminSecret(request)) {
    return withCorsHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), request);
  }
  try {
    const body = await request.json().catch(() => ({}));
    const { conversationId } = body as { conversationId?: string };
    if (!conversationId || typeof conversationId !== 'string') {
      return withCorsHeaders(
        NextResponse.json(
          { error: 'conversationId required' },
          { status: 400 }
        ),
        request
      );
    }

    await db
      .update(conversations)
      .set({ lastAdminReadAt: new Date() })
      .where(eq(conversations.id, conversationId));

    return withCorsHeaders(NextResponse.json({ ok: true }), request);
  } catch (e) {
    console.error('chat admin mark-read', e);
    return withCorsHeaders(
      NextResponse.json({ error: 'Server error' }, { status: 500 }),
      request
    );
  }
}
