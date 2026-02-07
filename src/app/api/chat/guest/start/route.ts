import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { db } from '@/lib/db';
import { conversations } from '@/lib/db/schema';
import { randomUUID } from 'crypto';
import { withCorsHeaders, corsOptionsResponse } from '@/lib/cors';

const VISITOR_ID_MAX = 64;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_PER_MIN = 10;

export async function OPTIONS(request: Request) {
  return corsOptionsResponse(request);
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';
  if (!checkRateLimit(ip, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_PER_MIN)) {
    return withCorsHeaders(NextResponse.json({ error: 'rate_limited' }, { status: 429 }), request);
  }
  try {
    const visitorId = randomUUID().slice(0, VISITOR_ID_MAX);
    const [conv] = await db
      .insert(conversations)
      .values({ visitorId })
      .returning({ id: conversations.id, visitorId: conversations.visitorId });
    if (!conv) {
      return withCorsHeaders(
        NextResponse.json(
          { error: 'Failed to create conversation' },
          { status: 500 }
        ),
        request
      );
    }
    return withCorsHeaders(
      NextResponse.json({
        conversationId: conv.id,
        visitorId: conv.visitorId,
      }),
      request
    );
  } catch (err) {
    console.error('[guest/start] error', err);
    return withCorsHeaders(
      NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : String(err) },
        { status: 500 }
      ),
      request
    );
  }
}
