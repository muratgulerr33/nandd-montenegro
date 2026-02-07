import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdminSecret } from '@/lib/chat/admin-auth';
import { withCorsHeaders, corsOptionsResponse } from '@/lib/cors';
import { ensureDatabaseUrl, ensureAdminInboxSecret } from '@/lib/env';

const VALID_STATUSES = ['open', 'closed'] as const;

export async function OPTIONS(request: Request) {
  return corsOptionsResponse(request);
}

export async function POST(request: Request) {
  ensureDatabaseUrl();
  ensureAdminInboxSecret();
  if (!requireAdminSecret(request)) {
    return withCorsHeaders(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      request
    );
  }
  try {
    const body = await request.json();
    const { conversationId, status } = body as {
      conversationId?: string;
      status?: string;
    };
    const invalidId =
      !conversationId ||
      typeof conversationId !== 'string' ||
      conversationId.trim() === '';
    const invalidStatus =
      !status || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number]);
    if (invalidId || invalidStatus) {
      return withCorsHeaders(
        NextResponse.json(
          { error: 'invalid_conversationId' },
          { status: 400 }
        ),
        request
      );
    }
    const [updated] = await db
      .update(conversations)
      .set({ status: status as 'open' | 'closed' })
      .where(eq(conversations.id, conversationId))
      .returning({ id: conversations.id, status: conversations.status });
    if (!updated) {
      return withCorsHeaders(
        NextResponse.json({ error: 'not_found' }, { status: 404 }),
        request
      );
    }
    return withCorsHeaders(
      NextResponse.json({ ok: true, status: updated.status }),
      request
    );
  } catch (e) {
    console.error('chat admin conversation status', e);
    return withCorsHeaders(
      NextResponse.json({ error: 'Server error' }, { status: 500 }),
      request
    );
  }
}
