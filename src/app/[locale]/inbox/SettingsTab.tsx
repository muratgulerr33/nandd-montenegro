'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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

type NotifyMode = 'first_message' | 'every_message' | 'silent';

type SettingsState = {
  dndEnabled: boolean;
  notifyMode: NotifyMode;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
};

const NOTIFY_LABELS: Record<NotifyMode, string> = {
  first_message: 'Sadece ilk mesaj',
  every_message: 'Her mesaj',
  silent: 'Sessiz',
};

function useSettingsApi(secret: string | null) {
  const headers = (): HeadersInit =>
    secret ? { 'x-admin-secret': secret } : {};

  const get = useCallback(async (): Promise<SettingsState | null> => {
    if (!secret) return null;
    const res = await fetch('/api/chat/admin/settings', { headers: headers() });
    if (!res.ok) return null;
    return res.json();
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
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [localFirstName, setLocalFirstName] = useState('');
  const [localLastName, setLocalLastName] = useState('');
  const [localAvatarUrl, setLocalAvatarUrl] = useState('');

  useEffect(() => {
    const load = async () => {
      const data = await api.get();
      if (data) {
        setSettings(data);
        setLocalFirstName(data.firstName ?? '');
        setLocalLastName(data.lastName ?? '');
        setLocalAvatarUrl(data.avatarUrl ?? '');
      }
    };
    load();
  }, [api]);

  const update = useCallback(
    async (patch: Partial<SettingsState>) => {
      if (!settings) return;
      setSaving(true);
      const next = { ...settings, ...patch };
      const saved = await api.save(patch);
      setSaving(false);
      if (saved) {
        setSettings(saved);
        setDirty(false);
      }
    },
    [api, settings]
  );

  const handleSaveProfile = async () => {
    await update({
      firstName: localFirstName.trim() || null,
      lastName: localLastName.trim() || null,
      avatarUrl: localAvatarUrl.trim() || null,
    });
  };

  if (!settings) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="t-body text-muted-foreground">Yükleniyor…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4">
      <h1 className="t-h5 text-foreground mb-4">Ayarlar</h1>
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
              checked={settings.dndEnabled}
              onCheckedChange={(checked) => update({ dndEnabled: checked })}
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
                    settings.notifyMode === mode && 'bg-surface-1 border-primary/30'
                  )}
                >
                  <input
                    type="radio"
                    name="notify_mode"
                    value={mode}
                    checked={settings.notifyMode === mode}
                    onChange={() => update({ notifyMode: mode })}
                    disabled={saving}
                    className="size-4 border-border text-primary"
                  />
                  <span className="t-small text-foreground">
                    {NOTIFY_LABELS[mode]}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

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
