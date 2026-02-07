/**
 * Minimal data adapter for inbox: fetch conversations, messages, mark read.
 * Kept in one place so future realtime (e.g. SSE) can replace the implementation
 * without changing InboxClient.
 */

export type ConversationItem = {
  id: string;
  visitorId: string;
  createdAt: string;
  lastMessageAt: string;
  status: string;
  hasUnread?: boolean;
};

export type MessageItem = {
  id: string;
  sender: 'guest' | 'admin';
  body: string;
  createdAt: string;
};

function headers(secret: string | null): HeadersInit {
  return secret ? { 'x-admin-secret': secret } : {};
}

export async function fetchConversations(
  secret: string | null,
  cursor?: string | null,
  limit = 10
): Promise<{
  items: ConversationItem[];
  nextCursor: string | null;
}> {
  if (!secret) return { items: [], nextCursor: null };
  const url = new URL('/api/chat/admin/conversations', window.location.origin);
  url.searchParams.set('limit', String(limit));
  if (cursor) url.searchParams.set('cursor', cursor);
  const res = await fetch(url.toString(), { headers: headers(secret) });
  if (!res.ok) return { items: [], nextCursor: null };
  return res.json();
}

export async function fetchMessages(
  secret: string | null,
  conversationId: string
): Promise<MessageItem[]> {
  if (!secret) return [];
  const res = await fetch(
    `/api/chat/admin/messages?conversationId=${encodeURIComponent(conversationId)}`,
    { headers: headers(secret) }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function markRead(
  secret: string | null,
  conversationId: string
): Promise<boolean> {
  if (!secret) return false;
  const res = await fetch('/api/chat/admin/mark-read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers(secret) },
    body: JSON.stringify({ conversationId }),
  });
  return res.ok;
}
