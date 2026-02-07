import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations, messages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdminSecret } from '@/lib/chat/admin-auth';
import { withCorsHeaders, corsOptionsResponse } from '@/lib/cors';
import { ensureDatabaseUrl, ensureAdminInboxSecret } from '@/lib/env';

const BODY_MAX = 2000;

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
    const body = await request.json();
    const { conversationId, body: text } = body as { conversationId?: string; body?: string };
    if (!conversationId || typeof text !== 'string') {
      return withCorsHeaders(
        NextResponse.json(
          { error: 'conversationId, body required' },
          { status: 400 }
        ),
        request
      );
    }
    const trimmed = text.slice(0, BODY_MAX).trim();
    if (!trimmed) {
      return withCorsHeaders(NextResponse.json({ error: 'body empty' }, { status: 400 }), request);
    }

    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);
    if (!conv) {
      return withCorsHeaders(
        NextResponse.json({ error: 'Conversation not found' }, { status: 404 }),
        request
      );
    }

    const [msg] = await db
      .insert(messages)
      .values({
        conversationId,
        sender: 'admin',
        body: trimmed,
      })
      .returning();

    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversationId));

    return withCorsHeaders(
      NextResponse.json({ id: msg?.id, createdAt: msg?.createdAt }),
      request
    );
  } catch (e) {
    console.error('chat admin reply', e);
    return withCorsHeaders(
      NextResponse.json({ error: 'Server error' }, { status: 500 }),
      request
    );
  }
}
