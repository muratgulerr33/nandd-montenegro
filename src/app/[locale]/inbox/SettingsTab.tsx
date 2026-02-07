'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { unlockInboxAudio, playInboxSound, type InboxSoundPreset } from '@/lib/chat/inbox-sound';
import { cn } from '@/lib/utils';

type TestPushResult = {
  ok: boolean;
  ms: number;
  sentCount: number;
  failedCount: number;
};

function TestPushCard({ secret }: { secret: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestPushResult | null>(null);

  const run = async () => {
    setLoading(true);
    setResult(null);
    const start = Date.now();
    try {
      const res = await fetch('/api/chat/admin/test-push', {
        method: 'POST',
        headers: { 'x-admin-secret': secret },
      });
      const data = await res.json().catch(() => ({}));
      setResult({
        ok: res.ok && data.ok === true,
        ms: data.ms ?? Date.now() - start,
        sentCount: data.sentCount ?? 0,
        failedCount: data.failedCount ?? 0,
      });
    } catch {
      setResult({
        ok: false,
        ms: Date.now() - start,
        sentCount: 0,
        failedCount: 0,
      });
    }
    setLoading(false);
  };

  return (
    <Card className="bg-surface-2 border-border shadow-soft">
      <CardHeader className="pb-2">
        <h2 className="t-small font-medium text-foreground">Push Test</h2>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="t-caption text-muted-foreground">
          Aktif cihazlara test bildirimi gönderir.
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={run}
          disabled={loading}
        >
          {loading ? 'Gönderiliyor…' : 'Test Push Gönder'}
        </Button>
        {result && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge
              variant={result.ok ? 'default' : 'destructive'}
              className={result.ok ? 'bg-primary' : undefined}
            >
              {result.ok ? 'Gönderildi' : 'Hata'}
            </Badge>
            <span className="t-caption text-muted-foreground">
              {result.ms} ms · {result.sentCount} başarılı
              {result.failedCount > 0 ? `, ${result.failedCount} başarısız` : ''}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatLastSeen(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 60_000) return 'Az önce';
  if (diffMs < 3600_000) return `${Math.floor(diffMs / 60_000)} dk önce`;
  if (diffMs < 86400_000) return `${Math.floor(diffMs / 3600_000)} sa önce`;
  return d.toLocaleDateString();
}

function DevicesCard({ secret }: { secret: string }) {
  const [items, setItems] = useState<DeviceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/chat/admin/devices', {
        headers: { 'x-admin-secret': secret },
      });
      if (!res.ok) {
        setError(res.status === 401 ? 'Yetkisiz' : `Hata ${res.status}`);
        setItems([]);
        return;
      }
      const data = (await res.json()) as { items: DeviceItem[] };
      setItems(data.items ?? []);
    } catch {
      setError('Yüklenemedi');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [secret]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleToggle = async (deviceId: string, nextActive: boolean) => {
    const prev = items.find((i) => i.id === deviceId);
    if (!prev) return;
    setTogglingId(deviceId);
    setToggleError(null);
    setItems((list) =>
      list.map((i) => (i.id === deviceId ? { ...i, isActive: nextActive } : i))
    );
    try {
      const res = await fetch('/api/chat/admin/devices/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ deviceId, isActive: nextActive }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setItems((list) =>
          list.map((i) => (i.id === deviceId ? { ...i, isActive: prev.isActive } : i))
        );
        setToggleError(data.error ?? `Hata ${res.status}`);
      }
    } catch {
      setItems((list) =>
        list.map((i) => (i.id === deviceId ? { ...i, isActive: prev.isActive } : i))
      );
      setToggleError('İstek başarısız');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <Card className="bg-surface-2 border-border shadow-soft">
      <CardHeader className="pb-2">
        <h2 className="t-small font-medium text-foreground">Cihazlar</h2>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="t-caption text-muted-foreground">
          Push bildirimleri alan cihazlar. Kapalı cihazlara bildirim gönderilmez.
        </p>
        {toggleError && (
          <p className="t-caption text-destructive" role="alert">
            {toggleError}
          </p>
        )}
        {loading ? (
          <p className="t-caption text-muted-foreground">Yükleniyor…</p>
        ) : error ? (
          <p className="t-caption text-destructive">{error}</p>
        ) : items.length === 0 ? (
          <p className="t-caption text-muted-foreground">Kayıtlı cihaz yok.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-surface-1 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="t-small font-medium text-foreground truncate">
                    {d.label || d.tokenShort}
                  </p>
                  <p className="t-caption text-muted-foreground">
                    {d.tokenShort} · {formatLastSeen(d.lastSeenAt)}
                  </p>
                </div>
                <Switch
                  checked={d.isActive}
                  onCheckedChange={(checked) => handleToggle(d.id, checked)}
                  disabled={togglingId === d.id}
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

type NotifyMode = 'first_message' | 'every_message' | 'silent';

type DeviceItem = {
  id: string;
  label: string;
  tokenShort: string;
  platform: string;
  lastSeenAt: string | null;
  isActive: boolean;
};

const INBOX_SOUND_OPTIONS: { value: InboxSoundPreset; label: string }[] = [
  { value: 'soft_click', label: 'Yumuşak tıklama' },
  { value: 'pop', label: 'Pop' },
  { value: 'ding', label: 'Ding' },
  { value: 'chime', label: 'Zil' },
  { value: 'none', label: 'Ses yok' },
];

type SettingsState = {
  dndEnabled: boolean;
  notifyMode: NotifyMode;
  inboxSound: string;
  inboxSoundEnabled: boolean;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
};

const NOTIFY_LABELS: Record<NotifyMode, string> = {
  first_message: 'Sadece ilk mesaj',
  every_message: 'Her mesaj',
  silent: 'Sessiz',
};

type SettingsGetResult =
  | { ok: true; data: SettingsState }
  | { ok: false; status: number };

function useSettingsApi(secret: string | null) {
  const headers = (): HeadersInit =>
    secret ? { 'x-admin-secret': secret } : {};

  const get = useCallback(async (): Promise<SettingsGetResult> => {
    if (!secret) return { ok: false, status: 401 };
    const res = await fetch('/api/chat/admin/settings', { headers: headers() });
    if (!res.ok) return { ok: false, status: res.status };
    const data = (await res.json()) as SettingsState;
    return { ok: true, data };
  }, [secret]);

  const save = useCallback(
    async (patch: Partial<SettingsState>): Promise<SettingsState | null> => {
      if (!secret) return null;
      const res = await fetch('/api/chat/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers() },
        body: JSON.stringify(patch),
      });
      if (!res.ok) return null;
      return res.json();
    },
    [secret]
  );

  return { get, save };
}

export function SettingsTab({ secret }: { secret: string }) {
  const api = useSettingsApi(secret);
  const didInitRef = useRef(false);
  const apiGetRef = useRef(api.get);
  apiGetRef.current = api.get;

  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [loadError, setLoadError] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [localFirstName, setLocalFirstName] = useState('');
  const [localLastName, setLocalLastName] = useState('');
  const [localAvatarUrl, setLocalAvatarUrl] = useState('');
  const [localDndEnabled, setLocalDndEnabled] = useState(false);
  const [localNotifyMode, setLocalNotifyMode] = useState<NotifyMode>('first_message');
  const [localInboxSound, setLocalInboxSound] = useState<InboxSoundPreset>('soft_click');
  const [localInboxSoundEnabled, setLocalInboxSoundEnabled] = useState(true);
  const [prefsDirty, setPrefsDirty] = useState(false);
  const [soundDebug, setSoundDebug] = useState<{
    lastPlayedAt: number;
    lastReason: string;
  } | null>(null);

  const applySettingsToLocal = useCallback((data: SettingsState) => {
    setLocalFirstName(data.firstName ?? '');
    setLocalLastName(data.lastName ?? '');
    setLocalAvatarUrl(data.avatarUrl ?? '');
    setLocalDndEnabled(data.dndEnabled);
    setLocalNotifyMode(data.notifyMode);
    setLocalInboxSound((data.inboxSound as InboxSoundPreset) || 'soft_click');
    setLocalInboxSoundEnabled(data.inboxSoundEnabled ?? true);
  }, []);

  // Fetch settings once on mount or when secret changes (tab remount = fresh GET)
  useEffect(() => {
    if (!secret) return;
    if (didInitRef.current) return;
    didInitRef.current = true;
    setLoadError(null);
    const load = async () => {
      const result = await apiGetRef.current();
      if (result.ok) {
        setSettings(result.data);
        applySettingsToLocal(result.data);
      } else {
        setLoadError(result.status);
      }
    };
    load();
  }, [secret, applySettingsToLocal]);

  useEffect(() => {
    didInitRef.current = false;
  }, [secret]);

  // Debug: when debugInboxSound is on, poll window.__inboxSoundDebug for UI
  useEffect(() => {
    if (typeof localStorage === 'undefined' || localStorage.getItem('debugInboxSound') !== '1')
      return;
    const tick = () => {
      const w = window as unknown as {
        __inboxSoundDebug?: { lastPlayedAt: number; lastReason: string };
      };
      if (w.__inboxSoundDebug)
        setSoundDebug({ ...w.__inboxSoundDebug });
    };
    tick();
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, []);

  const update = useCallback(
    async (patch: Partial<SettingsState>) => {
      if (!settings) return;
      setSaving(true);
      setSavedFeedback(false);
      const saved = await api.save(patch);
      setSaving(false);
      if (saved) {
        setSettings(saved);
        applySettingsToLocal(saved);
        setDirty(false);
        setPrefsDirty(false);
        setSavedFeedback(true);
        setTimeout(() => setSavedFeedback(false), 2500);
      }
    },
    [api, settings, applySettingsToLocal]
  );

  const handleSaveProfile = async () => {
    await update({
      firstName: localFirstName.trim() || null,
      lastName: localLastName.trim() || null,
      avatarUrl: localAvatarUrl.trim() || null,
    });
  };

  const handleSavePrefs = async () => {
    await update({
      dndEnabled: localDndEnabled,
      notifyMode: localNotifyMode,
      inboxSound: localInboxSound,
      inboxSoundEnabled: localInboxSoundEnabled,
    });
  };

  if (loadError != null) {
    const message =
      loadError === 401
        ? 'Yetkisiz. Lütfen inbox’a ?key= ile giriş yapın.'
        : loadError >= 500
          ? 'Sunucu hatası. Tekrar deneyin.'
          : `Yüklenemedi (${loadError}).`;
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="t-body text-destructive" role="alert">
          {message}
        </p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="t-body text-muted-foreground">Yükleniyor…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <h1 className="t-h5 text-foreground">Ayarlar</h1>
        {savedFeedback && (
          <Badge variant="secondary" className="bg-primary/15 text-primary">
            Kaydedildi
          </Badge>
        )}
      </div>
      <div className="space-y-4">
        <Card className="bg-surface-2 border-border shadow-soft">
          <CardHeader className="pb-2">
            <h2 className="t-small font-medium text-foreground">Durum</h2>
          </CardHeader>
          <CardContent>
            <p className="t-caption text-muted-foreground">Yakında</p>
          </CardContent>
        </Card>

        <Card className="bg-surface-2 border-border shadow-soft">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <h2 className="t-small font-medium text-foreground">
              Sohbeti Aç/Kapat (DND)
            </h2>
            <Switch
              checked={localDndEnabled}
              onCheckedChange={(checked) => {
                setLocalDndEnabled(checked);
                setPrefsDirty(true);
              }}
              disabled={saving}
            />
          </CardHeader>
          <CardContent>
            <p className="t-caption text-muted-foreground">
              Açıkken yeni sohbet bildirimleri kısıtlanır.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface-2 border-border shadow-soft">
          <CardHeader className="pb-2">
            <h2 className="t-small font-medium text-foreground">
              Hesap ayarları
            </h2>
          </CardHeader>
          <CardContent>
            <p className="t-caption text-muted-foreground">Yakında</p>
          </CardContent>
        </Card>

        <Card className="bg-surface-2 border-border shadow-soft">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <h2 className="t-small font-medium text-foreground">
              Bildirim Sesi
            </h2>
            <Switch
              checked={localInboxSoundEnabled}
              onCheckedChange={(checked) => {
                setLocalInboxSoundEnabled(checked);
                setPrefsDirty(true);
              }}
              disabled={saving}
            />
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="t-caption text-muted-foreground">
              Yeni guest mesajında (DND kapalıyken) çalacak ses.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="inbox_sound" className="t-caption text-muted-foreground shrink-0">
                Ses
              </Label>
              <Select
                value={localInboxSound}
                onValueChange={(v) => {
                  setLocalInboxSound(v as InboxSoundPreset);
                  setPrefsDirty(true);
                  if (v !== 'none') void unlockInboxAudio().then(() => playInboxSound(v as InboxSoundPreset));
                }}
                disabled={saving || !localInboxSoundEnabled}
              >
                <SelectTrigger id="inbox_sound" className="bg-surface-1 w-full max-w-[200px]">
                  <SelectValue placeholder="Ses seçin" />
                </SelectTrigger>
                <SelectContent>
                  {INBOX_SOUND_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={saving || !localInboxSoundEnabled || localInboxSound === 'none'}
                onClick={async () => {
                  await unlockInboxAudio();
                  await playInboxSound(localInboxSound);
                }}
              >
                Sesi Test Et
              </Button>
            </div>
            {typeof localStorage !== 'undefined' && localStorage.getItem('debugInboxSound') === '1' && (
              <p className="t-caption text-muted-foreground mt-2 pt-2 border-t border-border">
                Debug: Last sound played at{' '}
                {soundDebug?.lastPlayedAt
                  ? new Date(soundDebug.lastPlayedAt).toLocaleTimeString()
                  : '—'}{' '}
                / reason: {soundDebug?.lastReason ?? '—'}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-surface-2 border-border shadow-soft">
          <CardHeader className="pb-2">
            <h2 className="t-small font-medium text-foreground">
              Bildirim ayarları
            </h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="t-caption text-muted-foreground mb-2">
              Bildirim modu
            </p>
            <div className="flex flex-col gap-2">
              {(Object.keys(NOTIFY_LABELS) as NotifyMode[]).map((mode) => (
                <label
                  key={mode}
                  className={cn(
                    'flex items-center gap-2 rounded-md border border-border px-3 py-2 cursor-pointer transition-colors',
                    localNotifyMode === mode && 'bg-surface-1 border-primary/30'
                  )}
                >
                  <input
                    type="radio"
                    name="notify_mode"
                    value={mode}
                    checked={localNotifyMode === mode}
                    onChange={() => {
                      setLocalNotifyMode(mode);
                      setPrefsDirty(true);
                    }}
                    disabled={saving}
                    className="size-4 border-border text-primary"
                  />
                  <span className="t-small text-foreground">
                    {NOTIFY_LABELS[mode]}
                  </span>
                </label>
              ))}
            </div>
            {prefsDirty && (
              <Button
                size="sm"
                onClick={handleSavePrefs}
                disabled={saving}
                className="mt-2"
              >
                {saving ? 'Kaydediliyor…' : 'Kaydet'}
              </Button>
            )}
          </CardContent>
        </Card>

        <DevicesCard secret={secret} />

        <TestPushCard secret={secret} />

        <Card className="bg-surface-2 border-border shadow-soft">
          <CardHeader className="pb-2">
            <h2 className="t-small font-medium text-foreground">Profil</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="t-caption text-muted-foreground mb-2">
              Ad / soyad (V2: avatar yükleme)
            </p>
            <div className="space-y-2">
              <Label htmlFor="first_name" className="t-small">
                Ad
              </Label>
              <Input
                id="first_name"
                value={localFirstName}
                onChange={(e) => {
                  setLocalFirstName(e.target.value);
                  setDirty(true);
                }}
                placeholder="Ad"
                className="bg-surface-1"
              />
              <Label htmlFor="last_name" className="t-small">
                Soyad
              </Label>
              <Input
                id="last_name"
                value={localLastName}
                onChange={(e) => {
                  setLocalLastName(e.target.value);
                  setDirty(true);
                }}
                placeholder="Soyad"
                className="bg-surface-1"
              />
              <Label htmlFor="avatar_url" className="t-small">
                Avatar URL (metin, V2)
              </Label>
              <Input
                id="avatar_url"
                value={localAvatarUrl}
                onChange={(e) => {
                  setLocalAvatarUrl(e.target.value);
                  setDirty(true);
                }}
                placeholder="https://..."
                className="bg-surface-1"
              />
            </div>
            {dirty && (
              <Button
                size="sm"
                onClick={handleSaveProfile}
                disabled={saving}
                className="mt-2"
              >
                {saving ? 'Kaydediliyor…' : 'Kaydet'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
