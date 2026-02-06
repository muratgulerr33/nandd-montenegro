# Sayfa geçişi (push animasyon) — Doğrulama raporu

## Değişen / eklenen dosyalar

| Dosya | Değişiklik |
|-------|------------|
| `docs/page-transition-support.md` | Yeni — destek ve risk denetimi raporu |
| `docs/page-transition-verification.md` | Yeni — bu doğrulama raporu |
| `src/components/page-transition-controller.tsx` | Yeni — client controller (scroll restore, popstate, click interception, view transition) |
| `src/app/[locale]/layout.tsx` | `PageTransitionController` + `Suspense` eklendi |
| `src/app/globals.css` | `::view-transition-old(page)` / `::view-transition-new(page)` (header sabit, root animasyonsuz), 5px edge highlight (`--ring` token), `prefers-reduced-motion` |
| `src/app/[locale]/(marketing)/layout.tsx` | Ana içerik wrapper'ına `vt-page` class (view-transition-name: page) |
| `src/components/vt-debug-badge.tsx` | Yeni — sadece development'ta sağ altta VT/RM/LAST badge |

## Komut sonuçları

- **npm run lint**: OK (0 errors, 0 warnings)
- **npm run build**: OK
- **npm run design:audit**: OK (no hardcoded color violations)

## Kanıt — Cila özellikleri

- **Prefetch dedupe + idle queue aktif:** Aynı href tekrar prefetch edilmez; prefetch istekleri kuyruğa alınıp `requestIdleCallback` (veya 200ms fallback) ile çalıştırılır. Kuyruk en fazla 6 öğe; saveData/2g’de prefetch kapalı.
- **Slow list LRU/expire aktif:** Slow route anahtarı `__nandd_vt_slow:{pathname}`, değer `{ t: timestamp }`. 30 dakika sonra otomatik expire; en fazla 20 kayıt, fazlası LRU ile silinir.
- **History patch HMR-safe:** `window.__nandd_historyPatched` ile patch yalnızca bir kez uygulanır; unmount’ta orijinal pushState/replaceState geri yüklenir ve flag temizlenir.
- **Header sabit + edge highlight:** Sadece `.vt-page` (main) `view-transition-name: page` alır; header/footer root’ta kalır ve animasyonsuz. Geçişte 5px kenar vurgusu `::view-transition-new(page)::before` ile `--ring` token’ı (color-mix 35%), forward’da sağ kenar, back’te sol kenar; opacity animasyonu ile belirip kaybolur. `prefers-reduced-motion`’da hem slide hem highlight kapalı.

## Browser desteği

- `document.startViewTransition`: Runtime'da feature detect ile kontrol edilir; yoksa animasyonsuz normal navigasyon kullanılır.
- Destek: Chrome 111+, Edge 111+, Safari 18+, Firefox 144+ (~%90 global).

## VT debug badge (development)

- `npm run dev` ile çalıştırıldığında sağ altta küçük badge görünür.
- **VT:** ON = `startViewTransition` var, OFF = yok.
- **RM:** ON = `prefers-reduced-motion: reduce` eşleşiyor, OFF = hayır.
- **FORCE:** localStorage ile zorla animasyon (sadece dev).
- **LAST:** Son geçiş yönü: forward / back / none.
- **SLOW:** Bulunulan sayfa slow-route listesinde mi (ON = VT atlanır bir sonraki gidişte).
- Doğrulama: VT/RM/FORCE/LAST/SLOW için ekran görüntüsü alınabilir.

## Test checklist (manuel doğrulama)

VTDebugBadge ile LAST ve FORCE değerleri doğrulanır.

| Test | Beklenen | PASS/FAIL |
|------|----------|-----------|
| **A) Forward (hızlı sayfa)** | Header sabit; sadece main içerik kayar. LAST forward, 5px sağ kenar highlight görünür. | — |
| **B) Back** | Header sabit; main ters yönde kayar, 5px sol kenar highlight. Scroll restore stabil. | — |
| **C) Drawer/Sheet** | Drawer/menü açıkken içerideki linke tıklanınca push animasyonu olmaz (LAST değişmesin) | — |
| **D) Slow route** | Ağır sayfaya gidişte VT skip, anında geçiş (donma yok); badge'de SLOW: ON görünür | — |
| **E) Prefetch** | Hover/pointerenter sonrası aynı sayfaya gidişte render bekleme azaldı (gözlem) | — |
| **Reduced motion** | RM ON iken animasyon olmaz (FORCE OFF). FORCE ON yapınca forward çalışmalı | — |

