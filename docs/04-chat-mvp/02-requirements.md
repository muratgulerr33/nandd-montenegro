# Chat MVP — Gereksinimler

## Functional

- **Guest:** Chat drawer’dan mesaj gönderir; mesajları görür. Üyelik gerekmez.
- **Admin:** Inbox’ta konuşma listesi, konuşma detayı ve yanıt (reply) yazar.
- **Push:** Guest yeni mesaj attığında admin cihaz(lar)a push bildirimi gider.
- **Mesaj durumu (MVP):** Sadece “okundu/okunmadı” opsiyonel; yoksa da olur.

## Non-functional

- **Spam/abuse:** Rate limit (IP + visitorId); basit captcha yok (MVP), minimum throttle şart.
- **Güvenlik:** Admin inbox erişimi MVP’de secret token / basic auth ile korunacak (login sistemi yok).
- **UI:** Token disiplinine uy (hardcode renk yok); `.t-*` typography kullan.
- **i18n:** TR/EN; MVP’de Inbox başlıkları TR olabilir, locale yapısı bozulmamalı.
