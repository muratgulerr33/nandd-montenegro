# QA: Inbox ses bildirimi ve guest balon metin rengi

Bu dokümanda admin panelinde “Her mesaj” modunda sesin her yeni mesajda çalması ve guest (outgoing) balonda light theme’de metnin beyaz kalması için manuel test prosedürü yer alır.

## Ses bildirimi (every_message)

### Ön koşul
- Admin ayarlarında: DND kapalı, Inbox sesi açık, bildirim modu **“Her mesaj”**.
- İsteğe bağlı debug: Tarayıcı konsolunda `localStorage.setItem("debugInboxSound","1")` yapıp sayfayı yenileyin. Konsolda tek satır JSON log ve Ayarlar sekmesinde “Debug: Last sound played at …” satırı görünür.

### Adımlar

1. Admin panelinde **Inbox listesini** açık tutun; **konuşma detay ekranı açık olmasın** (liste görünümünde kalın).
2. Sayfada **bir kez tıklayın** (audio unlock için).
3. Terminalden:
   - Yeni bir konuşma oluşturup **1. mesajı** guest olarak gönderin.
   - Aynı konuşmaya **mark-read yapmadan 2. mesajı** gönderin.
4. **Beklenen:**
   - `notifyMode=every_message` ise **2. mesajda da** ses çalar.
   - Debug açıksa konsolda `candidates` içinde `new_message_while_unread` ve `played: true` görünür.

Bu senaryo “mesaj geldiğinde ses gelmiyor” hatasının giderildiğini kanıtlamak için kullanılır.

## Guest outgoing balon (light theme metin rengi)

- Light theme’de guest (sağdaki, mavi) balon içindeki metin **beyaz** olmalıdır.
- Dark theme’de de mavi balon + beyaz yazı aynı kalmalıdır.
- Sadece outgoing (guest) balon etkilenmeli; incoming (admin) balon stilinde değişiklik olmamalıdır.
