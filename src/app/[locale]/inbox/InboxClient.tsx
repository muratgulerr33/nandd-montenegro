'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  fetchConversations as fetchConversationsAdapter,
  fetchMessages as fetchMessagesAdapter,
  markRead as markReadAdapter,
} from './inbox-data-adapter';
import {
  unlockInboxAudio,
  playInboxSound,
  getInboxAudioContextState,
  type InboxSoundPreset,
} from '@/lib/chat/inbox-sound';

const MOBILE_BREAKPOINT_PX = 768;

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`);
    const set = () => setIsMobile(mq.matches);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);
  return isMobile;
}

const POLL_INTERVAL_MS = 3000;
const POLL_BACKOFF_MAX_MS = 30000;

type Conversation = {
  id: string;
  visitorId: string;
  createdAt: string;
  lastMessageAt: string;
  status: string;
  hasUnread?: boolean;
};

type Message = {
  id: string;
  sender: 'guest' | 'admin';
  body: string;
  createdAt: string;
};

function useAdminApi(secret: string | null) {
  const getConversations = useCallback(
    async (cursor?: string | null) =>
      fetchConversationsAdapter(secret, cursor),
    [secret]
  );

  const getMessages = useCallback(
    async (conversationId: string) =>
      fetchMessagesAdapter(secret, conversationId),
    [secret]
  );

  const markRead = useCallback(
    async (conversationId: string) =>
      markReadAdapter(secret, conversationId),
    [secret]
  );

  const apiHeaders = (): HeadersInit =>
    secret ? { 'x-admin-secret': secret } : {};

  const sendReply = useCallback(
    async (conversationId: string, body: string): Promise<boolean> => {
      if (!secret) return false;
      const res = await fetch('/api/chat/admin/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...apiHeaders() },
        body: JSON.stringify({ conversationId, body }),
      });
      return res.ok;
    },
    [secret]
  );

  const setConversationStatus = useCallback(
    async (
      conversationId: string,
      status: 'open' | 'closed'
    ): Promise<boolean> => {
      if (!secret) return false;
      const res = await fetch('/api/chat/admin/conversation/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...apiHeaders() },
        body: JSON.stringify({ conversationId, status }),
      });
      return res.ok;
    },
    [secret]
  );

  return {
    getConversations,
    getMessages,
    sendReply,
    markRead,
    setConversationStatus,
  };
}

type ViewMode = 'list' | 'detail';
type StatusFilter = 'all' | 'open' | 'closed';
type NotifyMode = 'first_message' | 'every_message' | 'silent';

export function InboxClient({
  secret,
  initialConversationId,
}: {
  secret: string;
  initialConversationId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const api = useAdminApi(secret);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialConversationId ?? null
  );
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const prevRef = useRef<Record<string, { hasUnread: boolean; lastMessageAt: string | null }>>({});
  const bootstrappedRef = useRef(false);

  // Sync URL conv param into state (deep-link / browser back)
  const urlConv = searchParams.get('conv');
  useEffect(() => {
    if (urlConv && urlConv !== selectedId) {
      setSelectedId(urlConv);
      if (isMobile) setViewMode('detail');
      api.markRead(urlConv).then((ok) => {
        if (ok) {
          setConversations((prev) =>
            prev.map((c) => (c.id === urlConv ? { ...c, hasUnread: false } : c))
          );
        }
      });
    }
    if (!urlConv && selectedId != null) {
      setSelectedId(null);
      if (isMobile) setViewMode('list');
    }
  }, [urlConv, isMobile, api]);

  // On mobile with initial conv, open detail view
  useEffect(() => {
    if (isMobile && initialConversationId) setViewMode('detail');
  }, [isMobile, initialConversationId]);

  const setConversationAndUrl = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      const params = new URLSearchParams(searchParams.toString());
      if (id) params.set('conv', id);
      else params.delete('conv');
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
      if (isMobile) setViewMode(id ? 'detail' : 'list');
      if (id) {
        api.markRead(id).then((ok) => {
          if (ok) {
            setConversations((prev) =>
              prev.map((c) => (c.id === id ? { ...c, hasUnread: false } : c))
            );
          }
        });
      }
    },
    [api, isMobile, pathname, router, searchParams]
  );

  const handleBack = useCallback(() => setConversationAndUrl(null), [setConversationAndUrl]);

  const loadPage = useCallback(
    async (cursor?: string | null) => {
      const { items, nextCursor: next } = await api.getConversations(cursor);
      if (!cursor) {
        const debug =
          typeof localStorage !== 'undefined' &&
          localStorage.getItem('debugInboxSound') === '1';
        let settings: {
          dndEnabled?: boolean;
          inboxSoundEnabled?: boolean;
          inboxSound?: string;
          notifyMode?: NotifyMode;
        } | null = null;
        if (secret) {
          try {
            const r = await fetch('/api/chat/admin/settings', {
              headers: { 'x-admin-secret': secret },
            });
            if (r.ok) settings = await r.json();
          } catch {
            // ignore
          }
        }
        const dndEnabled = settings?.dndEnabled ?? false;
        const inboxSoundEnabled = settings?.inboxSoundEnabled ?? true;
        const inboxSound = (settings?.inboxSound as InboxSoundPreset) ?? 'soft_click';
        const notifyMode: NotifyMode =
          (settings?.notifyMode as NotifyMode) ?? 'every_message';
        const soundAllowed =
          !dndEnabled && inboxSoundEnabled && inboxSound !== 'none';
        const selectedConversationId = selectedIdRef.current ?? null;

        if (!bootstrappedRef.current) {
          const nextMap: Record<string, { hasUnread: boolean; lastMessageAt: string | null }> = {};
          items.forEach((i) => {
            nextMap[i.id] = {
              hasUnread: !!i.hasUnread,
              lastMessageAt: i.lastMessageAt ?? null,
            };
          });
          prevRef.current = nextMap;
          bootstrappedRef.current = true;
          setConversations(() => items);
          setNextCursor(next);
          if (debug) {
            const audio = getInboxAudioContextState();
            console.info(
              JSON.stringify({
                ts: Date.now(),
                route: 'inbox_poll',
                notifyMode,
                dndEnabled,
                inboxSoundEnabled,
                inboxSound,
                audio: { hasCtx: audio.hasCtx, state: audio.state },
                selectedConversationId,
                candidates: [],
                played: false,
                reason: 'initial_unread_ignored',
              })
            );
          }
          return;
        }

        const candidates: { id: string; reason: string }[] = [];
        for (const c of items) {
          if (c.id === selectedConversationId) continue;
          const prev = prevRef.current[c.id];
          if (notifyMode === 'silent') continue;
          if (notifyMode === 'first_message') {
            if (c.hasUnread && !prev?.hasUnread)
              candidates.push({ id: c.id, reason: 'first_unread' });
          } else if (notifyMode === 'every_message') {
            if (!c.hasUnread) continue;
            if (!prev) continue;
            const prevAt = prev.lastMessageAt ?? '';
            if (c.lastMessageAt > prevAt)
              candidates.push({ id: c.id, reason: 'new_message_while_unread' });
          }
        }

        let played = false;
        let playReason = '';
        if (soundAllowed && candidates.length > 0) {
          playInboxSound(inboxSound);
          played = true;
          playReason = candidates[0]?.reason ?? 'candidate';
          const w = window as unknown as {
            __inboxSoundDebug?: { lastPlayedAt: number; lastReason: string };
          };
          w.__inboxSoundDebug = { lastPlayedAt: Date.now(), lastReason: playReason };
        }

        const nextMap: Record<string, { hasUnread: boolean; lastMessageAt: string | null }> = {};
        items.forEach((i) => {
          nextMap[i.id] = {
            hasUnread: !!i.hasUnread,
            lastMessageAt: i.lastMessageAt ?? null,
          };
        });
        prevRef.current = nextMap;
        setConversations(() => items);
        setNextCursor(next);

        if (debug) {
          const audio = getInboxAudioContextState();
          console.info(
            JSON.stringify({
              ts: Date.now(),
              route: 'inbox_poll',
              notifyMode,
              dndEnabled,
              inboxSoundEnabled,
              inboxSound,
              audio: { hasCtx: audio.hasCtx, state: audio.state },
              selectedConversationId,
              candidates: candidates.map((x) => ({ id: x.id, reason: x.reason })),
              played,
              reason: playReason || undefined,
            })
          );
        }
      } else {
        setConversations((prev) => [...prev, ...items]);
        setNextCursor(next);
      }
    },
    [api, secret]
  );

  // --- Conversations polling: single interval, visibility-aware, backoff, no overlap
  const conversationsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const conversationsInFlightRef = useRef(false);
  const conversationsBackoffUntilRef = useRef(0);
  const conversationsBackoffMsRef = useRef(POLL_INTERVAL_MS);
  const loadPageRef = useRef(loadPage);
  loadPageRef.current = loadPage;

  const refreshConversations = useCallback(async () => {
    if (conversationsInFlightRef.current) return;
    conversationsInFlightRef.current = true;
    try {
      await loadPageRef.current(null);
      conversationsBackoffMsRef.current = POLL_INTERVAL_MS;
    } catch {
      conversationsBackoffUntilRef.current = Date.now() + conversationsBackoffMsRef.current;
      conversationsBackoffMsRef.current = Math.min(
        conversationsBackoffMsRef.current * 2,
        POLL_BACKOFF_MAX_MS
      );
    } finally {
      conversationsInFlightRef.current = false;
    }
  }, []);

  const refreshConversationsRef = useRef(refreshConversations);
  refreshConversationsRef.current = refreshConversations;

  useEffect(() => {
    if (!secret) return;
    if (conversationsTimerRef.current) return; // StrictMode: avoid double interval
    loadPageRef.current(null);
    conversationsTimerRef.current = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() < conversationsBackoffUntilRef.current) return;
      void refreshConversationsRef.current();
    }, POLL_INTERVAL_MS);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void refreshConversationsRef.current();
    };
    const onFocus = () => void refreshConversationsRef.current();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);
    return () => {
      if (conversationsTimerRef.current) {
        clearInterval(conversationsTimerRef.current);
        conversationsTimerRef.current = null;
      }
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, [secret]);

  // --- Messages polling: single interval, visibility-aware, backoff, no overlap
  const messagesTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesInFlightRef = useRef(false);
  const messagesBackoffUntilRef = useRef(0);
  const messagesBackoffMsRef = useRef(POLL_INTERVAL_MS);
  const selectedIdRef = useRef(selectedId);
  const getMessagesRef = useRef(api.getMessages);
  selectedIdRef.current = selectedId;
  getMessagesRef.current = api.getMessages;

  useEffect(() => {
    if (!secret || !selectedId) {
      if (!selectedId) setMessages([]);
      if (messagesTimerRef.current) {
        clearInterval(messagesTimerRef.current);
        messagesTimerRef.current = null;
      }
      return;
    }
    if (messagesTimerRef.current) return; // StrictMode: avoid double interval
    const load = async () => {
      const list = await getMessagesRef.current(selectedId);
      setMessages(list);
    };
    load();
    messagesTimerRef.current = setInterval(() => {
      const id = selectedIdRef.current;
      if (!id || document.visibilityState !== 'visible') return;
      if (Date.now() < messagesBackoffUntilRef.current) return;
      if (messagesInFlightRef.current) return;
      messagesInFlightRef.current = true;
      getMessagesRef
        .current(id)
        .then((list) => {
          setMessages(list);
          messagesBackoffMsRef.current = POLL_INTERVAL_MS;
        })
        .catch(() => {
          messagesBackoffUntilRef.current = Date.now() + messagesBackoffMsRef.current;
          messagesBackoffMsRef.current = Math.min(
            messagesBackoffMsRef.current * 2,
            POLL_BACKOFF_MAX_MS
          );
        })
        .finally(() => {
          messagesInFlightRef.current = false;
        });
    }, POLL_INTERVAL_MS);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        const id = selectedIdRef.current;
        if (id) void getMessagesRef.current(id).then(setMessages);
      }
    };
    const onFocus = () => {
      const id = selectedIdRef.current;
      if (id) void getMessagesRef.current(id).then(setMessages);
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);
    return () => {
      if (messagesTimerRef.current) {
        clearInterval(messagesTimerRef.current);
        messagesTimerRef.current = null;
      }
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, [secret, selectedId]);

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

  const filteredConversations =
    statusFilter === 'all'
      ? conversations
      : conversations.filter((c) => c.status === statusFilter);

  const setStatusAndRefresh = useCallback(
    async (convId: string, status: 'open' | 'closed') => {
      const ok = await api.setConversationStatus(convId, status);
      if (ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, status } : c))
        );
      }
    },
    [api]
  );

  const showList = !isMobile || viewMode === 'list';
  const showDetail = !isMobile || viewMode === 'detail';
  const selectedConv = selectedId ? conversations.find((c) => c.id === selectedId) : null;

  useEffect(() => {
    const once = () => {
      void unlockInboxAudio();
      window.removeEventListener('pointerdown', once);
    };
    window.addEventListener('pointerdown', once);
    return () => window.removeEventListener('pointerdown', once);
  }, []);

  return (
    <div
      className="flex h-full min-h-0 w-full min-w-0 overflow-x-hidden gap-4 p-4"
      onPointerDown={() => void unlockInboxAudio()}
      role="presentation"
    >
      {/* List: always on desktop; on mobile only when viewMode is list */}
      {showList && (
        <Card className="w-full md:w-80 shrink-0 flex flex-col min-w-0 bg-surface-2 shadow-soft border-border max-w-full overflow-hidden">
          <CardHeader className="border-b border-border shrink-0 space-y-2">
            <h1 className="t-h5 text-foreground truncate">Konuşmalar</h1>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: 'all' as const, label: 'Hepsi' },
                  { value: 'open' as const, label: 'Açık' },
                  { value: 'closed' as const, label: 'Kapalı' },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={cn(
                    'min-h-[2.75rem] min-w-[2.75rem] rounded-md px-3 py-2 t-small transition-colors border',
                    statusFilter === value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-surface-1 text-muted-foreground border-border hover:bg-surface-1/80 hover:border-border/80'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto overflow-x-hidden p-0 flex flex-col min-h-0">
            {filteredConversations.length === 0 && (
              <p className="t-body text-muted-foreground p-4">
                {conversations.length === 0
                  ? 'Henüz konuşma yok.'
                  : 'Bu filtrede konuşma yok.'}
              </p>
            )}
            {filteredConversations.map((c) => (
              <div
                key={c.id}
                className={cn(
                  'w-full min-w-0 border-b border-border last:border-0 shrink-0 flex items-center gap-0',
                  selectedId === c.id && 'bg-muted/50'
                )}
              >
                <button
                  type="button"
                  onClick={() => setConversationAndUrl(c.id)}
                  className="flex-1 min-w-0 text-left px-4 py-3 flex items-start gap-2 hover:bg-muted/40 transition-colors min-h-[3.5rem]"
                >
                  {c.hasUnread && (
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                      aria-hidden
                    />
                  )}
                  <span className={cn('min-w-0 flex-1', c.hasUnread && 'font-medium')}>
                    <p className="t-small text-foreground truncate">
                      {c.visitorId}
                    </p>
                    <p className="t-caption text-muted-foreground">
                      {new Date(c.lastMessageAt).toLocaleString('tr-TR')}
                    </p>
                  </span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-11 w-11 min-h-[2.75rem] min-w-[2.75rem]"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Konuşma işlemleri"
                    >
                      ⋮
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {c.status === 'open' ? (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          void setStatusAndRefresh(c.id, 'closed');
                        }}
                      >
                        Kapat
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          void setStatusAndRefresh(c.id, 'open');
                        }}
                      >
                        Yeniden Aç
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
      )}
      {/* Detail: always on desktop when selectedId; on mobile only when viewMode is detail */}
      {showDetail && (
        <Card className="flex-1 flex flex-col min-w-0 w-full overflow-hidden bg-surface-2 shadow-soft border-border">
          <CardHeader className="border-b border-border shrink-0 flex flex-row items-center gap-2">
            {isMobile && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="shrink-0 -ml-1"
              >
                Geri
              </Button>
            )}
            <h2 className="t-h6 text-foreground truncate min-w-0">
              {selectedId
                ? selectedConv
                  ? selectedConv.visitorId
                  : 'Mesajlar'
                : 'Konuşma seçin'}
            </h2>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0 min-w-0 p-4 overflow-hidden">
            {!selectedId ? (
              <p className="t-body text-muted-foreground">Soldan bir konuşma seçin.</p>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 mb-4 min-h-[200px]">
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
                  className="flex gap-2 shrink-0"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                >
                  <Input
                    className="flex-1 min-w-0 bg-surface-1"
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
      )}
    </div>
  );
}
