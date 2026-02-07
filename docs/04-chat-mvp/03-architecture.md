# Chat MVP — Mimari (MVP, en az parça)

## Realtime / polling

- DB var; tam realtime zorunlu değil. MVP’de:
  - Web açıkken: **short polling** (2–3 saniye) ile yeni mesaj çekilir.
  - Push: FCM ile admin’e bildirim (uygulama kapalıyken de).

## Bileşenler

- **Site widget (guest):** Sitede chat bubble + drawer; mesaj gönderir, polling ile mesajları çeker.
- **Admin Inbox (web):** Konuşma listesi + konuşma detay + yanıt; secret ile korunur.
- **Push worker:** Guest mesajı gelince admin_devices’taki FCM token’larına push gönderir (backend içinde).
- **Postgres:** Konuşmalar, mesajlar, admin cihaz token’ları.

## API sözleşmesi (endpoint’ler)

- `POST /api/chat/guest/start` → conversation id (ve gerekirse visitor_id) döner.
- `POST /api/chat/guest/message` — body: `{ conversationId, visitorId, body }`.
- `GET /api/chat/guest/messages?conversationId=&after=` — guest mesaj listesi.
- `GET /api/chat/admin/conversations` — admin konuşma listesi (x-admin-secret gerekli).
- `GET /api/chat/admin/messages?conversationId=&after=` — admin mesaj listesi.
- `POST /api/chat/admin/reply` — body: `{ conversationId, body }`.
- `POST /api/chat/admin/register-device` — body: `{ fcmToken, label }` (admin cihaz kaydı).

Push tetik: Guest mesajı kaydedildiğinde backend, admin_devices’taki token’lara FCM ile push gönderir.

## Veri modeli (tablolar)

- **conversations:** id, visitor_id, created_at, last_message_at, status (open/closed).
- **messages:** id, conversation_id, sender (guest | admin), body, created_at.
- **admin_devices:** id, label, fcm_token, platform, last_seen_at.

Opsiyonel: site_keys (çoklu site); MVP’de tek site yeter.

## Push akışı

1. Admin (telefon veya web) uygulama açınca FCM token alır.
2. Token `POST /api/chat/admin/register-device` ile backend’e yollanır.
3. Guest mesaj atınca backend mesajı DB’ye yazar, ardından admin_devices’taki tüm token’lara FCM ile push gönderir.
4. Bildirime tıklayınca uygulama açılır (deep link MVP’de zorunlu değil).
