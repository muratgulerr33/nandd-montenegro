# Typography Audit — Neden shadcn daha premium? (Kanıtlı)

## Amaç
- Bizim hero H1/H2 ve shadcn docs hero H1/H2 tipografisini ölçmek (computed styles).
- Farkları kanıtla (font-weight, font-size, line-height, letter-spacing, smoothing).
- Repo'da caps/tracking/leading kaynaklarını bul (dosya+satır).

## Çıktı
- Bu dosya: `TYPOGRAPHY_REPORT.md`

---

## 1) Bizim sitede computed typography dump (kanıt)

**Yöntem:** Localhost’ta hero sayfasını aç → DevTools Elements’ta ilgili elementi seç → Console’a aşağıdaki scripti yapıştır → Çıktıyı ilgili bölüme yapıştır.

**Dump scripti (Console’da çalıştır):**
```js
(function dump(el){
  const cs = getComputedStyle(el);
  const pick = (k)=>({[k]: cs.getPropertyValue(k)});
  return {
    tag: el.tagName,
    text: (el.textContent||"").trim().slice(0,120),
    ...pick("font-family"),
    ...pick("font-size"),
    ...pick("font-weight"),
    ...pick("line-height"),
    ...pick("letter-spacing"),
    ...pick("text-transform"),
    ...pick("text-rendering"),
    ...pick("-webkit-font-smoothing"),
    ...pick("-moz-osx-font-smoothing"),
    ...pick("font-kerning"),
    ...pick("font-optical-sizing"),
    ...pick("font-variation-settings"),
    ...pick("font-feature-settings"),
  };
})($0)
```

### 1.1 Hero H1 (bizim site)
*(DevTools’ta hero H1’i seçip scripti çalıştırın, çıktıyı aşağıya yapıştırın.)*

```json
// Çıktıyı buraya yapıştır
```

### 1.2 Hero subtitle — H2 veya P (bizim site)
*(Aynı scripti hero alt başlık/subtitle elementi için çalıştırın.)*

```json
// Çıktıyı buraya yapıştır
```

---

## 2) Shadcn sitesinde aynı dump (kanıt)

**Yöntem:** ui.shadcn.com ana sayfa hero H1 (ve varsa H2/P) seç → Aynı dump scriptini çalıştır → Çıktıları aşağıya ekle.

### 2.1 Shadcn hero H1
```json
// Çıktıyı buraya yapıştır
```

### 2.2 Shadcn hero H2/P
```json
// Çıktıyı buraya yapıştır
```

---

## 3) Global smoothing A/B testi (kanıt)

Bizim sitede Console’da:

**3.1 antialiased kapat/aç**
```js
document.body.classList.toggle("antialiased")
```

**3.2 subpixel-antialiased test**
```js
document.body.classList.add("subpixel-antialiased");
document.body.classList.remove("antialiased");
```
*(H1’e bakıp farkı not edin.)*

**Eski haline döndürme:**
```js
document.body.classList.remove("subpixel-antialiased");
document.body.classList.add("antialiased");
```

### A/B gözlem notu
*(antialiased vs subpixel-antialiased farkını buraya yazın.)*

---

## 4) Repo kaynak taraması (kanıt)

### 4.1 Hero / headline / title araması
```bash
rg -n --hidden --glob '!**/.next/**' --glob '!**/node_modules/**' 'HAYALLERİNİZ|hero|headline|title' src
```

**Sonuçlar (özet):**
| Dosya | Satır | Eşleşme |
|-------|-------|---------|
| `src/app/[locale]/(marketing)/page.tsx` | 15–17, 26, 45, 49, 58, 75, 138 | heroHeading, formattedHeroHeading, subtitle, hero H1, H2'ler |
| `src/content/nandd/home.json` | 8 | `"text": "Hayalleriniz burada."` (hero başlık metni) |
| `src/app/[locale]/(marketing)/contact/page.tsx` | 14 | `h1` className |
| `src/app/[locale]/(marketing)/iletisim/page.tsx` | 14 | `h1` className |
| `src/app/[locale]/(marketing)/kurumsal/page.tsx` | 20, 32, 44 | `h1`, `h2` |
| `src/app/[locale]/(marketing)/projeler/page.tsx` | 23 | `h1` |
| `src/app/[locale]/(marketing)/projeler/seafield-residences/page.tsx` | 20, 27, 41, 55 | `h1`, `h2` |
| `src/app/[locale]/(marketing)/projeler/asis-adriatic/page.tsx` | 9, 21, 27, 53, 56 | title, `h1`, `h2`, `h3` |
| `src/app/[locale]/(marketing)/styleguide/page.tsx` | 18, 33, 41–45, 50, 62, 75, 87, 105 | Headings / Body / Cards vb. |
| Diğer | çeşitli | data-slot title, layout title, card-title vb. |

### 4.2 uppercase / tracking / leading / font-weight araması
```bash
rg -n --hidden --glob '!**/.next/**' --glob '!**/node_modules/**' 'uppercase|tracking-|leading-|font-(bold|extrabold|black|semibold)' src
```

**Sonuçlar (özet):**
- **Hero H1 (ana sayfa):** `src/app/[locale]/(marketing)/page.tsx` **satır 45**  
  - `className="font-sans text-3xl md:text-5xl font-bold tracking-tight leading-[1.05]"`  
  - Yani: **font-bold**, **tracking-tight**, **leading-[1.05]** doğrudan bu satırdan geliyor.
