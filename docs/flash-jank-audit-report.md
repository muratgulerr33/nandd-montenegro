# Flash/Jank Denetim Raporu

## 1) Bulgu Raporu

### Kesin düzeltilecekler

| Bulgu | Dosya + satır | Durum |
|-------|----------------|--------|
| `scroll-behavior: smooth` (mobilde jank) | `src/app/globals.css` (eski satır 6–8) | Kaldırıldı |
| Global no-flash motion primitive'leri eksik | `src/app/globals.css` | `.gpu`, `.motion-safe-transforms`, `.motion-safe-colors` eklendi; `prefers-reduced-motion` ile kapatıldı |

### Dokunulmayacaklar (overlay bileşenleri dahil)

- **transition-all:** Repo genelinde yok (önceki temizlikte kaldırılmış).
- **transition-shadow / filter / backdrop animasyonu:** Yok.
- **scroll/resize + setState:** Sadece `sticky-actions-dock.tsx` scroll kullanıyor; `passive: true` ve ref+RAF, setState scroll’da yok.
- **addEventListener("scroll")** passive olmayan: Yok (dock passive).
- **Route/page transition:** Layout’larda (`[locale]/layout.tsx`, `(marketing)/layout.tsx`) main/wrapper’da hiç `transition`/`animate` yok.
- **next/link:** next-intl `Link` kullanılıyor; custom page transition wrapper yok.
- **Sheet/Drawer/Dialog/Dropdown/Tooltip/Select** Content, Overlay, Portal: Plan gereği **hiçbir markup veya animasyon class’ına dokunulmadı.**

---

## 2) Uygulanan düzeltmeler (dosya bazlı)

| Dosya | Değişiklik |
|-------|------------|
| `src/app/globals.css` | `html { scroll-behavior: smooth }` kaldırıldı (sadece yorum bırakıldı). |
| `src/app/globals.css` | `@layer utilities` altına eklendi: `.gpu`, `.motion-safe-transforms`, `.motion-safe-colors`; `@media (prefers-reduced-motion: reduce)` ile bu utility’lerde transition/transform kapatıldı. Mevcut `.gpu-motion`, `.trans-smooth`, `.trans-fast` ve tactile sınıfları korundu. |

Overlay bileşenleri (sheet, drawer, dialog, dropdown, tooltip, select, popover) **değiştirilmedi.**

---

## 3) Page transition tamamen kapatıldı teyidi

- **Kaldırılan:** `html { scroll-behavior: smooth }` — artık sayfa içi scroll da anında, route değişiminde ek bir “smooth” davranışı yok.
- **Layout’lar:** `src/app/[locale]/layout.tsx` ve `src/app/[locale]/(marketing)/layout.tsx` içinde `main` veya wrapper’da **hiç** `transition` / `animation` class’ı yok; route değişince içerik anında render.
- **Link:** next-intl `Link`; ekstra page transition veya wrapper animasyonu yok.
- **Tema:** Tema değişiminde kullanılan “transition kapatma” (ThemeProvider / noFlashScript) mekanizmasına **dokunulmadı.**

Sonuç: **Route geçişinde ek bir fade/slide/animasyon yok; anında render.**

---

## 4) Komut sonuçları

- `npm run lint` — OK
- `npm run build` — OK (Next.js 16.1.1)
- `npm run design:audit` — OK (no hardcoded color violations)

---

## 5) Test checklist (manuel)

- [ ] Home: hızlı scroll + CTA hover/press
- [ ] Menü aç/kapa (overlay’e dokunulmadı; çevre UI’da flash var mı?)
- [ ] Checkbox toggle
- [ ] Route change (sayfa geçişinde hiçbir animasyon yok)
