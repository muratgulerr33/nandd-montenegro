# PLAN PROMPT — Chat MVP Sprint-2 (FCM Push'u Gerçekten Çalıştır + Prod Hazırlık)

## Hedefler / Kapsam

- **FCM push gerçek çalışsın:** Guest mesaj atınca admin cihaza (özellikle Android Capacitor uygulaması) push bildirimi gitsin; uygulama kapalıyken de.
- **Push tıklanınca:** Inbox açılsın ve ilgili konuşma otomatik seçilsin (`?conv=<id>`).
- **Prod hazırlık:** Env, secret yönetimi, rate limit dokümantasyonu, build ve smoke test kriterleri net olsun.
- **Bu sprintte yok:** Tam CORS kısıtlaması, login sistemi, captcha.

## FCM Push — Mevcut durum / Eksikler

### Push nerede, nasıl?

- **Dosya:** [`src/lib/chat/push.ts`](src/lib/chat/push.ts)
- **Davranış:** Legacy FCM HTTP API (`https://fcm.googleapis.com/fcm/send`) kullanılıyor; env: `FCM_SERVER_KEY` (key= Authorization). Mock değil, gerçek HTTP çağrısı var ama **Firebase deprecated** bu endpoint’i; production için **Firebase Admin SDK** kullanılmalı.
- **Tetiklendiği yer:** [`src/app/api/chat/guest/message/route.ts`](src/app/api/chat/guest/message/route.ts) — guest mesaj insert’ten sonra `sendPushToAdminDevices(tokens, 'Yeni mesaj', body)` çağrılıyor; `conversationId` payload’da yok, invalid token yönetimi yok.

### API route’lar

| Amaç | Dosya |
|------|--------|
| Guest başlat | `src/app/api/chat/guest/start/route.ts` |
| Guest mesaj | `src/app/api/chat/guest/message/route.ts` |
| Guest mesaj listesi | `src/app/api/chat/guest/messages/route.ts` |
| Admin konuşmalar | `src/app/api/chat/admin/conversations/route.ts` |
| Admin mesajlar | `src/app/api/chat/admin/messages/route.ts` |
| Admin yanıt | `src/app/api/chat/admin/reply/route.ts` |
| Admin cihaz kayıt | `src/app/api/chat/admin/register-device/route.ts` |

### Drizzle schema / migration

- **Schema:** [`src/lib/db/schema.ts`](src/lib/db/schema.ts) — `conversations`, `messages`, `admin_devices` tanımlı.
- **admin_devices:** `id`, `label`, `fcm_token` (unique), `platform`, `last_seen_at`. **is_active** yok; invalid token’ları devre dışı bırakmak için eklenmeli.
- **Migration klasörü:** `drizzle/0000_chat_mvp/migration.sql` — yeni alan için yeni migration üretilecek.
- **Drizzle config:** [`drizzle.config.ts`](drizzle.config.ts) — schema `./src/lib/db/schema.ts`, out `./drizzle`.

### Admin secret

- **Kontrol:** [`src/lib/chat/admin-auth.ts`](src/lib/chat/admin-auth.ts) — `requireAdminSecret(request)` sadece **header** `x-admin-secret` ile karşılaştırıyor; query’den key okunmuyor. Tüm admin API’ler bu fonksiyonu kullanıyor.
- **Inbox web girişi:** [`src/app/[locale]/inbox/page.tsx`](src/app/[locale]/inbox/page.tsx) — sayfa erişimi hâlâ `?key=` ile; `key === process.env.ADMIN_INBOX_SECRET` ise render, yoksa redirect. API çağrıları InboxClient’ta **header** ile yapılıyor (`x-admin-secret`). Yani API zaten header-only; URL’deki key sadece sayfa açılışı için.

### Capacitor (apps/inbox-mobile)

- **Mevcut:** Sadece static `www/index.html` — URL’den `key` alıp doğrudan `/{locale}/inbox?key=...` yönlendirmesi yapıyor. **FCM token alma veya register-device çağrısı yok.** README’de “FCM push token kaydı (MVP sonrası)” notu var.
- **Eksik:** Push permission, FCM token alma, token’ı `POST /api/chat/admin/register-device` ile gönderme, bildirim tıklanınca inbox’ı `?conv=<id>` ile açma.

