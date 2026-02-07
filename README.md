This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Chat MVP (local)

Veritabanı **5434** portunda çalışır (diğer projeler 5432/5433 kullanıyorsa).

**Local setup (3 adım):**

```bash
docker compose up -d
npm run db:migrate
npm run dev:lan
```

LAN sunucusunu yeniden başlatmak için tekrar: `npm run dev:lan`

1. **Postgres (Docker):**
   ```bash
   docker compose up -d
   ```
2. **Migration:** Idempotent (ikinci çalıştırmada uygulanmış migration’lar SKIP). `drizzle/meta/_journal.json` yoksa da çalışır (migration.sql sırayla uygulanır).
   ```bash
   npm run db:migrate
   ```
3. **Uygulama:** `npm run dev` veya LAN için `npm run dev:lan` → site açılır.
4. **Ortam:** `.env` içinde `DATABASE_URL=postgresql://nandd:nandd@localhost:5434/nandd`, isteğe bağlı `ADMIN_INBOX_SECRET=your-secret`, push için `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64` (Firebase service account JSON'ın base64'ü).
5. **Test:** Ana sayfada mobil görünümde sohbet balonuna tıkla → drawer açılır, mesaj at. Admin: `/[locale]/inbox?key=ADMIN_INBOX_SECRET` → konuşma listesi, yanıt yaz. Guest tarafında polling ile cevap görünür.
6. **Design audit:** `npm run design:audit` (hardcode renk kontrolü). **Build:** `npm run build`.

## Chat MVP — LAN’da test (aynı Wi‑Fi, telefon)

Aynı ağdaki telefondan guest → admin push testi için:

1. **IP / .env.lan:** `.env.lan` yoksa `cp .env.lan.example .env.lan` yapın. İçindeki `192.168.1.23`’ü kendi bilgisayarınızın LAN IP’si yapın (gerekirse).
2. **Dev server:** `npm run dev:lan` → Next, `0.0.0.0:3000`’de ve `.env.lan` URL’leriyle açılır.
3. **Telefon:** Tarayıcıda `http://192.168.1.23:3000` açılmalı.
4. **Smoke test:** `ADMIN_INBOX_SECRET=... BASE_URL=http://192.168.1.23:3000 npm run chat:smoke` (PASS olmalı).
5. **Mobil uygulama:** `apps/inbox-mobile/www/inbox-config.js` içinde `baseUrl` ve `secret` (ADMIN_INBOX_SECRET) ayarlayın; uygulama açılınca Push Test ve guest mesaj → push doğrulanır.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
