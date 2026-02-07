import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations } from '@/lib/db/schema';
import { and, desc, eq, lt, or } from 'drizzle-orm';
import { requireAdminSecret } from '@/lib/chat/admin-auth';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function parseCursor(cursor: string | null): {
  lastMessageAt: Date;
  id: string;
} | null {
  if (!cursor || !cursor.trim()) return null;
  try {
    const decoded = JSON.parse(
      Buffer.from(cursor.trim(), 'base64').toString('utf-8')
    ) as { lastMessageAt: string; id: string };
    if (
      typeof decoded.lastMessageAt !== 'string' ||
      typeof decoded.id !== 'string'
    )
      return null;
    const lastMessageAt = new Date(decoded.lastMessageAt);
    if (Number.isNaN(lastMessageAt.getTime())) return null;
    return { lastMessageAt, id: decoded.id };
  } catch {
    return null;
  }
}

function encodeCursor(lastMessageAt: Date, id: string): string {
  return Buffer.from(
    JSON.stringify({
      lastMessageAt: lastMessageAt.toISOString(),
      id,
    })
  ).toString('base64');
}

export async function GET(request: Request) {
  if (!requireAdminSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const rawLimit = parseInt(
      searchParams.get('limit') ?? String(DEFAULT_LIMIT),
      10
    );
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Number.isNaN(rawLimit) ? DEFAULT_LIMIT : rawLimit)
    );
    const cursor = parseCursor(searchParams.get('cursor'));

    const limitPlusOne = limit + 1;
    const list = cursor
      ? await db
          .select()
          .from(conversations)
          .where(
            or(
              lt(conversations.lastMessageAt, cursor.lastMessageAt),
              and(
                eq(conversations.lastMessageAt, cursor.lastMessageAt),
                lt(conversations.id, cursor.id)
              )
            )
          )
          .orderBy(desc(conversations.lastMessageAt), desc(conversations.id))
          .limit(limitPlusOne)
      : await db
          .select()
          .from(conversations)
          .orderBy(desc(conversations.lastMessageAt), desc(conversations.id))
          .limit(limitPlusOne);

    const hasMore = list.length > limit;
    const items = hasMore ? list.slice(0, limit) : list;
    const nextCursor =
      hasMore && items.length > 0
        ? encodeCursor(
            items[items.length - 1].lastMessageAt,
            items[items.length - 1].id
          )
        : null;

    return NextResponse.json({
      items: items.map((c) => ({
        id: c.id,
        visitorId: c.visitorId,
        createdAt: c.createdAt,
        lastMessageAt: c.lastMessageAt,
        status: c.status,
      })),
      nextCursor,
    });
  } catch (e) {
    console.error('chat admin conversations', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
