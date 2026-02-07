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

## Açılış URL’i

Uygulama açılırken `?key=ADMIN_INBOX_SECRET` zorunlu. Örnek:

- `http://10.0.2.2:3000?key=YOUR_SECRET` (emülatör)
- `https://your-domain.com?key=YOUR_SECRET`

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

Android Studio’da Run (debug APK MVP için yeterli).
