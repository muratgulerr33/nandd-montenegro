import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations, messages } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { withCorsHeaders, corsOptionsResponse } from '@/lib/cors';

export async function OPTIONS(request: Request) {
  return corsOptionsResponse(request);
}

export async function GET(request: Request) {
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
    console.error('chat guest messages', e);
    return withCorsHeaders(
      NextResponse.json({ error: 'Server error' }, { status: 500 }),
      request
    );
  }
}
