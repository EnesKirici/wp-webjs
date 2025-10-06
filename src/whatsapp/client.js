const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

class WhatsAppClient {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.isInitializing = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000; // 5 saniye
  }

  /**
   * WhatsApp istemcisini başlatır
   */
  initialize() {
    if (this.isInitializing) {
      console.log('WhatsApp istemcisi zaten başlatılıyor...');
      return;
    }

    this.isInitializing = true;
    console.log('WhatsApp istemcisi başlatılıyor...');

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: './sessions'
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    this.setupEventHandlers();
    this.client.initialize();
  }

  /**
   * Event handler'ları ayarlar
   */
  setupEventHandlers() {
    // QR kod oluşturulduğunda
    this.client.on('qr', (qr) => {
      console.log('\n========================================');
      console.log('QR KODU TARANMASI GEREKİYOR:');
      console.log('========================================\n');
      qrcode.generate(qr, { small: true });
      console.log('\n========================================');
      console.log('WhatsApp uygulamanızdan bu QR kodu tarayın');
      console.log('========================================\n');
    });

    // Kimlik doğrulama başarılı
    this.client.on('authenticated', () => {
      console.log('✓ Kimlik doğrulama başarılı!');
      this.reconnectAttempts = 0; // Başarılı bağlantıda sayacı sıfırla
    });

    // Kimlik doğrulama hatası
    this.client.on('auth_failure', (msg) => {
      console.error('✗ Kimlik doğrulama hatası:', msg);
      this.isReady = false;
      this.isInitializing = false;
      
      // Yeniden bağlanmayı dene
      this.scheduleReconnect();
    });

    // İstemci hazır
    this.client.on('ready', () => {
      console.log('\n✓ WhatsApp client is ready!');
      console.log('========================================\n');
      this.isReady = true;
      this.isInitializing = false;
      this.reconnectAttempts = 0;
    });

    // Bağlantı koptuğunda
    this.client.on('disconnected', (reason) => {
      console.log('✗ WhatsApp bağlantısı koptu. Sebep:', reason);
      this.isReady = false;
      this.isInitializing = false;
      
      // Yeniden bağlanmayı dene
      this.scheduleReconnect();
    });

    // Mesaj gönderme hatası
    this.client.on('message_create', () => {
      // Bu event'i sadece loglama için dinliyoruz
    });

    // Loading ekranı (opsiyonel)
    this.client.on('loading_screen', (percent, message) => {
      console.log(`Yükleniyor: ${percent}% - ${message}`);
    });
  }

  /**
   * Yeniden bağlanmayı planlar
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`✗ Maksimum yeniden bağlanma denemesi (${this.maxReconnectAttempts}) aşıldı.`);
      console.error('Lütfen uygulamayı manuel olarak yeniden başlatın.');
      return;
    }

    this.reconnectAttempts++;
    console.log(`⟳ ${this.reconnectDelay / 1000} saniye sonra yeniden bağlanma denemesi ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);

    setTimeout(() => {
      console.log('Yeniden başlatılıyor...');
      this.initialize();
    }, this.reconnectDelay);
  }

  /**
   * Mesaj gönderir
   * @param {string} phoneNumber - Telefon numarası (örn: 905551234567)
   * @param {string} message - Gönderilecek mesaj
   * @returns {Promise<Object>} - Mesaj bilgileri
   */
  async sendMessage(phoneNumber, message) {
    if (!this.isReady) {
      throw new Error('WhatsApp istemcisi hazır değil');
    }

    try {
      // Telefon numarasını WhatsApp formatına çevir (chatId)
      const chatId = `${phoneNumber}@c.us`;
      
      // Numaranın kayıtlı olup olmadığını kontrol et
      const isRegistered = await this.client.isRegisteredUser(chatId);
      
      if (!isRegistered) {
        throw new Error('Bu telefon numarası WhatsApp\'ta kayıtlı değil');
      }

      // Mesajı gönder
      const result = await this.client.sendMessage(chatId, message);
      
      console.log(`✓ Mesaj gönderildi: ${phoneNumber}`);
      
      return {
        success: true,
        messageId: result.id._serialized,
        to: phoneNumber,
        timestamp: result.timestamp
      };
    } catch (error) {
      console.error(`✗ Mesaj gönderme hatası (${phoneNumber}):`, error.message);
      throw error;
    }
  }

  /**
   * İstemcinin hazır olup olmadığını döner
   * @returns {boolean}
   */
  getStatus() {
    return {
      ready: this.isReady,
      initializing: this.isInitializing,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * İstemciyi kapatır
   */
  async destroy() {
    if (this.client) {
      await this.client.destroy();
      this.isReady = false;
      this.isInitializing = false;
      console.log('WhatsApp istemcisi kapatıldı');
    }
  }
}

// Singleton instance
const whatsappClient = new WhatsAppClient();

module.exports = whatsappClient;

