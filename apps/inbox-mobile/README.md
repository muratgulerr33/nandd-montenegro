# NANDD Inbox — Capacitor Android shell

Minimal WebView shell: uygulama açılınca inbox web sayfasına yönlendirir.

## Kurulum

```bash
cd apps/inbox-mobile
npm install
npx cap add android
```

## Yapılandırma

- **Local dev (emülatör):** `capacitor.config.ts` içinde `server.url: 'http://10.0.2.2:3000'` açın; canlı Next.js `npm run dev` ile 3000’de çalışsın.
- **Canlı:** `server.url: 'https://your-domain.com'` yapın veya `server`’ı kaldırın (aynı origin).

### Debug vs Prod build (2 flavor)

| Amaç | Nasıl |
|------|--------|
| **Debug** | Emülatör/cihazda local backend: `capacitor.config.ts` içinde `server: { url: 'http://10.0.2.2:3000' }` açın; veya build öncesi `export INBOX_SERVER_URL=http://10.0.2.2:3000` (veya cihaz IP’si). `npx cap sync android` → Android Studio’da Run. |
| **Prod** | Prod domain’e sabit: Build/sync öncesi `export INBOX_SERVER_URL=https://your-domain.com` (veya `NEXT_PUBLIC_INBOX_URL`). Sonra `npx cap sync android` → release build alın. |

`__INBOX_PUSH_CONFIG__` içindeki `baseUrl`: WebView açılış URL’i (Capacitor `server.url` veya query `?base=`) ile belirlenir; prod build’de env’den gelen `INBOX_SERVER_URL` / `NEXT_PUBLIC_INBOX_URL` kullanılır.

## Açılış URL’i / LAN config

- **`www/inbox-config.js`:** LAN veya prod için `baseUrl` ve `secret` tanımlanır. **Burada `secret` yerine ADMIN_INBOX_SECRET değerini yazın** (placeholder kalsın diye bırakmayın).
- Alternatif: Tarayıcıdan `?key=ADMIN_INBOX_SECRET` ile açarsanız secret URL’den okunur.

Örnek URL’ler:

- `http://10.0.2.2:3000?key=YOUR_SECRET` (emülatör)
- `https://your-domain.com?key=YOUR_SECRET`
- LAN: `www/inbox-config.js` içinde `baseUrl: "http://192.168.1.23:3000"` ve `secret: "gerçek-secret"` yapın.

İsteğe bağlı: `&base=https://api-domain.com` (API farklı host ise), `&locale=tr`.

## FCM push token kaydı

Admin cihaza push gitmesi için FCM token’ın backend’e kaydedilmesi gerekir:

1. Android projede Firebase ekleyin, `google-services.json` koyun.
2. `@capacitor-firebase/messaging` veya Android tarafında FCM token alıp `POST /api/chat/admin/register-device` (header: `x-admin-secret`, body: `{ fcmToken, label }`) ile kaydedin.
3. Token’ı ya native tarafta alıp API’ye gönderin ya da WebView’da Capacitor bridge ile alıp aynı endpoint’e gönderin.

**MIUI / pil kısıtlaması:** Xiaomi ve bazı Android sürümlerinde uygulama pil tasarrufu ile kısıtlanırsa push gelmeyebilir. Ayarlar → Uygulamalar → NANDD Inbox → Pil tasarrufu: **Kısıtlama yok** olarak ayarlayın.

**Push Test:** Test bildirimi göndermek için uygulama içinde bottom nav → **Ayarlar** sekmesi → “Push Test” kartındaki “Test Push Gönder” butonunu kullanın.

## Build / çalıştırma

```bash
npx cap sync android
npx cap open android
```

Android Studio’da Run (debug APK MVP için yeterli). Prod APK için yukarıdaki Prod build adımlarını uygulayıp release build alın.
