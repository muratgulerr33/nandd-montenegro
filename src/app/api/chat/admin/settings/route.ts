import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdminSecret } from '@/lib/chat/admin-auth';
import { withCorsHeaders, corsOptionsResponse } from '@/lib/cors';
import { ensureDatabaseUrl, ensureAdminInboxSecret } from '@/lib/env';

const ROW_ID = 1;
const MIGRATION_INBOX_SOUND = '0004_admin_settings_inbox_sound';

function isMissingInboxSoundColumn(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return (
    /inbox_sound/i.test(msg) &&
    (/column.*does not exist|does not exist|Unknown column|missing column/i.test(msg) || /inbox_sound/.test(msg))
  );
}

export async function OPTIONS(request: Request) {
  return corsOptionsResponse(request);
}

export async function GET(request: Request) {
  ensureDatabaseUrl();
  ensureAdminInboxSecret();
  if (!requireAdminSecret(request)) {
    return withCorsHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), request);
  }
  try {
    const [row] = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.id, ROW_ID))
      .limit(1);

    if (!row) {
      return withCorsHeaders(
        NextResponse.json({
          dndEnabled: false,
          notifyMode: 'every_message',
          inboxSound: 'soft_click',
          inboxSoundEnabled: true,
          firstName: null,
          lastName: null,
          avatarUrl: null,
        }),
        request
      );
    }

    return withCorsHeaders(
      NextResponse.json({
        dndEnabled: row.dndEnabled,
        notifyMode: row.notifyMode,
        inboxSound: row.inboxSound ?? 'soft_click',
        inboxSoundEnabled: row.inboxSoundEnabled,
        firstName: row.firstName ?? null,
        lastName: row.lastName ?? null,
        avatarUrl: row.avatarUrl ?? null,
      }),
      request
    );
  } catch (e) {
    if (isMissingInboxSoundColumn(e)) {
      console.error(
        `chat admin settings GET: DB migration missing. Run migration "${MIGRATION_INBOX_SOUND}" (e.g. drizzle/0004_admin_settings_inbox_sound).`,
        e
      );
      return withCorsHeaders(
        NextResponse.json(
          { error: 'db_migration_missing', migration: MIGRATION_INBOX_SOUND },
          { status: 503 }
        ),
        request
      );
    }
    console.error('chat admin settings GET', e);
    return withCorsHeaders(
      NextResponse.json({ error: 'Server error' }, { status: 500 }),
      request
    );
  }
}

const NOTIFY_MODES = ['first_message', 'every_message', 'silent'] as const;
const INBOX_SOUNDS = ['soft_click', 'pop', 'ding', 'chime', 'none'] as const;

export async function POST(request: Request) {
  ensureDatabaseUrl();
  ensureAdminInboxSecret();
  if (!requireAdminSecret(request)) {
    return withCorsHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), request);
  }
  try {
    const body = await request.json().catch(() => ({}));
    const {
      dndEnabled,
      notifyMode,
      inboxSound,
      inboxSoundEnabled,
      firstName,
      lastName,
      avatarUrl,
    } = body as {
      dndEnabled?: boolean;
      notifyMode?: string;
      inboxSound?: string;
      inboxSoundEnabled?: boolean;
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
    const nextInboxSound =
      typeof inboxSound === 'string' && INBOX_SOUNDS.includes(inboxSound as (typeof INBOX_SOUNDS)[number])
        ? (inboxSound as (typeof INBOX_SOUNDS)[number])
        : (current?.inboxSound ?? 'soft_click');
    const nextInboxSoundEnabled =
      typeof inboxSoundEnabled === 'boolean' ? inboxSoundEnabled : (current?.inboxSoundEnabled ?? true);

    await db
      .insert(adminSettings)
      .values({
        id: ROW_ID,
        dndEnabled: nextDnd,
        notifyMode: nextNotify,
        inboxSound: nextInboxSound,
        inboxSoundEnabled: nextInboxSoundEnabled,
        firstName: nextFirstName,
        lastName: nextLastName,
        avatarUrl: nextAvatarUrl,
      })
      .onConflictDoUpdate({
        target: adminSettings.id,
        set: {
          dndEnabled: nextDnd,
          notifyMode: nextNotify,
          inboxSound: nextInboxSound,
          inboxSoundEnabled: nextInboxSoundEnabled,
          firstName: nextFirstName,
          lastName: nextLastName,
          avatarUrl: nextAvatarUrl,
          updatedAt: new Date(),
        },
      });

    return withCorsHeaders(
      NextResponse.json({
        dndEnabled: nextDnd,
        notifyMode: nextNotify,
        inboxSound: nextInboxSound,
        inboxSoundEnabled: nextInboxSoundEnabled,
        firstName: nextFirstName,
        lastName: nextLastName,
        avatarUrl: nextAvatarUrl,
      }),
      request
    );
  } catch (e) {
    if (isMissingInboxSoundColumn(e)) {
      console.error(
        `chat admin settings POST: DB migration missing. Run migration "${MIGRATION_INBOX_SOUND}" (e.g. drizzle/0004_admin_settings_inbox_sound).`,
        e
      );
      return withCorsHeaders(
        NextResponse.json(
          { error: 'db_migration_missing', migration: MIGRATION_INBOX_SOUND },
          { status: 503 }
        ),
        request
      );
    }
    console.error('chat admin settings POST', e);
    return withCorsHeaders(
      NextResponse.json({ error: 'Server error' }, { status: 500 }),
      request
    );
  }
}
