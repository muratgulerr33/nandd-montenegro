import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { requireAdminSecret } from '@/lib/chat/admin-auth';

export async function GET(request: Request) {
  if (!requireAdminSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const list = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.lastMessageAt));
    return NextResponse.json(
      list.map((c) => ({
        id: c.id,
        visitorId: c.visitorId,
        createdAt: c.createdAt,
        lastMessageAt: c.lastMessageAt,
        status: c.status,
      }))
    );
  } catch (e) {
    console.error('chat admin conversations', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
