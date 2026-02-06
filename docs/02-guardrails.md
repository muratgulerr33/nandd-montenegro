# Design Guardrails — Otomatik Hardcode Kontrolü

Design kuralları dokümante edildikten sonra, yanlışlıkla `text-white`, `bg-black/40`, `hsl(...)` vb. geri dönmesin diye otomatik tarama script’i çalıştırılır. Eşleşme varsa script **fail** döner (CI’da kırmızı).

---

## Ne kontrol ediliyor?

Script (`scripts/design-audit.mjs`) `src` altındaki `.css`, `.tsx`, `.ts`, `.jsx`, `.js`, `.mjs`, `.cjs` dosyalarını tarar. Aşağıdaki pattern’ler **yasak** (token kullanılmalı):

| Kural | Açıklama |
|-------|----------|
| **hex** | `#abc`, `#aabbcc`, `#aabbcc80` — hex renk kullanımı |
| **color-func** | `rgb(`, `rgba(`, `hsl(`, `hsla(`, `oklch(` — ham renk fonksiyonları (token tanımları hariç) |
| **tw-black-white** | `text-white`, `bg-black`, `border-white`, `border-black` |
| **overlay-hardcode** | `bg-black/10`, `bg-black/20`, … `bg-black/90` — overlay için token kullanılmalı (`bg-overlay`, `bg-overlay-strong`) |

`node_modules`, `.next`, `dist`, `build` dizinleri taranmaz.

---

## Nasıl çalıştırılır?

```bash
pnpm design:audit
```

veya

```bash
npm run design:audit
```

- **Exit 0:** Hiç eşleşme yok; design guardrails geçti.
- **Exit 1:** En az bir dosyada eşleşme var; çıktıda `dosya:satır [kural] satır kesiti` yazar. Ya ilgili yeri semantic token’a çevirin ya da gerçekten bilinçli istisnaysa allowlist’e ekleyin.

---

## İstisna (allowlist)

Bazı dosyalar **bilinçli** hardcode içerir; script bu dosyaları atlar ve raporlamaz.

| Dosya | Neden istisna |
|-------|-----------------|
| `src/app/globals.css` | Token tanımları (`:root`, `.dark`) — tüm renkler burada `oklch(...)` vb. ile tanımlı. |
| `src/components/brand/nandd-logo.tsx` | Logo drop-shadow: `rgba(0,0,0,0.08)` ile görsel filtre; token ile ifade edilmediği için dokümanda allowed. |

Yeni bir **bilinçli** istisna eklemek için:

1. Neden istisna olduğunu dokümante edin (örn. [docs/01-design-rules.md](01-design-rules.md) “İstisna” bölümü).
2. `scripts/design-audit.mjs` içindeki `ALLOWLIST` dizisine dosya yolunu ekleyin (repo köküne göre, örn. `src/components/brand/nandd-logo.tsx`). Slash’ler `/` olmalı.

---

## CI / Release öncesi

Release veya PR merge öncesi önerilen sıra:

1. `pnpm design:audit` → exit 0
2. `pnpm lint` → exit 0
3. `pnpm build` → exit 0

Hepsi temiz olmalı.
