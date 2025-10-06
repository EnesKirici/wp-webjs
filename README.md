# WhatsApp API - Mesaj Gönderme Servisi

WhatsApp-web.js tabanlı, Node.js üzerinde çalışan profesyonel bir mesaj gönderme API'si. LocalAuth ile oturum yönetimi sağlar ve REST API üzerinden WhatsApp mesajı göndermenizi sağlar.

## 🚀 Özellikler

- ✅ WhatsApp-web.js ile güvenilir mesajlaşma
- ✅ LocalAuth ile kalıcı oturum yönetimi (QR kodu sadece ilk seferde)
- ✅ REST API ile kolay entegrasyon
- ✅ API Key ile güvenli erişim
- ✅ Rate limiting (dakikada 10 istek)
- ✅ Girdi doğrulama ve hata yönetimi
- ✅ Otomatik yeniden bağlanma
- ✅ Headless mod (sunucu ortamında çalışabilir)
- ✅ Detaylı log sistemi

## 📋 Gereksinimler

- Node.js (LTS sürüm önerilir, v16+)
- npm veya yarn
- WhatsApp hesabı
- Telefon (QR kod tarama için)

## 🛠️ Kurulum

### 1. Projeyi klonlayın veya dosyaları indirin

```bash
cd wb-webjs
```

### 2. Bağımlılıkları yükleyin

```bash
npm install
```

### 3. Çevre değişkenlerini yapılandırın

`env.example` dosyasını `.env` olarak kopyalayın:

```bash
cp env.example .env
```

`.env` dosyasını düzenleyin:

```env
# Sunucu portu
PORT=3000

# API güvenlik anahtarı 
API_KEY=#

# Rate limit ayarları
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```

**ÖNEMLİ:** `API_KEY` değerini güçlü bir şifre ile değiştirin!

## 🚀 Çalıştırma

### Geliştirme Modu (Nodemon ile otomatik yeniden başlatma)

```bash
npm run dev
```

### Üretim Modu

```bash
npm start
```

### PM2 ile Çalıştırma (Önerilir)

PM2 henüz yüklü değilse:

```bash
npm install -g pm2
```

Uygulamayı başlatın:

```bash
pm2 start index.js --name whatsapp-api
pm2 save
pm2 startup
```

PM2 komutları:

```bash
pm2 status              # Durum kontrolü
pm2 logs whatsapp-api   # Logları görüntüle
pm2 restart whatsapp-api # Yeniden başlat
pm2 stop whatsapp-api   # Durdur
```

## 📱 İlk Çalıştırma - QR Kod Tarama

İlk kez çalıştırdığınızda terminalde bir QR kod görünecektir:

1. WhatsApp uygulamanızı açın
2. Ayarlar > Bağlı Cihazlar > Cihaz Bağla
3. Terminaldeki QR kodu telefonunuzla tarayın
4. "WhatsApp client is ready!" mesajını görene kadar bekleyin

✅ **Oturum bilgileri `sessions/` klasöründe saklanır. Bir sonraki başlatmada QR kod gerekmez!**

## 📚 API Kullanımı

### Base URL

```
http://localhost:3000
```

### Endpoints

#### 1. Health Check (Durum Kontrolü)

**Endpoint:** `GET /api/health`

**Açıklama:** Servisin durumunu ve WhatsApp istemcisinin hazır olup olmadığını kontrol eder.

**Örnek İstek:**

```bash
curl http://localhost:3000/api/health
```

**Örnek Yanıt:**

```json
{
  "status": "ok",
  "ready": true,
  "initializing": false,
  "timestamp": "2025-10-06T12:00:00.000Z"
}
```

#### 2. Mesaj Gönderme

**Endpoint:** `POST /api/send`

**Headers:**
- `x-api-key`: API anahtarınız (.env dosyasındaki API_KEY)
- `Content-Type`: application/json

**Request Body:**

```json
{
  "phone": "905551234567",
  "message": "Merhaba! Bu bir test mesajıdır."
}
```

**Parametreler:**

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| phone | string | ✅ | Uluslararası format, sadece rakam (10-15 hane). Örnek: 905551234567 |
| message | string | ✅ | Gönderilecek mesaj (1-1000 karakter) |

**Başarılı Yanıt (200 OK):**

```json
{
  "success": true,
  "messageId": "true_905551234567@c.us_3EB0XXXXXXXXXXXX",
  "to": "905551234567",
  "timestamp": 1728217200
}
```

**Hata Yanıtları:**

| Durum Kodu | Açıklama | Örnek |
|------------|----------|-------|
| 400 | Geçersiz istek | `{"error": "Geçersiz telefon formatı"}` |
| 401 | Yetkilendirme hatası | `{"error": "API anahtarı geçersiz"}` |
| 429 | Rate limit aşıldı | `{"error": "Çok fazla istek gönderildi"}` |
| 503 | WhatsApp hazır değil | `{"error": "WhatsApp istemcisi hazır değil"}` |
| 500 | Sunucu hatası | `{"error": "Mesaj gönderilemedi"}` |

### cURL Örnekleri

#### Mesaj Gönderme

```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -H "x-api-key: gizli_anahtar_buraya" \
  -d '{
    "phone": "905551234567",
    "message": "Merhaba! Bu bir test mesajıdır."
  }'
```

