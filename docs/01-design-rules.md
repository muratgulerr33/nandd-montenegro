# Design Rules — Tek Kaynak Kılavuzu

Bu repoya eklenen "design rules" dökümanıdır. Tüm iddialar repo içinde aranıp bulunmuş; dosya yolu + satır numarası ile kanıtlanmıştır. Varsayım yok.

---

## 0) TL;DR

1. **Renk:** Sadece CSS token'ları kullan (`:root` / `.dark`). OKLCH tek renk formatı; hex/rgb/hsl yasak (bilinçli istisnalar hariç).
2. **Typography:** Metin boyutu ve ağırlığı için `.t-*` sınıflarını kullan; komponent içinde rastgele `text-3xl font-bold` yazma.
3. **Yüzey hiyerarşisi:** `background` < `surface-1` < `surface-2`. Card/Sheet/Drawer paneli `surface-2`, input `surface-1`.
4. **Gölge:** Yumuşak yüzeyler `shadow-soft`, popover/sheet/drawer `shadow-popover`. Sabit değer yazma.
5. **Overlay:** Modal/sheet/drawer arka planı `bg-overlay` veya `bg-overlay-strong`; `bg-black/40` gibi hardcode yok.
6. **Komponentler:** Card/Sheet/Drawer/Input token'lara bağlı; shadcn uyumlu. Destructive: `destructive` + `destructive-foreground`.
7. **Mobil menü performansı:** Sheet'te `forceMount`, overlay/content'te `transform-gpu` ve `will-change`; ilk açılış jank'ı azaltmak için.
8. **Dark mode:** Tüm token'lar `.dark` altında tanımlı; tema geçişi tutarlı.
9. **Doğrulama:** Release öncesi `npm run lint`, `npm run build` ve `npm run design:audit` çalıştır.
10. **Logo/özel görsel:** Logo drop-shadow gibi bilinçli istisnalar dokümanda "allowed" olarak belirtilir; dosya adı yazılır.

---

## 1) Tasarım sistemi kapsamı

Bu repo şu sistemleri standardize ediyor:

- **Typography:** `.t-display`, `.t-h1`–`.t-h6`, `.t-lead`, `.t-body`, `.t-muted`, `.t-small`, `.t-caption`, `.t-label`, `.t-kicker`, `.t-nav` — tek kaynak: [src/app/globals.css](src/app/globals.css) (satır 153–257, @layer utilities).
- **Token’lar:** Renk ve gölge semantic token’ları `:root` / `.dark` ve `@theme inline` ile; surface-1, surface-2, overlay, overlay-strong, shadow-soft, shadow-popover, destructive-foreground vb. — [src/app/globals.css](src/app/globals.css) satır 6–52 (@theme inline), 55–88 (:root), 91–136 (.dark).
- **Surfaces:** background < surface-1 < surface-2 hiyerarşisi; input → surface-1, card/sheet/drawer → surface-2.
- **Overlay:** Modal/sheet/drawer karartma için overlay / overlay-strong token’ları.
- **Theme:** Light/dark için aynı token isimleri, farklı oklch değerleri.

**Kaynak dosyalar:** [src/app/globals.css](src/app/globals.css), [src/components/ui/input.tsx](src/components/ui/input.tsx), [src/components/ui/card.tsx](src/components/ui/card.tsx), [src/components/ui/sheet.tsx](src/components/ui/sheet.tsx), [src/components/ui/drawer.tsx](src/components/ui/drawer.tsx), [src/components/mobile-nav.tsx](src/components/mobile-nav.tsx).

**Design principles:** Premium his (tipografik hiyerarşi, tutarlı spacing, shadow-soft/shadow-popover, token disiplini). Tutarlılık > yaratıcılık: yeni sayfa/komponent eklerken mevcut token ve `.t-*` kullan; yeni renk veya font boyutu uydurma. Tek kaynak: renk ve tipografi [src/app/globals.css](src/app/globals.css) içinde; component'ler oraya referans verir.

