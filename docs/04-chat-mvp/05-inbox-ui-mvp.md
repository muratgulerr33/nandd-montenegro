# Inbox UI MVP — Bottom Nav, Settings, Pagination, Test Push

Bu doküman Admin Inbox MVP arayüzünü tanımlar: bottom navigation, ayarlar sekmesi, konuşma listesi sayfalama ve test push.

## Bottom navigation (tab’lar)

- **Ziyaretçiler** — Yakında (devre dışı, placeholder).
- **Inbox** — Aktif; konuşma listesi + mesajlar.
- **Aramalar** — Yakında (devre dışı).
- **Quick WP** — Yakında (devre dışı).
- **Ayarlar** — Aktif; DND, bildirim modu, profil, Push Test.

Devre dışı tab’lara tıklanınca tek bir “Yakında” placeholder ekranı gösterilir. UI: shadcn + token disiplini (hardcode renk yok), mevcut tipografi kurallarına uyum.

## Pagination (konuşma listesi)

- **Kural:** 10 konuşma / sayfa.
- **API:** `GET /api/chat/admin/conversations?cursor=...&limit=10`
  - Sıralama: `last_message_at desc`, sonra `id desc`.
  - Cursor: base64 JSON `{ lastMessageAt, id }` ile sonraki sayfa.
  - Yanıt: `{ items, nextCursor }`.
- **UI:** “Daha fazla yükle” butonu; `nextCursor` varsa gösterilir, tıklanınca sonraki sayfa eklenir.
- Okundu/okunmadı MVP’de yok (V2’ye bırakıldı).

## Settings (MVP alanları)

- **Durum** — Yakında (devre dışı).
- **Sohbeti Aç/Kapat (DND)** — Toggle; `admin_settings.dnd_enabled`. GET/POST `/api/chat/admin/settings`, `x-admin-secret` zorunlu.
- **Hesap ayarları** — Yakında (devre dışı).
- **Bildirim ayarları** — `notify_mode`: “Sadece ilk mesaj” / “Her mesaj” / “Sessiz”; DB’ye yazılır.
- **Push Test** — Buton; `POST /api/chat/admin/test-push` ile aktif cihazlara test push. Yanıt: `{ ok, ms, sentCount, failedCount }`; UI’da sonuç badge (yeşil/kırmızı) + süre.
- **Profil** — Ad/soyad (ve isteğe bağlı avatar URL metin). Avatar yükleme V2.

## Veritabanı

- **admin_settings** (tek satır, id=1): `dnd_enabled`, `notify_mode` (enum: first_message, every_message, silent), `first_name`, `last_name`, `avatar_url`, `updated_at`.

## Mobil shell (Capacitor)

- WebView mevcut inbox URL’ine gider; UI değişiklikleri otomatik yansır.
- Push register akışı aynı kalır.
- **MIUI / pil:** Ayarlar → Uygulamalar → NANDD Inbox → Pil tasarrufu: Kısıtlama yok.
- **Push Test nerede:** Bottom nav → Ayarlar → “Push Test” kartındaki “Test Push Gönder” butonu.

## Test adımları (PR)

1. **Build:** `npm run build` hatasız tamamlanmalı.
2. **Dev + Inbox:** `npm run dev` ile uygulamayı aç; `/[locale]/inbox?key=ADMIN_INBOX_SECRET` ile inbox sayfasına git. Bottom nav görünmeli; Inbox ve Ayarlar sekmeleri çalışmalı.
3. **Pagination:** Inbox’ta 10’dan fazla konuşma varsa “Daha fazla yükle” çıkmalı; tıklanınca sonraki sayfa eklenmeli.
4. **Ayarlar:** Ayarlar sekmesinde DND toggle ve bildirim modu (Sadece ilk mesaj / Her mesaj / Sessiz) değiştirilip kaydedilmeli; profil ad/soyad alanları kaydedilmeli.
5. **Push Test:** Ayarlar → Push Test → “Test Push Gönder” tıklandığında aktif cihazlara test bildirimi gitmeli; UI’da sonuç (yeşil/kırmızı badge + süre) görünmeli.
6. **Yakında sekmeleri:** Ziyaretçiler, Aramalar, Quick WP sekmelerine tıklanınca sadece “Yakında” placeholder görünmeli, hata olmamalı.
