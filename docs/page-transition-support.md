# Sayfa geçişi (push animasyon) — Destek ve risk denetimi

## 1) Destek

- **document.startViewTransition**: Feature detect ile kontrol edilir. Tarayıcı desteği: Chrome 111+, Edge 111+, Safari 18+, Firefox 144+ (global ~90%). Destek yoksa controller animasyonsuz normal navigasyon kullanır.
- **VT OFF:** `startViewTransition` yoksa animasyon görünmez; normal navigasyon çalışır.
- **prefers-reduced-motion: reduce**: Tespit edilir; bu durumda View Transition ve click interception devre dışı, scroll restore (isteğe bağlı) çalışabilir.
- **Dev’de force motion:** Mac’te RM ON ise animasyon görünmez (beklenen). Geliştirme sırasında test için `localStorage` ile `__nandd_force_motion=1` atanırsa animasyon zorlanır; VTDebugBadge’de FORCE: ON görünür.

## 2) Layout path

- Root layout: `src/app/[locale]/layout.tsx`
- Controller bu layout içinde (body’de) tek yerde mount edilir.

## 3) Drawer/Sheet dışlama selectörleri

Aynı-origin link tıklamalarında, **tıklanan eleman** aşağıdaki container’ların **içindeyse** sayfa geçişi animasyonu uygulanmaz (normal navigasyon kullanılır):

- `[role="dialog"]` — Radix Dialog/Sheet
- `[data-radix-portal]` — Radix portal (Sheet içeriği buraya render edilir)

Ek güvenlik: `document.querySelector('[role="dialog"][data-state="open"]')` var ve anchor onun içindeyse de SKIP. Kullanım: `anchor.closest('[role="dialog"], [data-radix-portal]')` → truthy ise SKIP; ayrıca açık dialog içindeki linkler yukarıdaki kontrolle atlanır.

**Not:** Drawer/Sheet/Dialog bileşenlerinin kendi dosya veya animasyon sınıflarına dokunulmaz; sadece bu selectörlerle “içerideki link mi?” kontrolü yapılır.

## 4) Çıktı özeti

| Madde              | Sonuç |
|--------------------|--------|
| startViewTransition | Feature detect (runtime) |
| prefers-reduced-motion | CSS + JS’te saygı |
| Layout path        | `src/app/[locale]/layout.tsx` |
| Drawer/Sheet skip  | `[role="dialog"], [data-radix-portal]` (closest) + açık dialog içi kontrolü |
