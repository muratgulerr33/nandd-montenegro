/**
 * FCM push via Firebase Admin SDK.
 * Env: FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 (base64-encoded service account JSON).
 * Invalid tokens are marked inactive in admin_devices.
 */

import * as admin from 'firebase-admin';
import { db } from '@/lib/db';
import { adminDevices } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';

let initialized = false;

function init(): admin.messaging.Messaging | null {
  if (initialized) {
    return admin.app().messaging();
  }
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;
  if (!base64 || !base64.trim()) return null;
  try {
    const json = Buffer.from(base64.trim(), 'base64').toString('utf-8');
    const serviceAccount = JSON.parse(json) as admin.ServiceAccount;
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
    initialized = true;
    return admin.app().messaging();
  } catch {
    return null;
  }
}

const INVALID_TOKEN_CODES = new Set([
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered',
]);

export type PushPayload = {
  title: string;
  body: string;
  conversationId?: string;
};

/**
 * Send push to FCM tokens. On invalid token errors, marks those tokens inactive in DB.
 */
export async function sendToTokens(
  tokens: string[],
  payload: PushPayload
): Promise<void> {
  if (tokens.length === 0) return;
  const messaging = init();
  if (!messaging) return;

  const { title, body, conversationId } = payload;
  const data: Record<string, string> = { type: 'chat_message' };
  if (conversationId) data.conversationId = conversationId;

  try {
    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
      data,
      android: { priority: 'high' as const },
    });
    const invalidTokens: string[] = [];
    response.responses.forEach((r, i) => {
      if (!r.success && r.error?.code && INVALID_TOKEN_CODES.has(r.error.code)) {
        invalidTokens.push(tokens[i]);
      }
    });
    if (invalidTokens.length > 0) {
      await db
        .update(adminDevices)
        .set({ isActive: false })
        .where(inArray(adminDevices.fcmToken, invalidTokens));
    }
  } catch (err) {
    console.error('FCM sendToTokens', err);
  }
}

export type TestPushResult = { sentCount: number; failedCount: number };

/**
 * Send a test notification to all active admin devices. Returns counts.
 * Invalid tokens are marked inactive.
 */
export async function sendTestPush(): Promise<TestPushResult> {
  const messaging = init();
  const result: TestPushResult = { sentCount: 0, failedCount: 0 };
  if (!messaging) return result;

  const rows = await db
    .select({ fcmToken: adminDevices.fcmToken })
    .from(adminDevices)
    .where(eq(adminDevices.isActive, true));
  const tokens = rows.map((r) => r.fcmToken).filter(Boolean);
  if (tokens.length === 0) return result;

  try {
    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: { title: 'Test', body: 'Test bildirimi' },
      data: { type: 'test' },
      android: { priority: 'high' as const },
    });
    response.responses.forEach((r, i) => {
      if (r.success) result.sentCount += 1;
      else result.failedCount += 1;
    });
    const invalidTokens: string[] = [];
    response.responses.forEach((r, i) => {
      if (!r.success && r.error?.code && INVALID_TOKEN_CODES.has(r.error.code)) {
        invalidTokens.push(tokens[i]);
      }
    });
    if (invalidTokens.length > 0) {
      await db
        .update(adminDevices)
        .set({ isActive: false })
        .where(inArray(adminDevices.fcmToken, invalidTokens));
    }
  } catch (err) {
    console.error('FCM sendTestPush', err);
    result.failedCount = tokens.length;
  }
  return result;
}
