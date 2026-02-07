# Chat MVP — VPS’e Deploy

Bu dokümanda tek sunucuda (VPS) domain + SSL, Node process (pm2), env ve temel operasyon adımları özetlenir. Hedef: **~15 dakikada** yeniden kurulum yapılabilmesi.

## Ön koşullar

- VPS (Ubuntu 22.04 veya benzeri)
- Domain’in A kaydı VPS IP’sine yönlendirilmiş
- Proje repoda (`git clone` veya rsync ile dosyalar sunucuda)

## 1. Domain + SSL (nginx)

- Nginx kurulumu ve reverse proxy:
  - `proxy_pass http://127.0.0.1:3000` (Next.js’in dinlediği port)
  - HTTPS için Certbot ile Let’s Encrypt: `sudo certbot --nginx -d your-domain.com`
- Örnek site bloku (HTTP → HTTPS yönlendirme + proxy):

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- Nginx reload: `sudo nginx -t && sudo systemctl reload nginx`

## 2. Node process (pm2)

- PM2 kurulumu: `npm install -g pm2`
- Proje dizininde build: `npm ci && npm run build`
- Başlatma (örnek isim `nandd-web`):

```bash
pm2 start npm --name "nandd-web" -- start
```

- Port 3000’i kullanacak şekilde (`PORT=3000` env’de veya `next start` varsayılanı).
- Kalıcılık: `pm2 save` ve `pm2 startup` (reboot sonrası otomatik başlasın).

## 3. Env dosyası

- Proje kökünde `.env` (veya pm2 ecosystem ile `env_file`).
- Zorunlu / önerilen değişkenler:
  - `DATABASE_URL` — Postgres bağlantı dizesi
  - `ADMIN_INBOX_SECRET` — Inbox ve chat API admin secret
  - `NEXT_PUBLIC_APP_URL` — Site public URL (örn. `https://your-domain.com`)
  - `NEXT_PUBLIC_INBOX_URL` — Inbox arayüzü URL’i (genelde aynı)
  - `API_BASE_URL` — API base (genelde site ile aynı)
  - `CORS_ALLOWED_ORIGINS` — İsteğe bağlı; yoksa `NEXT_PUBLIC_APP_URL` ve `NEXT_PUBLIC_INBOX_URL` kullanılır
  - `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64` — FCM push için (Firebase Admin SDK)
- Örnek: `.env.example` dosyasına bakın; prod’da gerçek değerleri doldurun.

## 4. Healthcheck endpoint

- Uygulama: `GET /api/health` → `200` ve `{ "ok": true }`.
- Load balancer veya monitoring ile periyodik istek atılabilir.
- Başarısızsa pm2 restart veya uyarı tetiklenebilir.

## 5. Log path

- PM2 logları varsayılan: `~/.pm2/logs/`
  - `nandd-web-out.log` — stdout
  - `nandd-web-error.log` — stderr
- Log rotasyonu: `pm2 install pm2-logrotate` (isteğe bağlı).

## 6. Restart komutları

- Uygulama restart: `pm2 restart nandd-web`
- Tüm listeyi görmek: `pm2 list`
- Log izleme: `pm2 logs nandd-web`
- Durum: `pm2 status nandd-web`

## Özet kontrol listesi

1. Domain DNS → VPS IP
2. Nginx: HTTP → HTTPS, proxy → `127.0.0.1:3000`
3. SSL: Certbot
4. `.env` dolduruldu, `npm run build`, `pm2 start`
5. `pm2 save` + `pm2 startup`
6. Healthcheck: `curl -s https://your-domain.com/api/health` → `{"ok":true}`

Bu adımlarla saha testi için prod ortamı hazır olur; inbox ve chat API aynı origin’de çalışır, CORS sadece tanımlı origin’lere açıktır.

## Smoke test

Deploy sonrası chat API’yi hızlıca doğrulamak için: `ADMIN_INBOX_SECRET=your-secret BASE_URL=https://your-domain.com npm run chat:smoke`. Script: admin settings GET/POST, test-push, conversations listesi çağrıları yapar.
