require('dotenv').config();
const createServer = require('./src/server');
const whatsappClient = require('./src/whatsapp/client');

// Çevre değişkenlerini kontrol et
const requiredEnvVars = ['PORT', 'API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('✗ HATA: Gerekli çevre değişkenleri eksik:', missingEnvVars.join(', '));
  console.error('Lütfen .env dosyasını oluşturun ve gerekli değişkenleri tanımlayın.');
  console.error('Örnek için env.example dosyasına bakın.');
  process.exit(1);
}

// Port ayarı
const PORT = process.env.PORT || 3000;

// Express sunucusunu oluştur
const app = createServer();

// Sunucuyu başlat
const server = app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🚀 WhatsApp API Servisi Başlatıldı');
  console.log('========================================');
  console.log(`📡 Sunucu çalışıyor: http://localhost:${PORT}`);
  console.log(`🔑 API Key: ${process.env.API_KEY.substring(0, 4)}***`);
  console.log('========================================\n');

  // WhatsApp istemcisini başlat
  console.log('WhatsApp istemcisi başlatılıyor...\n');
  whatsappClient.initialize();
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\n\nSunucu kapatılıyor...');
  
  // HTTP sunucusunu kapat
  server.close(() => {
    console.log('✓ HTTP sunucusu kapatıldı');
  });

  // WhatsApp istemcisini kapat
  try {
    await whatsappClient.destroy();
    console.log('✓ WhatsApp istemcisi kapatıldı');
  } catch (error) {
    console.error('WhatsApp istemcisi kapatılırken hata:', error.message);
  }

  console.log('Uygulama sonlandırıldı.');
  process.exit(0);
};

// Signal handler'ları
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Hata handler'ları
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown();
});