---

## 2) Renk / Token kuralları (hardcode yasak)

**Kural:** UI’da renkler semantic token’lardan gelir. Kullanılacak token örnekleri: `bg-background`, `bg-surface-1`, `bg-surface-2`, `text-foreground`, `text-muted-foreground`, `bg-overlay`, `bg-overlay-strong`, `text-destructive-foreground`, `border-border`, `ring-ring` vb.

**Kanıt (token tanımları):** [src/app/globals.css](src/app/globals.css) satır 6–52 (`@theme inline`), 61–96 (:root), 101–136 (.dark). Örnek: `--color-surface-1: var(--surface-1);` (9–10), `--color-overlay: var(--overlay);` (35), `--color-destructive-foreground: var(--destructive-foreground);` (34).

**Yasaklar:**

- Hex: `#xxx` — repoda `src` altında **0 eşleşme** (rg `#[0-9a-fA-F]{3,8}` src).
- rgb/rgba/hsl/oklch doğrudan komponent/sayfa kodunda: yasak. İstisna: aşağıdaki logo.
- `text-white` / `bg-black` / `border-white` / `border-black`: `src` altında **0 eşleşme**.

**İstisna (bilinçli hardcode):**

- **Logo drop-shadow:** [src/components/brand/nandd-logo.tsx](src/components/brand/nandd-logo.tsx) satır 11: `[filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.08))]` — görsel filtre; token ile ifade edilmediği için allowed. Logo görsel/filtre/hardcode renk alanlarına dokunulmaması kuralı: bu dosya allowlist’te kalır.

**rgb/rgba/hsl/oklch taraması sonucu:** Sadece [src/app/globals.css](src/app/globals.css) (token tanımları, oklch) ve [src/components/brand/nandd-logo.tsx](src/components/brand/nandd-logo.tsx):11 (rgba drop-shadow). Başka komponentte sabit renk yok.

