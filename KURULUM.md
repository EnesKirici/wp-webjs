# Hızlı Kurulum Rehberi

## 1. Bağımlılıkları Yükleyin

```bash
npm install
```

## 2. Çevre Değişkenlerini Ayarlayın

```bash
# Windows (PowerShell)
Copy-Item env.example .env

# Linux/Mac
cp env.example .env
```

`.env` dosyasını düzenleyin ve `API_KEY` değerini değiştirin:

```env
PORT=3000
API_KEY=gizli_super_anahtar_123
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```

## 3. Uygulamayı Başlatın

```bash
npm start
```

## 4. QR Kod Tarama

Terminal'de görünen QR kodu WhatsApp uygulamanızla tarayın:
- WhatsApp > Ayarlar > Bağlı Cihazlar > Cihaz Bağla

## 5. Test Edin

Başka bir terminal penceresi açıp test isteği gönderin:

```bash
curl -X POST http://localhost:3000/api/send ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: gizli_super_anahtar_123" ^
  -d "{\"phone\": \"905551234567\", \"message\": \"Test mesajı\"}"
```

**Not:** Telefon numarasını kendi numaranızla değiştirin!

## Sorun mu yaşıyorsunuz?

### QR kod görünmüyor
- Terminali tam ekran yapın
- Konsolun font boyutunu küçültün

### "WhatsApp istemcisi hazır değil" hatası
- `GET http://localhost:3000/api/health` ile durumu kontrol edin
- "ready: true" olana kadar bekleyin

### Mesaj gönderilmiyor
- Telefon numarasının WhatsApp'ta kayıtlı olduğundan emin olun
- Numara formatını kontrol edin (+ işareti olmadan, sadece rakam)
- Örnek: 905551234567 (Türkiye için)

## PM2 ile Çalıştırma (Önerilen)

```bash
npm install -g pm2
pm2 start index.js --name whatsapp-api
pm2 save
pm2 logs whatsapp-api
```

Başarılar! 🚀

