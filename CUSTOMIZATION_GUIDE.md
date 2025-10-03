# 🎨 Bot Kişiselleştirme Rehberi

## 1. Bot Kişiliğini Değiştirme

### Dosya: `src/llm/openaiClient.js` (Satır 20-22)

**Mevcut:**
```javascript
const SYSTEM_PROMPT = `Sen yardımcı bir asistansın. Türkçe konuşuyorsun. 
Cevaplarını kısa, net ve öz tut...`;
```

**Örnekler:**

### Komik Bot
```javascript
const SYSTEM_PROMPT = `Sen komik bir asistansın 😄 
Her cevabına mizah katarsın ama yardımcı olmayı ihmal etmezsin.`;
```

### Profesyonel İş Asistanı
```javascript
const SYSTEM_PROMPT = `Sen kurumsal bir müşteri hizmetleri asistanısın. 
Resmi bir dil kullanır, detaylı ve nazik cevaplar verirsin.`;
```

### Teknik Uzman
```javascript
const SYSTEM_PROMPT = `Sen bir yazılım geliştirme uzmanısın. 
Kod örnekleri ve teknik detaylar vererek soruları yanıtlarsın.`;
```

---

## 2. AI Modelini Değiştirme

### Dosya: `.env` (Satır 2)

```env
# Hızlı ve ucuz
OPENAI_MODEL=gpt-3.5-turbo

# Daha akıllı (pahalı)
OPENAI_MODEL=gpt-4

# En yeni ve hızlı
OPENAI_MODEL=gpt-4-turbo-preview
```

---

## 3. Cevap Uzunluğu & Yaratıcılık

### Dosya: `.env` (Satır 4-5)

```env
# Kısa cevaplar
OPENAI_MAX_TOKENS=500

# Uzun, detaylı cevaplar
OPENAI_MAX_TOKENS=2000

# Yaratıcılık: 0 (tutarlı) - 1 (yaratıcı)
OPENAI_TEMPERATURE=0.7
```

---

## 4. Bot Mesajlarını Özelleştirme

### Dosya: `src/config/constants.js` (Satır 46-50)

```javascript
MESSAGES: {
  RATE_LIMIT_EXCEEDED: '🚫 Yavaş ol dostum!',
  ERROR_RESPONSE: '😅 Bir şeyler ters gitti, tekrar dene.',
  PROCESSING: '🤔 Düşünüyorum...',
}
```

---

## 5. Yeni Komutlar Ekleme

### Dosya: `src/router.js` (Satır 98'den sonra)

```javascript
// /fiyat komutu ekleyelim
if (text === '/fiyat' || text === '/price') {
  const priceInfo = `💰 *Fiyat Bilgisi*\n\n` +
    `Aylık: 99 TL\n` +
    `Yıllık: 999 TL\n\n` +
    `Detay için: /iletisim`;
  
  message.reply(priceInfo);
  return true;
}

// /iletisim komutu
if (text === '/iletisim' || text === '/contact') {
  message.reply('📧 Email: info@example.com\n📱 Tel: 0555 123 4567');
  return true;
}
```

---

## 6. Hafıza & Spam Ayarları

### Dosya: `.env` (Satır 10-14)

```env
# Daha fazla hatırlasın
MAX_CONTEXT_MESSAGES=20

# Daha az spam koruması
RATE_LIMIT_MAX_MESSAGES=10

# Daha sıkı spam koruması  
RATE_LIMIT_MAX_MESSAGES=3
RATE_LIMIT_WINDOW_MS=60000  # 1 dakika
```

---

## 7. Başlangıç Banner'ı

### Dosya: `server.js` (Satır 13-18)

```javascript
console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║      🚀 SİZİN BOTUNUZUN ADI                   ║
║      v2.0.0 - Powered by AI                   ║
║                                               ║
╚═══════════════════════════════════════════════╝
`);
```

---

## 🎯 Hızlı Başlangıç Senaryoları

### Senaryo 1: Müşteri Hizmetleri Botu

1. `src/llm/openaiClient.js`: Profesyonel ton
2. `.env`: `OPENAI_MAX_TOKENS=1000` (detaylı cevaplar)
3. `src/router.js`: `/sikca-sorulan`, `/destek` komutları ekle

### Senaryo 2: Eğlence Botu

1. `src/llm/openaiClient.js`: Komik kişilik
2. `.env`: `OPENAI_TEMPERATURE=0.9` (yaratıcı)
3. `src/router.js`: `/espri`, `/bilmece` komutları ekle

### Senaryo 3: Teknik Destek

1. `src/llm/openaiClient.js`: Teknik uzman
2. `.env`: `OPENAI_MODEL=gpt-4` (daha akıllı)
3. `src/router.js`: `/dokuman`, `/kod` komutları ekle

---

## 💡 İpuçları

- Değişiklik yaptıktan sonra botu yeniden başlatın: `npm start`
- Test ederken `.env`'deki `LOG_LEVEL=debug` yapın
- GPT-4 pahalıdır, önce GPT-3.5 ile test edin
- System prompt'u kısa ve net tutun (daha iyi sonuç)

---

**Son Güncelleme:** 2025-10-03

