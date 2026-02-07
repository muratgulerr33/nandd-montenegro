import { NextResponse } from 'next/server';
import { requireAdminSecret } from '@/lib/chat/admin-auth';
import { sendTestPush } from '@/server/push/fcm';

export async function POST(request: Request) {
  if (!requireAdminSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const start = Date.now();
  try {
    const { sentCount, failedCount } = await sendTestPush();
    const ms = Date.now() - start;
    return NextResponse.json({
      ok: true,
      ms,
      sentCount,
      failedCount,
    });
  } catch (e) {
    console.error('chat admin test-push', e);
    const ms = Date.now() - start;
    return NextResponse.json(
      { ok: false, ms, sentCount: 0, failedCount: 0 },
      { status: 500 }
    );
  }
}
