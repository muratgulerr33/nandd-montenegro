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
import { MessageCircle } from 'lucide-react';
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

async function startConversation(): Promise<ChatState> {
  const res = await fetch('/api/chat/guest/start', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to start conversation');
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

async function sendMessage(
  conversationId: string,
  visitorId: string,
  body: string
): Promise<{ id: string; createdAt: string } | null> {
  const res = await fetch('/api/chat/guest/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId, visitorId, body }),
  });
  if (!res.ok) return null;
  return res.json();
}

export function ChatDrawer({ triggerLabel }: { triggerLabel: string }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ChatState | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    const run = async () => {
      const s = await ensureState();
      if (!mounted) return;
      await loadMessages(s.conversationId);
      const interval = setInterval(async () => {
        if (!mounted) return;
        const list = await fetchMessages(s.conversationId);
        if (mounted) setMessages(list);
      }, POLL_INTERVAL_MS);
      return () => clearInterval(interval);
    };
    const cleanup = run();
    return () => {
      mounted = false;
      if (typeof (cleanup as Promise<() => void>)?.then === 'function') {
        (cleanup as Promise<() => void>).then((fn) => fn?.());
      }
    };
  }, [open, ensureState, loadMessages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !state || sending) return;
    setSending(true);
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      sender: 'guest',
      body: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput('');
    const result = await sendMessage(state.conversationId, state.visitorId, trimmed);
    setSending(false);
    if (result) {
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? { ...m, id: result.id, createdAt: result.createdAt } : m))
      );
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(trimmed);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="bottom">
      <DrawerTrigger asChild>
        <button
          type="button"
          aria-label={triggerLabel}
          className={cn(
            'flex size-14 shrink-0 items-center justify-center rounded-full -translate-y-1',
            'bg-primary text-primary-foreground shadow-popover',
            'ring-1 ring-border/60',
            'hover:bg-primary/90 transition-transform active:scale-[0.98]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          )}
        >
          <MessageCircle className="size-6" aria-hidden />
        </button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85dvh] flex flex-col">
        <DrawerHeader className="border-b border-border">
          <DrawerTitle className="t-h6 text-foreground">Sohbet</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-1 flex-col min-h-0 p-4">
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
                  'rounded-lg px-3 py-2 max-w-[85%]',
                  m.sender === 'guest'
                    ? 'ml-auto bg-primary text-primary-foreground'
                    : 'mr-auto bg-surface-1 text-foreground border border-border'
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
              placeholder="Mesajınız..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
              maxLength={2000}
            />
            <Button type="submit" disabled={sending || !input.trim()}>
              Gönder
            </Button>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