- **Uppercase:** Repo’da hero H1’de `uppercase` yok; metin büyük harfleri `src/content/nandd/home.json` içindeki `"HAYALLERİNİZ Burada!"` string’inden geliyor.
- **tracking-** kullanımları: `page.tsx` (tracking-tight), `contact/page.tsx`, `iletisim/page.tsx`, `kurumsal/page.tsx`, `projeler/*`, `styleguide/page.tsx`, `design-client.tsx`; bir yerde `tracking-widest` (dropdown-menu).
- **leading-** kullanımları: `page.tsx` leading-[1.05], `design-client.tsx` leading-relaxed, `locale-drawer.tsx` leading-none, `ui/card.tsx` leading-none, `ui/label.tsx` leading-none.
- **font-semibold / font-bold:** Birçok sayfa ve component’te (site-header, mobile-nav, footer, card, drawer, sheet, styleguide, design-client).

### 4.3 Hero H1 className kaynağı (kanıt)
- **Dosya:** [src/app/[locale]/(marketing)/page.tsx](src/app/[locale]/(marketing)/page.tsx)  
- **Satır:** 45  
- **Tam satır (Fix2 sonrası):**
  ```tsx
  <h1 className="font-sans text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02] [text-wrap:balance]">
  ```
- **Global tipografi:** `body` için [src/app/globals.css](src/app/globals.css) satır 127: `@apply ... antialiased font-sans;` → tüm sitede **antialiased** ve **font-sans** uygulanıyor.

---

## 5) Sonuç özeti (kanıta dayalı)

### 5.1 Bizim H1 vs shadcn H1 — fark tablosu
*(Computed dump’lar yapıştırıldıktan sonra doldurulacak.)*

| Özellik | Bizim hero H1 | Shadcn hero H1 |
|---------|----------------|----------------|
| font-size | *(dump’tan)* | *(dump’tan)* |
| font-weight | 700 (font-bold) | *(dump’tan)* |
| line-height | 1.05 (leading-[1.05]) | *(dump’tan)* |
| letter-spacing | tracking-tight | *(dump’tan)* |
| -webkit-font-smoothing | *(dump’tan)* | *(dump’tan)* |
| text-rendering | *(dump’tan)* | *(dump’tan)* |

### 5.2 Premium hissi düşüren 1–3 ana sebep (kanıt referanslı)
*(Dump ve A/B sonuçlarına göre doldurulacak. Şimdilik repo kanıtına göre olasılıklar:)*
1. **Smoothing:** Body’de `antialiased` var; subpixel-antialiased ile A/B’de fark belirginse, smoothing premium hissi etkiliyor olabilir.
2. **Leading / tracking:** Hero’da `leading-[1.05]` çok sıkı; shadcn genelde daha gevşek leading kullanır. `tracking-tight` de shadcn ile farklı olabilir.
3. **Font-weight / boyut:** Bold + büyük boyut bazen “ağır” hissettirir; shadcn’de semibold veya farklı scale kullanılıyor olabilir.

### 5.3 Fix hedefleri (kod yazılmadan, sadece hedef listesi)
- [ ] Computed dump’lar tamamlandıktan sonra: H1 için font-weight / line-height / letter-spacing değerlerini shadcn’e yaklaştır.
- [ ] A/B’de subpixel-antialiased daha iyi hissedilirse: `antialiased` kullanımını (veya sadece hero’yu) gözden geçir.
- [ ] “HAYALLERİNİZ” caps kalacaksa: Sadece weight/leading/tracking/smoothing ile premium hissi artır; metin içeriğine dokunma.
- [ ] Diğer sayfa H1’leri (contact, kurumsal, projeler) aynı token’lara (örn. tipografi bileşeni veya CSS değişkeni) taşı; tek yerden yönet.

---

## 6) Fix2 (Hero premium) sonrası — dump alanları
*(Localhost'ta hero alanını kontrol edin; DevTools'ta H1 ve subtitle seçip dump scriptini çalıştırın; aşağıdaki 4 bloğa yapıştırın. A/B notu: bizim H1 vs shadcn H1 karşılaştırması.)*

- Hero metni: **"Hayalleriniz burada."** (sentence-case). H1: `font-semibold`, `leading-[1.02]`, `[text-wrap:balance]`, `text-4xl md:text-6xl`.

### Fix2 sonrası — Bizim site Hero H1
```json
// Dump çıktısını buraya yapıştır
```

### Fix2 sonrası — Bizim site Hero subtitle (P)
```json
// Dump çıktısını buraya yapıştır
```

### Fix2 karşılaştırma — Shadcn hero H1
```json
// Dump çıktısını buraya yapıştır
```

### Fix2 karşılaştırma — Shadcn hero subtitle
```json
// Dump çıktısını buraya yapıştır
```

### A/B notu (Fix2)
*(Dump'lar yapıştırıldıktan sonra fark tablosu / özet buraya.)*

---

## 7) Bitince
- Bu dosya (`TYPOGRAPHY_REPORT.md`) ilgili kişiye iletilecek.
- Dump'lar ve A/B notu eklendikten sonra "5) Sonuç özeti" güncellenebilir.
