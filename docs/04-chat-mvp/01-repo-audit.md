# Chat MVP — Repo Analizi (Dedektiflik)

Bu doküman, NANDD Chat MVP için yapılan repo incelemesinin çıktısıdır. Dosya yolları ve satır numaralarıyla belgelenmiştir.

---

## 1) Next.js ve App Router

- **Next.js sürümü:** 16.1.1 — [package.json](package.json) `dependencies.next`.
- **App Router:** Var. Uygulama rotaları `src/app/` altında.
- **Locale yapısı:** `src/app/[locale]/` kullanılıyor; tüm marketing sayfaları `src/app/[locale]/(marketing)/` altında (contact, iletisim, kurumsal, page.tsx, projeler, styleguide). Ayrıca `src/app/[locale]/design/` var.
- **Kaynak:** [src/app/[locale]/layout.tsx](src/app/[locale]/layout.tsx), [src/app/[locale]/(marketing)/layout.tsx](src/app/[locale]/(marketing)/layout.tsx).

---

## 2) i18n (next-intl)

- **Paket:** next-intl ^4.6.1 — [package.json](package.json).
- **Plugin:** `createNextIntlPlugin('./src/i18n/request.ts')` — [next.config.ts](next.config.ts).
- **Konfigürasyon:** [src/i18n/request.ts](src/i18n/request.ts): locale seçimi, `messages` yükleme (messages/${locale}.json + content/nandd/home.json veya home.${locale}.json).
- **Routing:** [src/i18n/routing.ts](src/i18n/routing.ts): locales `['tr', 'en', 'ar', 'ru', 'de', 'fr', 'it', 'es', 'pt', 'nl', 'sr', 'ka']`, defaultLocale `'tr'`, localePrefix `'always'`.
- **Navigation:** [src/i18n/navigation.ts](src/i18n/navigation.ts) (varsayılan next-intl davranışı için kullanılabilir).

---

## 3) Paket yöneticisi ve stack

- **Paket yöneticisi:** npm (package-lock.json mevcut; pnpm yok).
- **TypeScript:** Var — [tsconfig.json](tsconfig.json), devDependencies içinde typescript ^5.
- **Tailwind:** Var — tailwindcss ^4, @tailwindcss/postcss ^4 — [package.json](package.json).
- **shadcn/Radix:** Radix UI bileşenleri (accordion, dialog, dropdown-menu, label, navigation-menu, separator, slot, switch, tabs, tooltip), vaul (Drawer), class-variance-authority, tailwind-merge — [package.json](package.json). Bileşenler [src/components/ui/](src/components/ui/) altında (button, card, drawer, input, sheet, vb.).

---

## 4) Chat bubble / drawer

- **Chat bubble:** [src/components/sticky-actions-dock.tsx](src/components/sticky-actions-dock.tsx) satır 187–202. "Chat bubble" yorumu ile tek bir öğe: `MessageCircle` ikonlu, `t('chat')` aria-label’lı, `href="#"` ve `onClick={(e) => e.preventDefault()}` ile şu an işlevsiz bir buton/link. Yani "mesajlaşma" için UI noktası bu; henüz bir drawer veya sayfa açılmıyor.
- **Drawer (genel):** [src/components/ui/drawer.tsx](src/components/ui/drawer.tsx) — Vaul tabanlı: Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose. Panel `bg-surface-2`, `shadow-popover` kullanıyor (design rules ile uyumlu).
- **Drawer kullanımı:** Şu an sadece [src/components/locale-drawer.tsx](src/components/locale-drawer.tsx) dil seçimi için Drawer kullanıyor. **Chat için ayrı bir drawer bileşeni yok;** MVP’de chat bubble tıklandığında açılacak bir chat drawer’ı eklenmeli ve mevcut `src/components/ui/drawer.tsx` ile (ve token/surface kurallarına uygun) oluşturulabilir.
- **Render:** StickyActionsDock muhtemelen [locale] layout veya marketing layout içinde bir yerde render ediliyor; header/footer ile birlikte kontrol edilmeli (site-header’da LocaleDrawer var; dock için [src/app/[locale]/(marketing)/layout.tsx](src/app/[locale]/(marketing)/layout.tsx) veya üst layout incelenmeli).

---

## 5) UI token ve typography kuralları

- **globals.css:** [src/app/globals.css](src/app/globals.css).
  - Token’lar: `@theme inline` (satır 8–52): --color-* (background, foreground, surface-1, surface-2, shadow-soft, shadow-popover, overlay, overlay-strong, primary, muted, border, vb.).
  - :root (55–88) ve .dark (91–136): oklch ile semantic renk değişkenleri.
  - Typography: @layer utilities içinde .t-display, .t-h1–.t-h6, .t-lead, .t-body, .t-muted, .t-small, .t-caption, .t-label, .t-kicker, .t-nav (satır 180–279 civarı).
- **Design audit:** [scripts/design-audit.mjs](scripts/design-audit.mjs). Hardcode renk taraması: hex, rgb/rgba/hsl/oklch, text-white/bg-black, bg-black/xx. Allowlist: `src/app/globals.css`, `src/components/brand/nandd-logo.tsx`. İhlal varsa exit 1.
- **Kural:** Yeni UI’da hardcode renk yok; sadece token ve .t-* typography kullanılmalı. Design rules özeti: [docs/01-design-rules.md](docs/01-design-rules.md).

---

## 6) Deploy hedefi

- Repo içinde Vercel/serverless’e özel konfig yok. next dev / next build / next start ile node server çalıştırılabilir; plan “local + VPS” diyor, serverless kısıtları MVP için dikkate alınmayacak.

---

## Özet

| Konu | Durum |
|------|--------|
| Next.js 16, App Router | Evet, src/app/[locale]/ |
| i18n (next-intl) | Evet, request.ts + routing.ts |
| Paket | npm, TypeScript, Tailwind 4, shadcn/Radix/Vaul |
| Chat bubble | sticky-actions-dock.tsx içinde (şu an boş link) |
| Chat drawer | Yok; mevcut ui/drawer + token ile eklenecek |
| Token/typography | globals.css + design-audit.mjs, hardcode yasak |
| Deploy | local + VPS varsayımı |