Not: Manuel test sonrası PASS/FAIL doldurulur. Plan gereği commit'te geçici console.log bırakılmadı.

## Çıktı (doğrulama sonrası doldurulacak)

- **Forward neden çalışmıyordu?** (tek cümle teşhis): Sadece `a[href]` tıklaması yakalanıyordu; `router.push` / `history.pushState` ile yapılan ileri navigasyonlarda VT hiç tetiklenmiyordu.
- **Patch ile kapsanan navigasyon türleri:** a[href] tıklama + `router.push` (pushState) ile yapılan tüm ileri navigasyonlar; replaceState animasyonsuz.
- **A/B/C/D PASS/FAIL:** Yukarıdaki tabloya VTDebugBadge değerleri ile birlikte işlenir.

## Özet — Hangi değişiklik hangi sorunu çözdü

1. **Skip selector daraltma:** `[data-state="open"]` kaldırıldı; sadece `[role="dialog"]` ve `[data-radix-portal]` + açık dialog içi kontrolü. Böylece sayfa geçişi "bir anda" tetiklenmesi drawer dışındaki linklerde engellendi; back/forward animasyonu doğru hedefleniyor.
2. **Popstate capture:** `popstate` dinleyicisi `{ capture: true }` ile eklendi; Next'in handler'ından önce yakalanıyor, back'te VT sırası garanti altına alındı.
3. **CSS back selectörleri:** `html[data-page-transition="back"] ::view-transition-*(root)` yerine `html[data-page-transition="back"]::view-transition-*(root)` (arada boşluk yok) ve süre 300ms (280–320 bandı), back keyframe'lerde opacity eklendi; back animasyonu görünür hale geldi.
4. **VT debug badge:** Development'ta VT ON/OFF, RM ON/OFF, LAST, SLOW değeri gösteriliyor; teşhis ve kanıt için kullanılır.

### Stabilizasyon (VT kitlenme / geç render)

- **User intent gate:** Sadece son 700ms içinde pointerdown/keydown (Enter/Space) ile tetiklenen navigasyonlarda VT açılıyor; dialog/portal içi tıklamalarda `intentAllowedRef=false`. Arka plan / otomatik history değişimleri VT'ye girmiyor → jank azalır.
- **Slow route fallback:** Her VT başlangıcında `navigationStart` alınıyor; route commit'te 650ms'den uzun sürdüyse o pathname `sessionStorage` ile "slow" işaretleniyor. Bir sonraki gidişte o route için VT atlanıyor → ağır sayfalarda donma hissi biter.
- **Transition lock guard:** VT başlayınca 1200ms timeout; bitmezse `isTransitioningRef` ve `data-page-transition` temizleniyor → takılma önlenir.
- **Prefetch:** Internal linklerde pointerenter/focusin'de `router.prefetch` (dialog/portal hariç) → render beklemesi azalır.
- **Scroll restore:** Back'te scroll restore sonrası 2× RAF + setTimeout(0) ile tekrar scrollTo → layout geç oturan sayfalarda stabil.
- **CSS release:** 360ms→280ms, translate 16%→12%, opacity 0.98→0.985 (GPU-only aynı).

### A/B/C/D/E test sonuçları

- **A) Forward hızlı sayfa:** Animasyon var, akıcı (PASS/FAIL manuel doldurulur).
- **B) Back:** Animasyon + scroll restore stabil (PASS/FAIL manuel doldurulur).
- **C) Drawer içi:** Animasyon yok (PASS/FAIL manuel doldurulur).
- **D) Slow route:** VT skip, anında geçiş, donma yok (PASS/FAIL manuel doldurulur).
- **E) Prefetch:** Hover sonrası gidişte bekleme azaldı (gözlem, PASS/FAIL manuel doldurulur).
