# Masterpack #3 — Header

Header ile ilgili tasarım ve geliştirme kuralları. Tüm iddialar repo dosyalarına (dosya yolu + satır numarası) dayanır; varsayım yok.

**Kapsam:** Site header layout’u, breakpoint davranışı, theme switch, locale (desktop dropdown / mobil drawer), mobil menü (Sheet), logo, a11y ve performans.

**İlgili dosyalar:** [src/components/site-header.tsx](src/components/site-header.tsx), [src/components/desktop-nav.tsx](src/components/desktop-nav.tsx), [src/components/mobile-nav.tsx](src/components/mobile-nav.tsx), [src/components/theme/theme-switch.tsx](src/components/theme/theme-switch.tsx), [src/components/theme/theme-provider.tsx](src/components/theme/theme-provider.tsx), [src/components/locale-switcher.tsx](src/components/locale-switcher.tsx), [src/components/locale-drawer.tsx](src/components/locale-drawer.tsx), [src/components/brand/nandd-logo.tsx](src/components/brand/nandd-logo.tsx), [src/app/[locale]/layout.tsx](src/app/[locale]/layout.tsx), [src/app/globals.css](src/app/globals.css), [src/components/ui/sheet.tsx](src/components/ui/sheet.tsx), [src/components/ui/drawer.tsx](src/components/ui/drawer.tsx).

---

## 0) TL;DR

1. **Layout:** Sol logo, orta desktop nav (lg+), sağ aksiyonlar (theme + CTA + locale). Mobilde (lg altı) theme + locale drawer + hamburger.
2. **Breakpoint:** `lg` (Tailwind) — desktop `hidden lg:flex`, mobil `flex lg:hidden`.
3. **Aksiyon butonları:** `h-11 w-11` (44×44), `rounded-full`, `border border-border/60`, `bg-background/60 backdrop-blur`; `gap-2`.
4. **Theme switch:** Sun ve Moon aynı DOM’da; `dark:hidden` / `hidden dark:block`. `aria-label="Tema değiştir"` sabit. Hydration için class tabanlı, script layout’ta.
5. **Locale:** Desktop DropdownMenu (TR/EN vb.), mobil Drawer; liste flag + label + short; drawer’da `onOpenAutoFocus` ilk butona.
6. **Mobil menü:** Sheet + `SheetTitle` + `SheetDescription` (sr-only), `onOpenAutoFocus` ilk linke; `forceMount` + `transform-gpu`/`will-change`.
7. **Logo:** `priority`, light/dark iki Image; light’ta drop-shadow (design rules istisnası).
8. **Header:** `sticky top-0 z-50`, `bg-background/80 backdrop-blur`, `border-b border-border/60`.
9. **A11y:** Tüm aksiyonlarda `aria-label` veya `sr-only` metin; focus-visible ring; Sheet/Drawer’da Title + Description.
10. **Release:** `npm run lint`, `npm run build`, viewport test, hard refresh, theme/locale/drawer test.

---

## 1) Amaç ve ilkeler

- **Premium his:** Header sade, token’lara uygun (background, border, surface); tutarlı spacing ve dokunma alanları.
- **Native/stabilite:** Tema FOUC önleme script’i; hydration uyumlu (class tabanlı tema). RTL için `dir` layout’tan gelir.
- **Tek kaynak:** Header davranışı ve sınıflar bu dokümandaki dosya referanslarıyla kilitlenir; değişiklik yaparken bu spec’e uyulur.

**Kanıt (layout/html):** [src/app/[locale]/layout.tsx](src/app/[locale]/layout.tsx) satır 47–51: `noFlashScript` head’te; `html` üzerinde `lang={locale}`, `dir={locale === 'ar' ? 'rtl' : 'ltr'}`, `suppressHydrationWarning`. [src/components/theme/theme-provider.tsx](src/components/theme/theme-provider.tsx) satır 10–16: `storageKey="nandd-theme"`, `attribute="class"`, `defaultTheme="system"`, `enableColorScheme={false}`.

---

## 2) Layout yapısı

- **Sol:** Ana sayfaya giden logo linki. [src/components/site-header.tsx](src/components/site-header.tsx) satır 17–19: `<Link href="/">` + `NanddLogo`.
- **Orta (sadece lg ve üstü):** Desktop nav. Satır 22–24: `hidden lg:flex flex-1 min-w-0 justify-center` + `DesktopNav`.
- **Sağ (lg ve üstü):** ThemeSwitch, “Randevu Al” butonu, LocaleSwitcher. Satır 27–33: `hidden lg:flex shrink-0 items-center gap-2`.
- **Mobil (lg altı):** ThemeSwitch, LocaleDrawer, MobileNav. Satır 36–40: `flex shrink-0 lg:hidden items-center gap-2`.

