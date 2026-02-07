import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdminSecret } from '@/lib/chat/admin-auth';

export async function POST(request: Request) {
  if (!requireAdminSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const { conversationId } = body as { conversationId?: string };
    if (!conversationId || typeof conversationId !== 'string') {
      return NextResponse.json(
        { error: 'conversationId required' },
        { status: 400 }
      );
    }

    await db
      .update(conversations)
      .set({ lastAdminReadAt: new Date() })
      .where(eq(conversations.id, conversationId));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('chat admin mark-read', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
