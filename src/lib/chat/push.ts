/**
 * FCM push: guest mesajı gelince admin cihazlara bildirim.
 * Firebase Admin SDK kullanır (FIREBASE_SERVICE_ACCOUNT_JSON_BASE64).
 * Eski FCM_SERVER_KEY artık kullanılmıyor.
 */

import { sendToTokens } from '@/server/push/fcm';

export async function sendPushToAdminDevices(
  tokens: string[],
  title: string,
  body: string,
  conversationId?: string
): Promise<void> {
  await sendToTokens(tokens, {
    title,
    body,
    conversationId,
  });
}
