import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdminSecret } from '@/lib/chat/admin-auth';

const ROW_ID = 1;

export async function GET(request: Request) {
  if (!requireAdminSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const [row] = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.id, ROW_ID))
      .limit(1);

    if (!row) {
      return NextResponse.json({
        dndEnabled: false,
        notifyMode: 'every_message',
        firstName: null,
        lastName: null,
        avatarUrl: null,
      });
    }

    return NextResponse.json({
      dndEnabled: row.dndEnabled,
      notifyMode: row.notifyMode,
      firstName: row.firstName ?? null,
      lastName: row.lastName ?? null,
      avatarUrl: row.avatarUrl ?? null,
    });
  } catch (e) {
    console.error('chat admin settings GET', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

const NOTIFY_MODES = ['first_message', 'every_message', 'silent'] as const;

export async function POST(request: Request) {
  if (!requireAdminSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const {
      dndEnabled,
      notifyMode,
      firstName,
      lastName,
      avatarUrl,
    } = body as {
      dndEnabled?: boolean;
      notifyMode?: string;
      firstName?: string | null;
      lastName?: string | null;
      avatarUrl?: string | null;
    };

    const [current] = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.id, ROW_ID))
      .limit(1);

    const nextDnd =
      typeof dndEnabled === 'boolean' ? dndEnabled : (current?.dndEnabled ?? false);
    const nextNotify =
      typeof notifyMode === 'string' &&
      NOTIFY_MODES.includes(notifyMode as (typeof NOTIFY_MODES)[number])
        ? (notifyMode as (typeof NOTIFY_MODES)[number])
        : (current?.notifyMode ?? 'every_message');
    const nextFirstName =
      firstName !== undefined
        ? (typeof firstName === 'string' ? firstName.slice(0, 128) : null)
        : (current?.firstName ?? null);
    const nextLastName =
      lastName !== undefined
        ? (typeof lastName === 'string' ? lastName.slice(0, 128) : null)
        : (current?.lastName ?? null);
    const nextAvatarUrl =
      avatarUrl !== undefined
        ? (typeof avatarUrl === 'string' ? avatarUrl.slice(0, 512) : null)
        : (current?.avatarUrl ?? null);

    await db
      .insert(adminSettings)
      .values({
        id: ROW_ID,
        dndEnabled: nextDnd,
        notifyMode: nextNotify,
        firstName: nextFirstName,
        lastName: nextLastName,
        avatarUrl: nextAvatarUrl,
      })
      .onConflictDoUpdate({
        target: adminSettings.id,
        set: {
          dndEnabled: nextDnd,
          notifyMode: nextNotify,
          firstName: nextFirstName,
          lastName: nextLastName,
          avatarUrl: nextAvatarUrl,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({
      dndEnabled: nextDnd,
      notifyMode: nextNotify,
      firstName: nextFirstName,
      lastName: nextLastName,
      avatarUrl: nextAvatarUrl,
    });
  } catch (e) {
    console.error('chat admin settings POST', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
