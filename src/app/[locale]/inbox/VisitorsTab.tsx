'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { fetchConversations } from './inbox-data-adapter';

type VisitorItem = {
  id: string;
  visitorId: string;
  lastMessageAt: string;
  status: string;
  hasUnread?: boolean;
};

function useVisitorsApi(secret: string | null) {
  const getVisitors = useCallback(
    async (cursor?: string | null) =>
      fetchConversations(secret, cursor, 30),
    [secret]
  );

  return { getVisitors };
}

export function VisitorsTab({ secret }: { secret: string }) {
  const api = useVisitorsApi(secret);
  const [items, setItems] = useState<VisitorItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef(false);

  const load = useCallback(
    async (cursor?: string | null) => {
      const { items: nextItems, nextCursor: next } = await api.getVisitors(cursor);
      if (!cursor) {
        setItems(nextItems);
      } else {
        setItems((prev) => [...prev, ...nextItems]);
      }
      setNextCursor(next);
    },
    [api]
  );

  useEffect(() => {
    if (!secret || loadedRef.current) return;
    loadedRef.current = true;
    setLoading(true);
    load(null).finally(() => setLoading(false));
  }, [secret, load]);

  const filtered = search.trim()
    ? items.filter((v) =>
        v.visitorId.toLowerCase().includes(search.trim().toLowerCase())
      )
    : items;

  return (
    <div className="flex h-full flex-col overflow-hidden p-4">
      <Card className="flex flex-1 flex-col min-h-0 overflow-hidden bg-surface-2 border-border shadow-soft">
        <CardHeader className="shrink-0 space-y-2 border-b border-border">
          <h1 className="t-h5 text-foreground">Ziyaretçiler</h1>
          <Input
            type="search"
            placeholder="Ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-surface-1"
          />
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0 min-h-0">
          {loading ? (
            <p className="t-body text-muted-foreground p-4">Yükleniyor…</p>
          ) : filtered.length === 0 ? (
            <p className="t-body text-muted-foreground p-4">
              {items.length === 0 ? 'Henüz ziyaretçi yok.' : 'Eşleşen ziyaretçi yok.'}
            </p>
          ) : (
            <ul className="border-t border-border">
              {filtered.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center gap-2 border-b border-border last:border-0 px-4 py-3 min-h-[3.5rem] hover:bg-muted/40 transition-colors"
                >
                  {v.hasUnread && (
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                      aria-hidden
                    />
                  )}
                  <div className={cn('min-w-0 flex-1', v.hasUnread && 'font-medium')}>
                    <p className="t-small text-foreground truncate">
                      {v.visitorId.length > 24
                        ? `${v.visitorId.slice(0, 24)}…`
                        : v.visitorId}
                    </p>
                    <p className="t-caption text-muted-foreground">
                      {new Date(v.lastMessageAt).toLocaleString('tr-TR')} ·{' '}
                      {v.status === 'open' ? 'Açık' : 'Kapalı'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
