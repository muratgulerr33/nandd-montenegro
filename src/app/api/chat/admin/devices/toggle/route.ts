import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminDevices } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdminSecret } from '@/lib/chat/admin-auth';
import { withCorsHeaders, corsOptionsResponse } from '@/lib/cors';
import { ensureDatabaseUrl, ensureAdminInboxSecret } from '@/lib/env';

export async function OPTIONS(request: Request) {
  return corsOptionsResponse(request);
}

export async function POST(request: Request) {
  ensureDatabaseUrl();
  ensureAdminInboxSecret();
  if (!requireAdminSecret(request)) {
    return withCorsHeaders(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      request
    );
  }
  try {
    const body = await request.json();
    const { deviceId, isActive } = body as { deviceId?: string; isActive?: boolean };
    if (!deviceId || typeof deviceId !== 'string' || typeof isActive !== 'boolean') {
      return withCorsHeaders(
        NextResponse.json(
          { error: 'deviceId (string) and isActive (boolean) required' },
          { status: 400 }
        ),
        request
      );
    }
    const [updated] = await db
      .update(adminDevices)
      .set({ isActive })
      .where(eq(adminDevices.id, deviceId))
      .returning({ id: adminDevices.id });
    if (!updated) {
      return withCorsHeaders(
        NextResponse.json({ error: 'Device not found' }, { status: 404 }),
        request
      );
    }
    return withCorsHeaders(NextResponse.json({ ok: true }), request);
  } catch (e) {
    console.error('chat admin devices toggle', e);
    return withCorsHeaders(
      NextResponse.json({ error: 'Server error' }, { status: 500 }),
      request
    );
  }
}
