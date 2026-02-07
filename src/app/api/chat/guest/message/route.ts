import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminDevices, adminSettings, conversations, messages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendPushToAdminDevices } from '@/lib/chat/push';
import { checkRateLimit } from '@/lib/rate-limit';
import { withCorsHeaders, corsOptionsResponse } from '@/lib/cors';
import { ensureDatabaseUrl } from '@/lib/env';

const BODY_MAX = 2000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_PER_MIN = 30;

export async function OPTIONS(request: Request) {
  return corsOptionsResponse(request);
}

export async function POST(request: Request) {
  ensureDatabaseUrl();
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  try {
    const body = await request.json();
    const { conversationId, visitorId, body: text } = body as {
      conversationId?: string;
      visitorId?: string;
      body?: string;
    };
    if (!conversationId || !visitorId || typeof text !== 'string') {
      return withCorsHeaders(
        NextResponse.json(
          { error: 'conversationId, visitorId, body required' },
          { status: 400 }
        ),
        request
      );
    }
    const trimmed = text.slice(0, BODY_MAX).trim();
    if (!trimmed) {
      return withCorsHeaders(NextResponse.json({ error: 'body empty' }, { status: 400 }), request);
    }

    const rateLimitKey = `${ip}:${visitorId}`;
    if (!checkRateLimit(rateLimitKey, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_PER_MIN)) {
      return withCorsHeaders(NextResponse.json({ error: 'rate_limited' }, { status: 429 }), request);
    }

    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId));
    if (!conv || conv.visitorId !== visitorId) {
      return withCorsHeaders(
        NextResponse.json({ error: 'Conversation not found' }, { status: 404 }),
        request
      );
    }

    // V1: Guest messages are always saved even when status === 'closed'. hasUnread stays true so admin sees it in closed filter.
    // Optional: auto-reopen on new guest message — uncomment the following to set status to 'open':
    // await db.update(conversations).set({ status: 'open' }).where(eq(conversations.id, conversationId));

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

    const [settings] = await db
      .select({ dndEnabled: adminSettings.dndEnabled, notifyMode: adminSettings.notifyMode })
      .from(adminSettings)
      .where(eq(adminSettings.id, 1))
      .limit(1);

    let shouldPush = false;
    if (settings?.dndEnabled || settings?.notifyMode === 'silent') {
      shouldPush = false;
    } else if (settings?.notifyMode === 'every_message') {
      shouldPush = true;
    } else if (settings?.notifyMode === 'first_message') {
      shouldPush = conv.lastGuestMessageAt == null;
    }

    if (shouldPush) {
      const devices = await db
        .select({ fcmToken: adminDevices.fcmToken })
        .from(adminDevices)
        .where(eq(adminDevices.isActive, true));
      const tokens = devices.map((d) => d.fcmToken).filter(Boolean);
      sendPushToAdminDevices(
        tokens,
        'Yeni mesaj',
        trimmed.length > 80 ? `${trimmed.slice(0, 80)}…` : trimmed,
        conversationId
      ).catch(() => {});
    }

    return withCorsHeaders(
      NextResponse.json({ id: msg?.id, createdAt: msg?.createdAt }),
      request
    );
  } catch (e) {
    console.error('chat guest message', e);
    return withCorsHeaders(
      NextResponse.json({ error: 'Server error' }, { status: 500 }),
      request
    );
  }
}