**Container:** Satır 16: `sticky top-0 z-50 w-full bg-background/80 backdrop-blur border-b border-border/60`; iç div `container mx-auto flex min-h-[56px] items-center justify-between gap-2 px-4 py-2`.

---

## 3) Breakpoint davranışı (lg+ / lg-)

- **lg ve üstü:** Masaüstü nav görünür, mobil hamburger + locale drawer gizli. Desktop nav: [src/components/site-header.tsx](src/components/site-header.tsx) satır 22 `hidden lg:flex`; sağ blok satır 27 `hidden lg:flex`.
- **lg altı:** Mobil blok görünür: satır 36 `flex lg:hidden`. Desktop nav ve sağ CTA/locale dropdown gizlenir; yerine ThemeSwitch + LocaleDrawer + MobileNav (hamburger).

**Locale:** [src/components/locale-drawer.tsx](src/components/locale-drawer.tsx) satır 69: trigger’da `lg:hidden` (sadece mobilde drawer). [src/components/locale-switcher.tsx](src/components/locale-switcher.tsx) site-header’da sadece `lg:` blokta render edilir; mobilde LocaleDrawer kullanılır.

**Mobil menü:** [src/components/mobile-nav.tsx](src/components/mobile-nav.tsx) satır 54: trigger `lg:hidden` — sadece lg altında gösterilir.

---

## 4) Aksiyon buton standardı (header sağ / mobil)

Tüm header aksiyonları (theme, locale, hamburger) tutarlı dokunma alanı ve stilde:

- **Boyut:** `h-11 w-11` (44×44 px). **Kanıt:** [src/components/theme/theme-switch.tsx](src/components/theme/theme-switch.tsx) satır 25; [src/components/locale-drawer.tsx](src/components/locale-drawer.tsx) satır 69; [src/components/locale-switcher.tsx](src/components/locale-switcher.tsx) satır 42; [src/components/mobile-nav.tsx](src/components/mobile-nav.tsx) satır 54.
- **Şekil:** `rounded-full` (daire). Aynı satırlar.
- **Çerçeve / arka plan:** `border border-border/60`, `bg-background/60 backdrop-blur`, `hover:bg-muted/40`. Theme ve mobil butonlarda: theme-switch satır 25, locale-drawer satır 69, mobile-nav satır 54. Locale-switcher desktop: `variant="outline" size="sm"` + `rounded-full` (satır 42).
- **Aralık:** Header sağ/mobil blokta `gap-2`. [src/components/site-header.tsx](src/components/site-header.tsx) satır 27, 36.

---

## 5) Theme switch: hydration-safe kuralı

- **Aynı DOM’da Sun + Moon:** İkon değişimi CSS ile; SSR/CSR aynı. **Kanıt:** [src/components/theme/theme-switch.tsx](src/components/theme/theme-switch.tsx) satır 27–28: `<Sun className="... dark:hidden" aria-hidden />`, `<Moon className="... hidden dark:block" aria-hidden />`. Toggle mantığı satır 14–16: `document.documentElement.classList.contains("dark")` + `setTheme(isDark ? "light" : "dark")`.
- **aria-label:** Sabit Türkçe `"Tema değiştir"` (satır 26). Tooltip metni de aynı (satır 32–33).
- **FOUC önleme:** Tema sınıfı sayfa render’dan önce uygulanır. [src/app/[locale]/layout.tsx](src/app/[locale]/layout.tsx) satır 47: script `nandd-theme` localStorage + `prefers-color-scheme` ile `document.documentElement.classList.toggle('dark', ...)`. `enableColorScheme={false}` ile [theme-provider](src/components/theme/theme-provider.tsx) sadece class kullanır; color-scheme [globals.css](src/app/globals.css) `:root` / `.dark` içinde (satır 57, 95).

---

## 6) Locale: header trigger, drawer listesi, scroll

