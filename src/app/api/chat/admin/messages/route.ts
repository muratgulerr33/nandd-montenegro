import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messages } from '@/lib/db/schema';
import { eq, gt, and } from 'drizzle-orm';
import { requireAdminSecret } from '@/lib/chat/admin-auth';
import { withCorsHeaders, corsOptionsResponse } from '@/lib/cors';
import { ensureDatabaseUrl, ensureAdminInboxSecret } from '@/lib/env';

export async function OPTIONS(request: Request) {
  return corsOptionsResponse(request);
}

export async function GET(request: Request) {
  ensureDatabaseUrl();
  ensureAdminInboxSecret();
  if (!requireAdminSecret(request)) {
    return withCorsHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), request);
  }
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');
  const after = searchParams.get('after');
  if (!conversationId) {
    return withCorsHeaders(
      NextResponse.json(
        { error: 'conversationId required' },
        { status: 400 }
      ),
      request
    );
  }
  try {
    const afterDate = after ? new Date(after) : null;
    const list = await db
      .select()
      .from(messages)
      .where(
        afterDate && !Number.isNaN(afterDate.getTime())
          ? and(
              eq(messages.conversationId, conversationId),
              gt(messages.createdAt, afterDate)
            )
          : eq(messages.conversationId, conversationId)
      )
      .orderBy(messages.createdAt);
    return withCorsHeaders(
      NextResponse.json(
        list.map((m) => ({
          id: m.id,
          sender: m.sender,
          body: m.body,
          createdAt: m.createdAt,
        }))
      ),
      request
    );
  } catch (e) {
    console.error('chat admin messages', e);
    return withCorsHeaders(
      NextResponse.json({ error: 'Server error' }, { status: 500 }),
      request
    );
  }
}
