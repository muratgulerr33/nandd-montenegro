'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Loader2 } from 'lucide-react';
import { unlockInboxAudio, playInboxSound } from '@/lib/chat/inbox-sound';
import { cn } from '@/lib/utils';

const CHAT_STORAGE_KEY = 'nandd_chat';
const POLL_INTERVAL_MS = 3000;

type ChatState = {
  conversationId: string;
  visitorId: string;
};

type Message = {
  id: string;
  sender: 'guest' | 'admin';
  body: string;
  createdAt: string;
};

function loadChatState(): ChatState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as ChatState;
    if (data?.conversationId && data?.visitorId) return data;
  } catch {
    // ignore
  }
  return null;
}

function saveChatState(state: ChatState) {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

const RATE_LIMIT_MESSAGE = 'Çok fazla istek. Lütfen kısa süre sonra tekrar deneyin.';

async function startConversation(): Promise<ChatState> {
  const res = await fetch('/api/chat/guest/start', { method: 'POST' });
  if (!res.ok) {
    if (res.status === 429) {
      const data = await res.json().catch(() => ({}));
      if ((data as { error?: string }).error === 'rate_limited') {
        throw new Error(RATE_LIMIT_MESSAGE);
      }
    }
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to start conversation: ${res.status} ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { conversationId: string; visitorId: string };
  return { conversationId: data.conversationId, visitorId: data.visitorId };
}

async function fetchMessages(conversationId: string, after?: string): Promise<Message[]> {
  const url = new URL('/api/chat/guest/messages', window.location.origin);
  url.searchParams.set('conversationId', conversationId);
  if (after) url.searchParams.set('after', after);
  const res = await fetch(url.toString());
  if (!res.ok) return [];
  return res.json();
}

type SendMessageResult =
  | { ok: true; id: string; createdAt: string }
  | { ok: false; rateLimited?: boolean; error?: string };

async function sendMessage(
  conversationId: string,
  visitorId: string,
  body: string
): Promise<SendMessageResult> {
  const res = await fetch('/api/chat/guest/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId, visitorId, body }),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (res.status === 429 && data.error === 'rate_limited') {
    return { ok: false, rateLimited: true };
  }
  if (!res.ok) return { ok: false, error: data.error ?? 'Mesaj gönderilemedi.' };
  return { ok: true, id: (data as { id: string }).id, createdAt: (data as { createdAt: string }).createdAt };
}

const GUEST_SOUND_PRESET = 'soft_click';

export function ChatDrawer({ triggerLabel }: { triggerLabel: string }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ChatState | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const lastOpenedAtRef = useRef<number>(0);
  const prevUnreadCountRef = useRef(0);

  // Restore state from localStorage so we can poll for unread when drawer is closed
  useEffect(() => {
    const saved = loadChatState();
    if (saved && !state) setState(saved);
  }, []);

  const ensureState = useCallback(async (): Promise<ChatState> => {
    let s = loadChatState();
    if (!s) {
      s = await startConversation();
      saveChatState(s);
      setState(s);
    } else {
      setState(s);
    }
    return s;
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    const list = await fetchMessages(conversationId);
    setMessages(list);
  }, []);

  // When drawer opens: mark all current messages as seen (reset badge)
  useEffect(() => {
    if (open) {
      lastOpenedAtRef.current = Date.now();
      setUnreadCount(0);
      prevUnreadCountRef.current = 0;
    }
  }, [open]);

  // When drawer is closed and we have a conversation: poll and compute unread (admin messages since last open)
  useEffect(() => {
    if (open || !state?.conversationId) return;
    let mounted = true;
    const poll = async () => {
      const list = await fetchMessages(state.conversationId);
      if (!mounted) return;
      const since = lastOpenedAtRef.current;
      const count = list.filter(
        (m) => m.sender === 'admin' && new Date(m.createdAt).getTime() > since
      ).length;
      setUnreadCount(count);
      if (count > prevUnreadCountRef.current) {
        prevUnreadCountRef.current = count;
        void playInboxSound(GUEST_SOUND_PRESET);
      }
      prevUnreadCountRef.current = count;
    };
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [open, state?.conversationId]);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setStartError(null);
    const run = async () => {
      try {
        const s = await ensureState();
        if (!mounted) return;
        await loadMessages(s.conversationId);
        const interval = setInterval(async () => {
          if (!mounted) return;
          const list = await fetchMessages(s.conversationId);
          if (mounted) setMessages(list);
        }, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
      } catch (err) {
        if (mounted) {
          const msg = err instanceof Error ? err.message : 'Konuşma başlatılamadı.';
          setStartError(msg);
        }
      }
    };
    const cleanup = run();
    return () => {
      mounted = false;
      if (typeof (cleanup as Promise<() => void>)?.then === 'function') {
        (cleanup as Promise<() => void>).then((fn) => fn?.());
      }
    };
  }, [open, ensureState, loadMessages]);

  const retryStart = useCallback(() => {
    setStartError(null);
    setState(null);
    ensureState().then((s) => {
      setState(s);
      loadMessages(s.conversationId);
    }).catch((err) => {
      setStartError(err instanceof Error ? err.message : 'Konuşma başlatılamadı.');
    });
  }, [ensureState, loadMessages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !state || sending) return;
    setSendError(null);
    setSending(true);
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      sender: 'guest',
      body: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput('');
    try {
      const result = await sendMessage(state.conversationId, state.visitorId, trimmed);
      if (result.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimistic.id ? { ...m, id: result.id, createdAt: result.createdAt } : m
          )
        );
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setInput(trimmed);
        setSendError(
          result.rateLimited ? RATE_LIMIT_MESSAGE : result.error ?? 'Mesaj gönderilemedi. Bağlantıyı kontrol edip tekrar deneyin.'
        );
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(trimmed);
      setSendError('Mesaj gönderilemedi. Tekrar deneyin.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="bottom">
      <DrawerTrigger asChild>
        <button
          type="button"
          aria-label={triggerLabel}
          onPointerDown={() => void unlockInboxAudio()}
          className={cn(
            'relative flex size-14 shrink-0 items-center justify-center rounded-full -translate-y-1',
            'bg-primary text-primary-foreground shadow-popover',
            'ring-1 ring-border/60',
            'hover:bg-primary/90 transition-transform active:scale-[0.98]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          )}
        >
          <MessageCircle className="size-6" aria-hidden />
          {!open && unreadCount > 0 && (
            <span
              className="absolute -right-1 -top-1 flex min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-[0.65rem] font-medium text-destructive-foreground"
              aria-hidden
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85dvh] flex flex-col">
        <DrawerHeader className="border-b border-border">
          <DrawerTitle className="t-h6 text-foreground">Sohbet</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-1 flex-col min-h-0 p-4">
          {startError ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <p className="t-body text-destructive" role="alert">
                Konuşma başlatılamadı. Lütfen tekrar deneyin.
              </p>
              <p className="t-caption text-muted-foreground max-w-[280px]">
                {startError}
              </p>
              <Button type="button" onClick={retryStart}>
                Yeniden dene
              </Button>
            </div>
          ) : (
            <>
              <div
                ref={listRef}
                className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[200px] max-h-[40vh]"
              >
                {messages.length === 0 && (
                  <p className="t-body text-muted-foreground">Mesaj yazın, en kısa sürede dönüş yapacağız.</p>
                )}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'rounded-lg px-3 py-2 max-w-[85%] whitespace-pre-wrap break-words',
                      m.sender === 'guest'
                        ? 'ml-auto bg-primary text-white [&_p]:!text-white [&_span]:!text-white [&_a]:!text-white [&_strong]:!text-white [&_*]:!text-white'
                        : 'mr-auto bg-muted text-foreground'
                    )}
                  >
                    <p className={cn('t-body', m.sender === 'guest' ? '!text-white' : 'text-foreground')}>
                      {m.body}
                    </p>
                  </div>
                ))}
              </div>
              <form
                className="flex flex-col gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
              >
                <div className="flex gap-2">
                  <Input
                    className="flex-1 bg-surface-1 min-w-0"
                    placeholder="Mesajınız..."
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setSendError(null);
                    }}
                    disabled={sending}
                    maxLength={2000}
                  />
                  <Button type="submit" disabled={sending || !input.trim()}>
                    {sending ? (
                      <>
                        <Loader2 className="size-4 animate-spin shrink-0" aria-hidden />
                        Gönderiliyor…
                      </>
                    ) : (
                      'Gönder'
                    )}
                  </Button>
                </div>
                {sendError && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="t-caption text-destructive flex-1 min-w-0" role="alert">
                      {sendError}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSendError(null);
                        handleSend();
                      }}
                    >
                      Tekrar dene
                    </Button>
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