- **Desktop trigger:** [src/components/locale-switcher.tsx](src/components/locale-switcher.tsx) satır 41–44: `Button variant="outline" size="sm"` + `h-11 w-11 shrink-0 rounded-full p-0`; metin `localeLabels[locale]` (TR, EN, vb.).
- **Mobil trigger:** [src/components/locale-drawer.tsx](src/components/locale-drawer.tsx) satır 67–71: aynı kısa kod (TR/EN vb.), `lg:hidden`, `rounded-full`, `border border-border/60 bg-background/60 backdrop-blur`.
- **Drawer liste formatı:** Flag + label + short. Satır 33–45 `localeData`: `label` (Türkçe, English…), `short` (TR, EN…), `flag` emoji. Satır 105–111: `<span aria-hidden>` flag, `t-label` ile label, `t-caption` ile short.
- **Drawer başlık / a11y:** Satır 73–76: `DrawerHeader className="sr-only"`, `DrawerTitle` "Dil Seçimi", `DrawerDescription` "Sitenin dilini değiştir". Görünür başlık satır 79: "Dil Seçin", alt açıklama satır 86 "Bir dil seçin".
- **Scroll:** Satır 87: içerik `min-h-0 flex-1 overflow-y-auto p-4 pb-8 [-webkit-overflow-scrolling:touch]`.
- **Focus:** Satır 58–61 `handleOpenAutoFocus`: `preventDefault` + `requestAnimationFrame` ile ilk locale butonuna focus (satır 96 `ref={index === 0 ? firstLocaleButtonRef : undefined}`).

---

## 7) Mobil menü: Sheet a11y ve focus

- **Sheet kullanımı:** [src/components/mobile-nav.tsx](src/components/mobile-nav.tsx) satır 51–57: `Sheet`, `SheetContent side="right" hideCloseButton forceMount`, `className="w-[88vw] max-w-sm h-dvh flex flex-col p-0"`, `onOpenAutoFocus={handleOpenAutoFocus}`.
- **Title / Description (a11y):** Satır 66–69: `SheetHeader className="sr-only"`, `SheetTitle` "Menü", `SheetDescription` "Sayfalara gitmek için menü". Radix Dialog’un Title/Description’ı bu sayede kullanılır; [src/components/ui/sheet.tsx](src/components/ui/sheet.tsx) satır 114–138 `SheetTitle` / `SheetDescription` Radix primitive’e bağlı.
- **Focus yönetimi:** Satır 36–38 `handleOpenAutoFocus`: default focus iptal, `requestAnimationFrame` ile `firstLinkRef.current?.focus()`. İlk link satır 86 `ref={item.isFirst ? firstLinkRef : undefined}`.
- **Nav link sınıfı:** Satır 24–25 `NAV_LINK_CLASS`: `t-nav`, `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`, hover/focus stilleri.
- **Performans:** Sheet’te `forceMount`; overlay/content’te `transform-gpu` ve `will-change` — [src/components/ui/sheet.tsx](src/components/ui/sheet.tsx) satır 40, 66. Design rules ile uyumlu (01-design-rules.md mobil menü performansı).

---

## 8) Performans: logo (LCP), sticky, backdrop

- **Logo priority:** [src/components/brand/nandd-logo.tsx](src/components/brand/nandd-logo.tsx) satır 13, 21: her iki `Image` için `priority` — LCP için öncelikli yükleme.
- **Boyut/sizes:** Satır 5: wrapper `h-8 w-[clamp(130px,42vw,190px)] sm:h-8 sm:w-[190px] md:h-9 md:w-[210px]`. Satır 12, 21: `sizes="(max-width: 640px) 42vw, (max-width: 768px) 190px, 210px"`.
- **Sticky + backdrop:** [src/components/site-header.tsx](src/components/site-header.tsx) satır 15: `sticky top-0 z-50 w-full bg-background/80 backdrop-blur` — scroll’da hafif saydamlık ve blur.

---

## 9) Erişilebilirlik (aria-label, focus-visible, klavye)