**Yeni token ekleme reçetesi:** 1) `:root` içinde `--isim: oklch(...);` ekle. 2) `.dark` içinde aynı `--isim` için dark değeri ekle. 3) `@theme inline` içinde `--color-isim: var(--isim);` (veya gerekirse `--shadow-isim`) ekle. 4) Kullanım: `bg-isim`, `text-isim` vb. (Tailwind theme'den ürettiği sınıflar).

**Kullanım örnekleri:** `bg-surface-2`, `text-muted-foreground`, `bg-overlay`, `border-border`, `focus-visible:ring-ring/50`, `bg-destructive text-destructive-foreground`.

---

## 3) Surface (elevation) sistemi

**Hiyerarşi:** background < surface-1 < surface-2 (light ve dark’ta).

**Kanıt (değerler):** [src/app/globals.css](src/app/globals.css) — light: `--background` (61), `--surface-1` (95), `--surface-2` (96); dark: (101), (135), (136).

**Kullanım kuralları:**

- **Input:** `bg-surface-1` — [src/components/ui/input.tsx](src/components/ui/input.tsx) satır 11.
- **Card:** `bg-surface-2` — [src/components/ui/card.tsx](src/components/ui/card.tsx) satır 10.
- **Sheet panel:** `bg-surface-2` — [src/components/ui/sheet.tsx](src/components/ui/sheet.tsx) satır 68.
- **Drawer panel:** `bg-surface-2` — [src/components/ui/drawer.tsx](src/components/ui/drawer.tsx) satır 58.

---

## 4) Shadow sistemi

**Kural:** Rastgele `shadow-sm`/`shadow-lg` yerine `shadow-soft` / `shadow-popover` standardı.

**Token tanımları:** [src/app/globals.css](src/app/globals.css) satır 11–12 (@theme inline): `--shadow-soft`, `--shadow-popover` (oklch değerleri).

**Kullanım:**

- **shadow-soft:** Card — [src/components/ui/card.tsx](src/components/ui/card.tsx) satır 10; Input — [src/components/ui/input.tsx](src/components/ui/input.tsx) satır 11.
- **shadow-popover:** Sheet content — [src/components/ui/sheet.tsx](src/components/ui/sheet.tsx) satır 68; Drawer content — [src/components/ui/drawer.tsx](src/components/ui/drawer.tsx) satır 58.

---

## 5) Overlay / modal karartma

**Kural:** `bg-black/40` vb. yerine overlay token’ları: `bg-overlay`, `bg-overlay-strong`.

**Token değerleri:** [src/app/globals.css](src/app/globals.css) satır 77–78 (:root), 117–118 (.dark): `--overlay: oklch(0 0 0 / 40%)`, `--overlay-strong: oklch(0 0 0 / 50%)`.

**Kullanım:**

- Sheet overlay: `bg-overlay` — [src/components/ui/sheet.tsx](src/components/ui/sheet.tsx) satır 41.
- Drawer overlay: `bg-overlay-strong` — [src/components/ui/drawer.tsx](src/components/ui/drawer.tsx) satır 40.

---

## 6) Typography sistemi (.t-* utilities)

**Hedef:** Shadcn benzeri premium, tutarlı hiyerarşi. Başlık ve gövde için `.t-*` sınıfları; komponent içinde rastgele `text-3xl font-bold` yazılmaz.

**Tanımlar (hepsi [src/app/globals.css](src/app/globals.css) @layer utilities):**

| Sınıf       | Satır | Amaç / kullanım |
|------------|-------|------------------|
| .t-display | 153   | Hero büyük başlık; clamp + balance |
| .t-h1      | 161   | Sayfa başlığı |
| .t-h2      | 169   | Bölüm başlığı |
| .t-h3      | 177   | Alt bölüm |
| .t-h4      | 185   | Kart başlığı (CardTitle) |
| .t-h5      | 193   | Küçük başlık |
| .t-h6      | 201   | En küçük başlık |
| .t-caption | 209   | Küçük açıklama; color: var(--color-muted-foreground) |
| .t-label   | 215   | Etiket / form label |
| .t-nav     | 220   | Navigasyon linki; font-sans, color: var(--foreground) |
| .t-lead    | 230   | Lead paragraf |
| .t-body    | 235   | Gövde metni |
| .t-muted   | 241   | İkincil metin |
| .t-small   | 247   | Küçük metin |
| .t-kicker  | 252   | Kicker / üst başlık (uppercase) |

**text-wrap:** Başlıklar için `text-wrap: balance` (t-display, t-h1–t-h6); paragraf için `pretty` (t-caption, t-label, t-lead, t-body, t-muted, t-small). Font: `var(--font-geist)` başlıklar, `var(--font-sans)` body/nav; sayılar için `.font-numbers` (Manrope) — [src/app/globals.css](src/app/globals.css) satır 261–264.

**Font kaynağı:** [src/app/[locale]/layout.tsx](src/app/[locale]/layout.tsx) satır 7, 11–13 (Geist), 17–19 (Manrope); CSS’te --font-geist, --font-manrope — [src/app/globals.css](src/app/globals.css) satır 13–15.

**Kullanım kılavuzu:** Hero: `t-display` + `t-lead`. Bölüm başlığı: `t-h2`. Kart başlığı: `t-h4` (CardTitle zaten `t-h4` kullanıyor). Etiket / küçük metin: `t-label` / `t-caption`. Navigasyon linki: `t-nav`.

**Yapma:** Komponent içinde rastgele `text-3xl font-bold` yazma. İstisna: tek seferlik vurgu gerekiyorsa mümkünse en yakın `.t-*` sınıfına (örn. t-h3) yönlendir veya dokümanda istisna olarak not et.

---

## 7) Component yazım kuralları (UI bileşenleri)

**Card:** CardTitle `t-h4 leading-tight`, CardDescription `t-muted` — [src/components/ui/card.tsx](src/components/ui/card.tsx) satır 35, 45.

**Sheet:** SheetTitle / SheetDescription t-h4 / t-muted kullanılabilir (shadcn uyumlu); başlık/alt metin standardı — [src/components/ui/sheet.tsx](src/components/ui/sheet.tsx). Örnek kullanım: [src/components/mobile-nav.tsx](src/components/mobile-nav.tsx) satır 72–73 (SheetTitle asChild ile `t-h4 leading-none`).

**Drawer:** DrawerTitle / DrawerDescription — [src/components/ui/drawer.tsx](src/components/ui/drawer.tsx) satır 98–116; [src/components/locale-drawer.tsx](src/components/locale-drawer.tsx) satır 76–77.

**Input:** Token’lara bağlı: bg-surface-1, border-input, shadow-soft, focus-visible:ring-ring/50, aria-invalid:border-destructive — [src/components/ui/input.tsx](src/components/ui/input.tsx) satır 11–13.

**Button:** [src/components/ui/button.tsx](src/components/ui/button.tsx) — Destructive variant: `bg-destructive text-destructive-foreground hover:bg-destructive/90`, focus ring: `focus-visible:ring-destructive/20` (dark'ta 40).

**Badge:** [src/components/ui/badge.tsx](src/components/ui/badge.tsx) — Destructive: `bg-destructive text-destructive-foreground`, focus: `focus-visible:ring-destructive/20` (dark'ta 40).

**Sidebar:** [src/components/ui/sidebar.tsx](src/components/ui/sidebar.tsx) ve globals.css'te `--sidebar`, `--sidebar-border`, `--sidebar-ring`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`; Tailwind `@theme inline` ile `--color-sidebar-*` eşlendi.

**leading-tight / leading-none:** Kart başlığı için leading-tight (card.tsx:35); menü başlığı için leading-none (mobile-nav.tsx:72) — okunabilirlik/yer tasarrufu amacıyla.

---

## 8) Mobil menü / Sheet performans kuralları

**Kural:** İlk açılış jank’ini azaltmak için forceMount + compositor ipuçları (transform-gpu, will-change). Menü link listesi mümkünse memoize; gereksiz re-render engellenir.

**Kanıt:**

- **forceMount:** [src/components/mobile-nav.tsx](src/components/mobile-nav.tsx) satır 62: `SheetContent` için `forceMount`; [src/components/ui/sheet.tsx](src/components/ui/sheet.tsx) satır 33, 38, 54, 59, 63, 66: SheetOverlay ve SheetContent’te `forceMount` prop’u.
- **transform-gpu ve will-change:** [src/components/ui/sheet.tsx](src/components/ui/sheet.tsx) satır 41 (SheetOverlay: `transform-gpu [will-change:opacity]`), satır 68 (SheetContent: `transform-gpu [will-change:transform]`).
- **Memoization:** [src/components/mobile-nav.tsx](src/components/mobile-nav.tsx) satır 40–48: `navItems` `useMemo` ile hesaplanıyor.

**Not:** Drawer ([src/components/ui/drawer.tsx](src/components/ui/drawer.tsx)) overlay/content’te forceMount veya transform-gpu/will-change yok; ihtiyaç olursa Sheet’teki pattern uygulanabilir.

**Profiling playbook (kısa):** 1) Chrome DevTools → Performance; sayfa yüklü iken Record, menüyü aç/kapa, durdur. 2) FPS grafiğine bak; uzun task'lar varsa Layers/Rendering ile composite layer'ları incele. 3) Rendering sekmesinde Frame Rendering Stats (FPS meter) aç; 60fps'e yakınlığı gözle. 4) Metrikler: First contentful paint (menü açılışı), long task süresi, layout/paint sayısı.

