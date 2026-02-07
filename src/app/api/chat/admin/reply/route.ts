import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations, messages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdminSecret } from '@/lib/chat/admin-auth';

const BODY_MAX = 2000;

export async function POST(request: Request) {
  if (!requireAdminSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { conversationId, body: text } = body as { conversationId?: string; body?: string };
    if (!conversationId || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'conversationId, body required' },
        { status: 400 }
      );
    }
    const trimmed = text.slice(0, BODY_MAX).trim();
    if (!trimmed) {
      return NextResponse.json({ error: 'body empty' }, { status: 400 });
    }

    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);
    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
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

    return NextResponse.json({ id: msg?.id, createdAt: msg?.createdAt });
  } catch (e) {
    console.error('chat admin reply', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
