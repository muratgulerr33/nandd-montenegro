import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations, messages } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { sendPushToAdminDevices } from '@/lib/chat/push';

const BODY_MAX = 2000;
const RATE_LIMIT_WINDOW_MS = 5000;
const RATE_LIMIT_MAX = 10;

const ipCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  let entry = ipCounts.get(ip);
  if (!entry) {
    ipCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    ipCounts.set(ip, entry);
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { conversationId, visitorId, body: text } = body as {
      conversationId?: string;
      visitorId?: string;
      body?: string;
    };
    if (!conversationId || !visitorId || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'conversationId, visitorId, body required' },
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
      .where(eq(conversations.id, conversationId));
    if (!conv || conv.visitorId !== visitorId) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const [msg] = await db
      .insert(messages)
      .values({
        conversationId,
        sender: 'guest',
        body: trimmed,
      })
      .returning();

    const now = new Date();
    await db
      .update(conversations)
      .set({ lastMessageAt: now, lastGuestMessageAt: now })
      .where(eq(conversations.id, conversationId));

    const { adminDevices } = await import('@/lib/db/schema');
    const devices = await db
      .select({ fcmToken: adminDevices.fcmToken })
      .from(adminDevices)
      .where(and(eq(adminDevices.isActive, true)));
    const tokens = devices.map((d) => d.fcmToken).filter(Boolean);
    sendPushToAdminDevices(
      tokens,
      'Yeni mesaj',
      trimmed.length > 80 ? `${trimmed.slice(0, 80)}…` : trimmed,
      conversationId
    ).catch(() => {});

    return NextResponse.json({ id: msg?.id, createdAt: msg?.createdAt });
  } catch (e) {
    console.error('chat guest message', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
