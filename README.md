# WhatsApp-OpenAI Integration POC

## 🎯 Amaç

Bu proje, WhatsApp üzerinden gelen metin mesajlarını alıp OpenAI API'sine ileterek otomatik yanıt üreten bir Proof of Concept (POC) uygulamasıdır.

**Temel Özellikler:**
- WhatsApp Web.js ile WhatsApp entegrasyonu
- Gelen mesajları OpenAI'ye yönlendirme
- Konuşma bağlamını (context) koruma
- Rate limiting ile spam koruması
- Detaylı loglama
- Session yönetimi (tekrar QR taramaya gerek kalmaz)

**Kullanım Senaryosu:**
Kullanıcı WhatsApp'tan bot numarasına mesaj gönderir → Bot mesajı alır → OpenAI'den yanıt ister → Yanıtı aynı konuşmaya gönderir.

---

## 📦 Kurulum

### Gereksinimler
- **Node.js**: v18.0.0 veya üzeri
- **npm**: v8.0.0 veya üzeri
- **OpenAI API Key**: [OpenAI Platform](https://platform.openai.com/api-keys)
- **WhatsApp Hesabı**: Bot olarak kullanılacak aktif bir WhatsApp hesabı

### Adımlar

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Environment dosyasını oluşturun:**
```bash
cp .env.example .env
```

3. **.env dosyasını yapılandırın** (aşağıdaki formata bakın)

4. **Logs klasörünü oluşturun:**
```bash
mkdir logs
```

---

## 🔐 .env Formatı

Proje kök dizininde `.env` dosyası oluşturun ve aşağıdaki değişkenleri doldurun:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=500
OPENAI_TEMPERATURE=0.7

# Session Management
SESSION_PATH=./.wwebjs_auth

# Rate Limiting
RATE_LIMIT_MAX_MESSAGES=5
RATE_LIMIT_WINDOW_MS=60000

# Memory & Context
MAX_CONTEXT_MESSAGES=10
MEMORY_CLEANUP_INTERVAL_MS=3600000

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log

# System Behavior
BOT_RESPONSE_TIMEOUT_MS=30000
```

**Önemli Notlar:**
- `OPENAI_API_KEY`: OpenAI Dashboard'dan alınmalı
- `RATE_LIMIT_MAX_MESSAGES`: Dakika başına maksimum mesaj sayısı
- `MAX_CONTEXT_MESSAGES`: Her konuşma için saklanacak mesaj sayısı
- `LOG_LEVEL`: debug, info, warn, error seçenekleri

---

## 🚀 Çalıştırma

### Development Mode (Auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Session Temizleme (QR'ı sıfırlamak için)
```bash
npm run clean
```

### Log İzleme
```bash
npm run logs
```

---

## 📱 QR Kod ile WhatsApp Bağlama

1. **Uygulamayı başlatın:**
```bash
npm start
```

2. **Terminal'de QR kod görünecektir** (ilk çalıştırmada)

3. **WhatsApp uygulamanızda:**
   - Ayarlar → Bağlı Cihazlar
   - "Cihaz Bağla" seçeneğine tıklayın
   - Terminal'deki QR kodu tarayın

4. **Başarılı bağlantı mesajı gelecektir:**
   ```
   ✅ WhatsApp Client is ready!
   ```

5. **Sonraki çalıştırmalarda** QR kod taramanıza gerek kalmaz (session saklanır)

**Not:** Session bozulursa veya QR'ı sıfırlamak istiyorsanız `npm run clean` komutunu kullanın.

---

## 🧪 Test Senaryoları

### Test 1: Basit Mesaj-Cevap
**Adımlar:**
1. WhatsApp'tan bot numarasına "Merhaba" gönderin
2. Bot OpenAI'den yanıt alıp göndermelidir
3. Yanıt süresi ~5-10 saniye olmalıdır

**Beklenen Sonuç:** Bot anlamlı bir cevap döndürür

---

### Test 2: Konuşma Bağlamı (Context)
**Adımlar:**
1. "Benim adım Ali" gönderin
2. Bot yanıt versin
3. "Benim adım nedir?" diye sorun

**Beklenen Sonuç:** Bot önceki mesajı hatırlayıp "Ali" diye cevap vermeli

---

### Test 3: Rate Limiting
**Adımlar:**
1. Dakika içinde 6+ mesaj gönderin (RATE_LIMIT_MAX_MESSAGES=5 ise)
2. 6. mesajda rate limit uyarısı almalısınız

**Beklenen Sonuç:** "Çok hızlı mesaj gönderiyorsunuz, lütfen bekleyin" benzeri mesaj

---

### Test 4: Hata Durumu (API Failure)
**Adımlar:**
1. .env'den `OPENAI_API_KEY`'i geçersiz yapın
2. Mesaj gönderin

**Beklenen Sonuç:** "Şu anda yanıt veremiyorum, lütfen daha sonra tekrar deneyin" mesajı

---

### Test 5: Uzun Konuşma (Memory Cleanup)
**Adımlar:**
1. 15+ mesaj gönderin (MAX_CONTEXT_MESSAGES=10 ise)
2. İlk mesajlarla ilgili soru sorun

**Beklenen Sonuç:** Bot eski mesajları unutmalı (sadece son 10'u hatırlar)

---

### Test 6: Session Kalıcılığı
**Adımlar:**
1. Uygulamayı başlatın ve QR kodu tarayın
2. Uygulamayı kapatın
3. Yeniden başlatın

**Beklenen Sonuç:** QR kod taramasına gerek kalmadan bağlanmalı

---

## 🛠️ Sorun Giderme

### Problem: QR Kod Görünmüyor
**Çözüm:**
- Terminal'in QR kod görüntüleyebilecek bir font kullandığından emin olun
- `qrcode-terminal` paketi yüklü mü kontrol edin
- Session klasörünü temizleyin: `npm run clean`

---

### Problem: "OPENAI_API_KEY is not defined"
**Çözüm:**
- `.env` dosyası proje kök dizininde mi?
- API key doğru kopyalandı mı?
- Uygulamayı yeniden başlatın

---

### Problem: "Rate limit exceeded" (OpenAI tarafından)
**Çözüm:**
- OpenAI hesabınızın limitlerini kontrol edin
- `OPENAI_MAX_TOKENS` değerini düşürün
- Daha ucuz model kullanın: `gpt-3.5-turbo`

---

### Problem: Session sürekli kopuyor
**Çözüm:**
- `.wwebjs_auth` klasörü yazılabilir mi kontrol edin
- WhatsApp Web'de "Tüm cihazları çıkart" yapıp yeniden bağlanın
- WhatsApp uygulamanızı güncelleyin

---

### Problem: Bot yanıt vermiyor
**Çözüm:**
- Logları kontrol edin: `npm run logs` veya `logs/error.log`
- OpenAI API durumunu kontrol edin: [status.openai.com](https://status.openai.com)
- Network bağlantısını test edin

---

## ⚠️ Riskler & En İyi Uygulamalar

### Riskler

**1. WhatsApp Hesap Bani**
- WhatsApp resmi olarak bot kullanımını desteklemez
- Spam/otomatik mesaj tespiti olabilir
- **Önlem:** Ana numaranızı kullanmayın, test numarası edinin

**2. API Maliyetleri**
- OpenAI API'si ücretlidir
- Spam saldırılarında maliyet artabilir
- **Önlem:** Rate limiting, token limitleri, budget alerts

**3. Gizlilik & Güvenlik**
- Tüm mesajlar OpenAI'ye gönderilir
- Kişisel bilgiler loglanabilir
- **Önlem:** Hassas bilgileri filtreleme, GDPR uyumluluğu

**4. Session Güvenliği**
- `.wwebjs_auth` klasörü WhatsApp erişimi sağlar
- **Önlem:** Klasörü .gitignore'a ekleyin, sunucuda şifreleyin

---

### En İyi Uygulamalar

✅ **Production'da:**
- Environment değişkenlerini güvenli yönetin (AWS Secrets Manager, Azure Key Vault)
- Rate limiting'i sıkı tutun
- Log rotation ekleyin (Winston transports)
- Health check endpoint ekleyin
- Graceful shutdown implement edin

✅ **Güvenlik:**
- `.env` dosyasını asla commit etmeyin
- API keylerini düzenli olarak rotate edin
- Hassas bilgileri loglamayın
- HTTPS/TLS kullanın (production için)

✅ **Performans:**
- OpenAI timeout süresini makul tutun (30s)
- Memory cleanup'ı düzenli yapın
- Dead session'ları temizleyin
- Asenkron işlemleri paralelleştirin

✅ **Monitoring:**
- Log aggregation (ELK, Datadog)
- Error tracking (Sentry)
- API usage monitoring
- Uptime monitoring

---

## ✅ Acceptance Criteria

POC'nin başarılı sayılması için minimum gereksinimler:

- [ ] **Temel Fonksiyon:** WhatsApp'tan gelen mesaja OpenAI ile yanıt verilebiliyor
- [ ] **QR Authentication:** İlk çalıştırmada QR kod ile bağlanılabiliyor
- [ ] **Session Persistence:** Yeniden başlatmada QR kod gerekmeden bağlanılıyor
- [ ] **Context Memory:** Bot son N mesajı hatırlıyor
- [ ] **Rate Limiting:** Spam koruması çalışıyor
- [ ] **Error Handling:** API hataları kullanıcıya nazikçe bildiriliyor
- [ ] **Logging:** Tüm işlemler log dosyasına kaydediliyor
- [ ] **Configuration:** Tüm kritik değerler .env'den ayarlanabiliyor
- [ ] **Documentation:** README ile proje kolayca kurulup çalıştırılabiliyor
- [ ] **Clean Exit:** CTRL+C ile uygulama düzgün kapanıyor (graceful shutdown)

**Bonus Kriterler:**
- [ ] Mesaj gönderme durumu göstergesi (typing indicator)
- [ ] Multi-user desteği (farklı kullanıcılar aynı anda yazabilir)
- [ ] Komut sistemi (örn: `/reset` ile context temizleme)
- [ ] Medya mesajları için otomatik yanıt ("Sadece metin mesajlarına cevap verebiliyorum")

---

## 📋 Handoff Check-List

Projeyi başka bir geliştiriciye devretmeden önce kontrol edin:

### Kod & Yapı
- [ ] Tüm dosyalar commit edildi (`.env` hariç)
- [ ] `package.json` bağımlılıkları güncel
- [ ] Klasör yapısı README'de açıklandığı gibi
- [ ] Kod içi yorumlar kritik noktalarda mevcut
- [ ] Error handling tüm async işlemlerde yapılmış

### Dokümantasyon
- [ ] README tüm adımları içeriyor
- [ ] `.env.example` dosyası mevcut ve güncel
- [ ] Test senaryoları dokümante edilmiş
- [ ] Known issues/limitations belirtilmiş
- [ ] API endpoint'leri (varsa) dokümante edilmiş

### Güvenlik
- [ ] `.gitignore` hassas dosyaları kapsıyor
- [ ] API keyleri hardcode edilmemiş
- [ ] Rate limiting aktif
- [ ] Session dosyaları güvenli konumda
- [ ] Dependency vulnerability taraması yapılmış (`npm audit`)

### Test & Monitoring
- [ ] Tüm test senaryoları çalıştırılmış ve geçmiş
- [ ] Log dosyaları okunabilir formatta
- [ ] Error logları ayrı dosyada
- [ ] Graceful shutdown test edilmiş
- [ ] Memory leak kontrolü yapılmış (uzun süre çalıştırma)

### Ortam & Deployment
- [ ] Development ve production ayırımı yapılmış (varsa)
- [ ] Environment değişkenleri dokümante edilmiş
- [ ] Sistem gereksinimleri (Node version, OS) belirtilmiş
- [ ] Port çakışması riski değerlendirilmiş
- [ ] Backup/restore prosedürü düşünülmüş (session için)

### Knowledge Transfer
- [ ] Mimari kararlar açıklanmış
- [ ] Third-party servis hesap bilgileri paylaşılmış (güvenli şekilde)
- [ ] Bilinen limitasyonlar belirtilmiş
- [ ] İyileştirme önerileri listelenmiş
- [ ] İletişim kanalları (support, escalation) belirlenmiş

---

## 📞 Destek & Katkı

**İletişim:** [Your Contact Info]

**Katkı Kuralları:**
- Branch isimlendirme: `feature/your-feature` veya `fix/bug-description`
- Commit mesajları anlamlı olmalı
- Pull request'ler test edilmiş olmalı

---

## 📄 Lisans

ISC License - Bu bir POC projesidir, üretim kullanımı için uygun değildir.

---

**Son Güncelleme:** 2025-10-03

