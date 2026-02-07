'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const POLL_INTERVAL_MS = 3000;

type Conversation = {
  id: string;
  visitorId: string;
  createdAt: string;
  lastMessageAt: string;
  status: string;
};

type Message = {
  id: string;
  sender: 'guest' | 'admin';
  body: string;
  createdAt: string;
};

function useAdminApi(secret: string | null) {
  const headers = (): HeadersInit =>
    secret ? { 'x-admin-secret': secret } : {};

  const getConversations = useCallback(
    async (cursor?: string | null): Promise<{
      items: Conversation[];
      nextCursor: string | null;
    }> => {
      if (!secret) return { items: [], nextCursor: null };
      const url = new URL('/api/chat/admin/conversations', window.location.origin);
      url.searchParams.set('limit', '10');
      if (cursor) url.searchParams.set('cursor', cursor);
      const res = await fetch(url.toString(), { headers: headers() });
      if (!res.ok) return { items: [], nextCursor: null };
      return res.json();
    },
    [secret]
  );

  const getMessages = useCallback(
    async (conversationId: string): Promise<Message[]> => {
      if (!secret) return [];
      const res = await fetch(
        `/api/chat/admin/messages?conversationId=${encodeURIComponent(conversationId)}`,
        { headers: headers() }
      );
      if (!res.ok) return [];
      return res.json();
    },
    [secret]
  );

  const sendReply = useCallback(
    async (conversationId: string, body: string): Promise<boolean> => {
      if (!secret) return false;
      const res = await fetch('/api/chat/admin/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers() },
        body: JSON.stringify({ conversationId, body }),
      });
      return res.ok;
    },
    [secret]
  );

  return { getConversations, getMessages, sendReply };
}

export function InboxClient({
  secret,
  initialConversationId,
}: {
  secret: string;
  initialConversationId?: string;
}) {
  const api = useAdminApi(secret);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialConversationId ?? null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const loadPage = useCallback(
    async (cursor?: string | null) => {
      const { items, nextCursor: next } = await api.getConversations(cursor);
      if (!cursor) {
        setConversations(items);
      } else {
        setConversations((prev) => [...prev, ...items]);
      }
      setNextCursor(next);
    },
    [api]
  );

  useEffect(() => {
    if (!secret) return;
    loadPage(null);
    const interval = setInterval(() => loadPage(null), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [secret, loadPage]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    const load = async () => {
      const list = await api.getMessages(selectedId);
      setMessages(list);
    };
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [selectedId, api]);

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    const { items, nextCursor: next } = await api.getConversations(nextCursor);
    setConversations((prev) => [...prev, ...items]);
    setNextCursor(next);
    setLoadingMore(false);
  };

  const handleSend = async () => {
    const trimmed = reply.trim();
    if (!trimmed || !selectedId || sending) return;
    setSending(true);
    const ok = await api.sendReply(selectedId, trimmed);
    setSending(false);
    if (ok) {
      setReply('');
      const list = await api.getMessages(selectedId);
      setMessages(list);
    }
  };

  return (
    <div className="flex h-full min-h-0 gap-4 p-4">
      <Card className="w-80 shrink-0 flex flex-col bg-surface-2 shadow-soft border-border">
        <CardHeader className="border-b border-border">
          <h1 className="t-h5 text-foreground">Konuşmalar</h1>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0 flex flex-col">
          {conversations.length === 0 && (
            <p className="t-body text-muted-foreground p-4">Henüz konuşma yok.</p>
          )}
          {conversations.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(c.id)}
              className={cn(
                'w-full text-left px-4 py-3 border-b border-border last:border-0 shrink-0',
                'hover:bg-surface-1 transition-colors',
                selectedId === c.id && 'bg-surface-1'
              )}
            >
              <p className="t-small text-muted-foreground truncate">{c.visitorId}</p>
              <p className="t-caption text-muted-foreground">
                {new Date(c.lastMessageAt).toLocaleString('tr-TR')}
              </p>
            </button>
          ))}
          {nextCursor && (
            <div className="p-2 border-t border-border shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Yükleniyor…' : 'Daha fazla yükle'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="flex-1 flex flex-col min-w-0 bg-surface-2 shadow-soft border-border">
        <CardHeader className="border-b border-border">
          <h2 className="t-h6 text-foreground">
            {selectedId ? 'Mesajlar' : 'Konuşma seçin'}
          </h2>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0 p-4">
          {!selectedId ? (
            <p className="t-body text-muted-foreground">Soldan bir konuşma seçin.</p>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[200px]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'rounded-lg px-3 py-2 max-w-[85%]',
                      m.sender === 'admin'
                        ? 'ml-auto bg-primary text-primary-foreground'
                        : 'mr-auto bg-surface-1 border border-border'
                    )}
                  >
                    <p className="t-body">{m.body}</p>
                  </div>
                ))}
              </div>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
              >
                <Input
                  className="flex-1 bg-surface-1"
                  placeholder="Yanıt yazın..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  disabled={sending}
                  maxLength={2000}
                />
                <Button type="submit" disabled={sending || !reply.trim()}>
                  Gönder
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
