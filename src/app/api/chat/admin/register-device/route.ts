import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminDevices } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdminSecret } from '@/lib/chat/admin-auth';
import { withCorsHeaders, corsOptionsResponse } from '@/lib/cors';

export async function OPTIONS(request: Request) {
  return corsOptionsResponse(request);
}

export async function POST(request: Request) {
  if (!requireAdminSecret(request)) {
    return withCorsHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), request);
  }
  try {
    const body = await request.json();
    const { fcmToken, label } = body as { fcmToken?: string; label?: string };
    if (!fcmToken || typeof fcmToken !== 'string' || !fcmToken.trim()) {
      return withCorsHeaders(
        NextResponse.json(
          { error: 'fcmToken required' },
          { status: 400 }
        ),
        request
      );
    }
    const trimmedToken = fcmToken.trim();
    const deviceLabel = typeof label === 'string' ? label.slice(0, 128) : 'android';

    const existing = await db
      .select()
      .from(adminDevices)
      .where(eq(adminDevices.fcmToken, trimmedToken))
      .limit(1)
      .then((r) => r[0]);

    if (existing) {
      await db
        .update(adminDevices)
        .set({ label: deviceLabel, lastSeenAt: new Date(), isActive: true })
        .where(eq(adminDevices.id, existing.id));
      return withCorsHeaders(NextResponse.json({ ok: true, id: existing.id }), request);
    }

    const [row] = await db
      .insert(adminDevices)
      .values({
        fcmToken: trimmedToken,
        label: deviceLabel,
        platform: 'android',
        isActive: true,
      })
      .returning({ id: adminDevices.id });
    return withCorsHeaders(NextResponse.json({ ok: true, id: row?.id }), request);
  } catch (e) {
    console.error('chat admin register-device', e);
    return withCorsHeaders(
      NextResponse.json({ error: 'Server error' }, { status: 500 }),
      request
    );
  }
}