---

## 9) Tema (light/dark) prensipleri

**Kural:** Token’lar iki temada da çalışır; CTA primary dark’ta da markaya uygun olmalı. Tüm renk token’ları `.dark` altında yeniden tanımlı.

**Kanıt:** [src/app/globals.css](src/app/globals.css) satır 91–136 (`.dark` bloğu): background, foreground, surface-1, surface-2, overlay, overlay-strong, primary, primary-foreground, destructive, destructive-foreground, border, input, ring, muted, muted-foreground vb. aynı isimlerle dark oklch değerleri.

---

## 10) PR / Değişiklik kontrol listesi (manuel)

Release veya PR öncesi kontrol:

**Light/Dark görsel:**

- [ ] Menü (Sheet): aç/kapa, overlay ve içerik rengi (bg-overlay, bg-surface-2).
- [ ] Dil drawer (LocaleDrawer): overlay ve panel (bg-overlay-strong, bg-surface-2).
- [ ] Form input’ları: border, focus ring, placeholder (input token’ları).
- [ ] Proje kartları: arka plan, gölge, başlık/metin (surface-2, shadow-soft, t-h4/t-muted).
- [ ] CTA butonlar: primary ve destructive (dark’ta da kontrast).

**Uyarılar:**

- "Flat / kirli gölge / düşük kontrast" — yeni bileşenlerde shadow-soft veya shadow-popover kullan; sabit gölge değeri yazma.
- Hardcode renk eklenmemeli: hex, rgb/rgba/hsl (istisna: logo), text-white/bg-black.