- **Theme:** [src/components/theme/theme-switch.tsx](src/components/theme/theme-switch.tsx) satır 26: `aria-label="Tema değiştir"`. İkonlar `aria-hidden`.
- **Mobil menü trigger:** [src/components/mobile-nav.tsx](src/components/mobile-nav.tsx) satır 55: `<span className="sr-only">Toggle menu</span>`.
- **Kapat butonları:** mobile-nav satır 76, locale-drawer satır 82: `<span className="sr-only">Kapat</span>`.
- **Locale drawer öğeleri:** [src/components/locale-drawer.tsx](src/components/locale-drawer.tsx) satır 103: `aria-label={data.label}`.
- **Focus ring:** Theme switch satır 25: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`. Mobile nav NAV_LINK_CLASS ve SheetClose’ta `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`. Klavye ile gezinme Radix Sheet/Drawer ve Link’lerle desteklenir.

---

## 10) Console temizliği (a11y uyarıları)

Sheet ve Drawer’da Radix Dialog/Vaul kullanımı nedeniyle Title + Description sağlanır; eksik olursa konsol uyarısı çıkar. Mevcut implementasyon:

- Mobile nav: `SheetTitle` + `SheetDescription` (sr-only) — [src/components/mobile-nav.tsx](src/components/mobile-nav.tsx) satır 66–69.
- Locale drawer: `DrawerTitle` + `DrawerDescription` (sr-only) — [src/components/locale-drawer.tsx](src/components/locale-drawer.tsx) satır 73–76.

Bu yapı korunmalı; yeni Sheet/Drawer açılımlarında da Title + Description verilmeli.

---

## 11) Dokunma kuralları (kırmızı çizgiler)

Aşağıdakiler değiştirilmeden kalmalı; değişiklik spec ve tasarım kurallarıyla uyumlu dokümante edilmeli.

- **Breakpoint:** Header layout ayrımı `lg` (Tailwind). Desktop/mobil blok sınıfları (`hidden lg:flex` / `flex lg:hidden`) kaldırılmamalı.
- **Aksiyon buton boyutu:** Header’daki theme, locale, hamburger `h-11 w-11` (44×44); daha küçük yapılmamalı.
- **Theme switch DOM:** Sun ve Moon aynı DOM’da, görünürlük sadece `dark:hidden` / `hidden dark:block` ile. Ayrı mount/conditional render ile farklı HTML üretilmemeli (hydration mismatch riski).
- **FOUC script:** [src/app/[locale]/layout.tsx](src/app/[locale]/layout.tsx) içindeki `noFlashScript` ve head’teki script kaldırılmamalı; storage key `nandd-theme` theme-provider ile aynı olmalı.
- **Sheet/Drawer a11y:** Mobile nav ve locale drawer’da Title + Description (sr-only dahil) mutlaka bulunmalı; `onOpenAutoFocus` ile ilk odaklanabilir öğeye focus verilmeli.
- **Token kullanımı:** Header ve alt bileşenlerde renk/arka plan için sadece token (örn. `bg-background/80`, `border-border/60`, `bg-surface-2`); hardcode renk yok (01-design-rules, 02-guardrails ile uyumlu). Logo drop-shadow tek bilinçli istisna.

---

## 12) Release checklist

Header ile ilgili release öncesi kontrol listesi:

1. `npm run lint` — exit 0.
2. `npm run build` — exit 0.
3. `pnpm design:audit` (veya `npm run design:audit`) — exit 0 (02-guardrails).
4. Viewport test: lg üstü ve lg altı görünüm; desktop nav / mobil menü + locale drawer doğru görünmeli.
5. Hard refresh (Cache bypass): tema ve locale’in doğru yüklendiği kontrol edilmeli.
6. Tema toggle: light/dark geçişi, logo ve header stilleri tutarlı; konsol temiz.
7. Locale drawer (mobil): Açılış, scroll, dil seçimi, kapatma; ilk öğeye focus.
8. Mobil menü: Açılış, link tıklama ile kapanma, ilk linke focus; footer CTA/dropdown (mevcut placeholder’lar) davranışı.

---

## 13) Troubleshooting

- **FOUC (tema yanıp sönmesi):** Layout’taki no-flash script’in head’te ve `<html>`’den önce çalıştığından emin olun. `storageKey` (nandd-theme) theme-provider ile aynı olmalı. [src/app/[locale]/layout.tsx](src/app/[locale]/layout.tsx) satır 47, [src/components/theme/theme-provider.tsx](src/components/theme/theme-provider.tsx) satır 11.
- **Hydration mismatch (theme):** Theme switch’te tek DOM’da Sun+Moon ve class ile göster/gizle kullanılmalı; tema durumuna göre farklı tek ikon render edilmemeli. [src/components/theme/theme-switch.tsx](src/components/theme/theme-switch.tsx) satır 27–28.
- **aria-hidden / focus:** Drawer/Sheet açıldığında odak içeriğe gider; overlay’e odaklanmamalı. Radix/Vaul varsayılan focus tuzakları kullanılıyor; `onOpenAutoFocus` ile ilk mantıklı öğe seçili (mobile-nav satır 36–38, locale-drawer satır 58–61).
- **Missing description uyarısı:** Radix Dialog “Description” eksikse uyarı verir. Mobile nav ve locale drawer’da `SheetDescription` / `DrawerDescription` mevcut (sr-only dahil). Yeni panel eklenirse mutlaka Title + Description ekleyin.

---

## Özet

Header şu an bu dokümandaki spec’e göre kilitlenmiş durumda: layout, breakpoint, aksiyon butonları, theme (hydration-safe), locale (desktop + mobil drawer), mobil menü (Sheet a11y + focus), logo (priority), sticky/backdrop ve a11y kuralları repo kanıtıyla tanımlı. Değişiklik yaparken “Dokunma kuralları” ve [01-design-rules.md](01-design-rules.md) / [02-guardrails.md](02-guardrails.md) ile uyum korunmalı.
