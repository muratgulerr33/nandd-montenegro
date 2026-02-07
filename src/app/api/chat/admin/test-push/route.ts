import { NextResponse } from 'next/server';
import { requireAdminSecret } from '@/lib/chat/admin-auth';
import { sendTestPush } from '@/server/push/fcm';
import { withCorsHeaders, corsOptionsResponse } from '@/lib/cors';

export async function OPTIONS(request: Request) {
  return corsOptionsResponse(request);
}

export async function POST(request: Request) {
  if (!requireAdminSecret(request)) {
    return withCorsHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), request);
  }
  const start = Date.now();
  try {
    const { sentCount, failedCount } = await sendTestPush();
    const ms = Date.now() - start;
    return withCorsHeaders(
      NextResponse.json({
        ok: true,
        ms,
        sentCount,
        failedCount,
      }),
      request
    );
  } catch (e) {
    console.error('chat admin test-push', e);
    const ms = Date.now() - start;
    return withCorsHeaders(
      NextResponse.json(
        { ok: false, ms, sentCount: 0, failedCount: 0 },
        { status: 500 }
      ),
      request
    );
  }
}