**Komutlar:**

- `npm run lint` / `pnpm lint` → exit 0.
- `npm run build` / `pnpm build` → exit 0.
- `npm run design:audit` / `pnpm design:audit` → exit 0; fail ise ya token’a çevir ya da allowlist’e ekle.

**Hardcode tarama (opsiyonel):** `rg -n ’#[0-9a-fA-F]{3,8}’ src` → beklenen: 0. `rg -n ’rgb\(|rgba\(|hsl\(|oklch\(’ src` → yalnızca globals.css + allowed istisna. `rg -n ’text-(white|black)\b|bg-(white|black)\b|border-(white|black)\b’ src` → 0.

---

## 11) Change Log (Design rules)

| Tarih       | Not |
|------------|-----|
| 2026-02-06 | İlk sürüm: typography (.t-*), token mimarisi (oklch, :root/.dark, @theme inline), surfaces/shadows, overlays, component standartları (Card, Sheet, Drawer, Input, Button, Badge, Sidebar), mobil menü performans (forceMount, transform-gpu, will-change), hardcode policy ve istisna (logo drop-shadow), QA checklist, design:audit guardrails. doc/ kaldırıldı; tek kaynak docs/. |

---

## Reference Index (dosya:satır)

| Konu | Dosya | Satırlar |
|------|--------|----------|
| @theme inline, token map | src/app/globals.css | 6–52 |
| :root (light) token’lar | src/app/globals.css | 55–88 |
| .dark token’lar | src/app/globals.css | 91–136 |
| .t-* typography | src/app/globals.css | 153–257 |
| font-numbers (Manrope) | src/app/globals.css | 261–264 |
| Input bg-surface-1, shadow-soft | src/components/ui/input.tsx | 11 |
| Card bg-surface-2, CardTitle t-h4, CardDescription t-muted | src/components/ui/card.tsx | 10, 35, 45 |
| Sheet overlay bg-overlay, content bg-surface-2, shadow-popover, forceMount, transform-gpu, will-change | src/components/ui/sheet.tsx | 41, 68, 33–38, 54–66 |
| Drawer overlay bg-overlay-strong, content bg-surface-2, shadow-popover | src/components/ui/drawer.tsx | 40, 58 |
| Mobil menü forceMount, useMemo navItems | src/components/mobile-nav.tsx | 62, 40–48 |
| Logo drop-shadow istisna (rgba) | src/components/brand/nandd-logo.tsx | 11 |
| Geist/Manrope layout | src/app/[locale]/layout.tsx | 7, 11–19 |
| DrawerTitle/DrawerDescription kullanımı | src/components/locale-drawer.tsx | 76–77 |