#### PowerShell (Windows)

```powershell
$headers = @{
    "Content-Type" = "application/json"
    "x-api-key" = "gizli_anahtar_buraya"
}

$body = @{
    phone = "905551234567"
    message = "Merhaba! Bu bir test mesajıdır."
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/send" -Method Post -Headers $headers -Body $body
```

### Postman Kullanımı

1. **Method:** POST
2. **URL:** `http://localhost:3000/api/send`
3. **Headers:**
   - Key: `x-api-key`, Value: `gizli_anahtar_buraya`
   - Key: `Content-Type`, Value: `application/json`
4. **Body (raw JSON):**
   ```json
   {
     "phone": "905551234567",
     "message": "Test mesajı"
   }
   ```

## 📂 Klasör Yapısı

```
wb-webjs/
├── src/
│   ├── whatsapp/
│   │   └── client.js          # WhatsApp istemci yönetimi
│   ├── middleware/
│   │   ├── auth.js            # API key doğrulama
│   │   ├── rateLimit.js       # Rate limiting
│   │   └── validation.js      # Girdi doğrulama
│   ├── routes/
│   │   └── api.js             # API route'ları
│   └── server.js              # Express server yapılandırması
├── sessions/                   # WhatsApp oturum verileri (otomatik oluşur)
├── .env                        # Çevre değişkenleri (manuel oluşturun)
├── .gitignore
├── env.example                 # Örnek çevre değişkenleri
├── index.js                    # Ana giriş noktası
├── package.json
└── README.md
```

## 🔒 Güvenlik

### API Anahtarı

- API anahtarınızı **asla** paylaşmayın
- Güçlü, rastgele bir anahtar kullanın
- Production ortamında düzenli olarak değiştirin
- `.env` dosyasını **asla** git'e eklemeyin

### Rate Limiting

Varsayılan olarak dakikada 10 istek sınırı vardır. Bu sınırı `.env` dosyasından değiştirebilirsiniz:

```env
RATE_LIMIT_WINDOW_MS=60000      # 60 saniye
RATE_LIMIT_MAX_REQUESTS=10       # Maksimum 10 istek
```

### HTTPS Kullanımı

Production ortamında mutlaka HTTPS kullanın. Nginx veya Caddy ile reverse proxy oluşturabilirsiniz.

## 🐛 Hata Ayıklama

### WhatsApp istemcisi bağlanamıyor

1. `sessions/` klasörünü silin ve yeniden QR kod tarayın
2. Node.js ve bağımlılıkları güncelleyin
3. Chromium'un yüklendiğinden emin olun

### QR kod tarandı ama "ready" olmuyor

- İnternet bağlantınızı kontrol edin
- Telefonunuzun internete bağlı olduğundan emin olun
- Uygulamayı yeniden başlatın

### Rate limit sorunu

`.env` dosyasında `RATE_LIMIT_MAX_REQUESTS` değerini artırın (dikkatli kullanın)

### Mesaj gönderilmiyor

- Numaranın WhatsApp'ta kayıtlı olduğundan emin olun
- Telefon numarası formatını kontrol edin (sadece rakam, + yok)
- WhatsApp istemcisinin "ready" durumunda olduğunu `/api/health` ile kontrol edin

## 📝 Log Örnekleri

### Başarılı Başlatma

```
========================================
🚀 WhatsApp API Servisi Başlatıldı
========================================
📡 Sunucu çalışıyor: http://localhost:3000
🔑 API Key: gizl***
========================================

WhatsApp istemcisi başlatılıyor...

✓ Kimlik doğrulama başarılı!

✓ WhatsApp client is ready!
========================================
```

### Başarılı Mesaj Gönderimi

```
[2025-10-06T12:00:00.000Z] POST /api/send
✓ Mesaj gönderildi: 905551234567
```

## ⚠️ Önemli Notlar

1. **WhatsApp Terms of Service:** Bu API'yi spam veya izinsiz mesajlaşma için kullanmayın. WhatsApp kullanım şartlarına uygun kullanın.

2. **Rate Limiting:** WhatsApp tarafından spam olarak algılanmamak için mesaj gönderme hızınızı kontrol edin.

3. **Oturum Yönetimi:** `sessions/` klasörünü düzenli olarak yedekleyin. Silinirse yeniden QR kod taramanız gerekir.

4. **Production Kullanımı:** 
   - PM2 veya benzeri bir process manager kullanın
   - HTTPS kullanın
   - Firewall kurallarını yapılandırın
   - Düzenli log takibi yapın

5. **Performans:** Yoğun kullanımlarda mesaj kuyruğu sistemi eklemeyi düşünün (Redis, Bull vs.)

## 🤝 Destek

Sorun yaşarsanız:

1. Logları kontrol edin
2. `.env` dosyanızı doğrulayın
3. Bağımlılıkları güncelleyin: `npm update`
4. `sessions/` klasörünü silin ve yeniden deneyin

## 📄 Lisans

ISC

## 🔄 Versiyon

v1.0.0

---

**Not:** Bu proje eğitim ve öğrenme amaçlıdır. Ticari kullanımda WhatsApp Business API'yi kullanmanız önerilir.