## FCM Push — Yapılacaklar

1. **Firebase Admin SDK modülü (server)**
   - Dosya: `src/server/push/fcm.ts` (veya `src/lib/chat/fcm.ts`).
   - Init: `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64` env’den base64 decode + parse; singleton.
   - `sendToTokens(tokens, payload)`: notification (title, body) + data (conversationId, type: 'chat_message').
   - FCM yanıtında invalid token’ları tespit et → DB’de ilgili kaydı pasif yap veya sil.

2. **Env**
   - `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64`: Firebase service account JSON’ının base64’ü (prod’da key dosyası yerine).

3. **Guest message route**
   - Push çağrısını yeni modüle taşı; payload’a `conversationId` ekle.

4. **admin_devices**
   - Şema: `is_active` boolean default true; migration.
   - Push gönderirken sadece `is_active === true` olanları al.
   - register-device: upsert sırasında `is_active: true`, `last_seen_at: now`.
   - Invalid token’da ilgili satırı `is_active: false` yap.

5. **Capacitor**
   - Push izni iste, FCM token al, `POST /api/chat/admin/register-device` (header `x-admin-secret`, body `{ fcmToken, label }`).
   - Bildirim tıklanınca açılış URL’sine `conv=<id>` ekle (plugin/native ile mümkünse).

6. **Test**
   - Guest mesaj at → DB’de kayıt, admin web’de görünüm, admin cihazda push.
   - Push’a tıkla → Inbox açılır, ilgili konuşma seçili.

## Prod hazırlık — Checklist

- **Env:** `DATABASE_URL`, `ADMIN_INBOX_SECRET`, `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64` dokümante edildi; prod’da secret ve Firebase key güvenli.
- **Admin API:** Tüm admin endpoint’ler `x-admin-secret` header ile korunuyor; key URL’de taşınmıyorsa da API çalışır (Inbox sayfa girişi için ?key= ayrı).
- **Rate limit:** Guest message endpoint’inde mevcut (5s pencerede 10 istek); değerler dokümanda: `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`.
- **Build:** `npm run build` hatasız.
- **Smoke test:** Guest mesaj, admin listele, push (gerç cihaz/emülatör), push tıklanınca conv açılımı.

## Görev listesi / Sprint backlog

| # | Görev | Done kriteri |
|---|--------|---------------|
| 1 | Firebase Admin push modülü | `src/server/push/fcm.ts` (veya lib/chat/fcm); init + sendToTokens + invalid token → DB güncelle |
| 2 | Env FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 | Dokümantasyon + init’te kullanım |
| 3 | admin_devices is_active + migration | Schema + migrate; push’ta sadece active, register’da active=true |
| 4 | register-device invalid token handling | Push yanıtından invalid token’ları DB’de pasif yap |
| 5 | Guest message route push payload | conversationId + type data’da; yeni FCM modülünü kullan |
| 6 | Inbox ?conv= ile konuşma seçimi | Page’den conv searchParam → InboxClient initial selectedId |
| 7 | Capacitor: token al + register-device | İzin, token, POST register-device (header x-admin-secret) |
| 8 | Capacitor: bildirim tıklanınca conv aç | Açılış URL’sine conv= ekle (plugin/native) |
| 9 | README / doküman | Rate limit değerleri, env listesi, MIUI pil notu |

## Notlar / Referanslar

- [Chat MVP — Mimari](03-architecture.md)
- [inbox-mobile README — FCM](../../apps/inbox-mobile/README.md)
- Admin auth: [`src/lib/chat/admin-auth.ts`](src/lib/chat/admin-auth.ts)
- Push tetik: [`src/app/api/chat/guest/message/route.ts`](src/app/api/chat/guest/message/route.ts)
- Schema: [`src/lib/db/schema.ts`](src/lib/db/schema.ts)
