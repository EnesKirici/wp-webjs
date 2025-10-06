const express = require('express');
const router = express.Router();
const whatsappClient = require('../whatsapp/client');
const authMiddleware = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimit');
const { validateSendMessage } = require('../middleware/validation');

/**
 * GET /api/health
 * Servis durumu kontrolü
 */
router.get('/health', (req, res) => {
  const status = whatsappClient.getStatus();
  
  res.status(200).json({
    status: 'ok',
    ready: status.ready,
    initializing: status.initializing,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/send
 * WhatsApp mesaj gönderme
 * 
 * Headers:
 *   - x-api-key: API anahtarı
 * 
 * Body:
 *   - phone: Telefon numarası (örn: 905551234567)
 *   - message: Gönderilecek mesaj (1-1000 karakter)
 */
router.post('/send', 
  authMiddleware,
  rateLimiter,
  validateSendMessage,
  async (req, res) => {
    try {
      const { phone, message } = req.body;

      // WhatsApp istemcisi hazır mı kontrol et
      const status = whatsappClient.getStatus();
      if (!status.ready) {
        return res.status(503).json({
          error: 'WhatsApp istemcisi hazır değil',
          hint: status.initializing 
            ? 'İstemci başlatılıyor, lütfen bekleyin' 
            : 'İstemci bağlı değil, lütfen QR kodu tarayın veya sunucuyu yeniden başlatın'
        });
      }

      // Mesajı gönder
      const result = await whatsappClient.sendMessage(phone, message);

      // Başarılı yanıt
      res.status(200).json({
        success: true,
        messageId: result.messageId,
        to: result.to,
        timestamp: result.timestamp
      });

    } catch (error) {
      console.error('Mesaj gönderme hatası:', error.message);

      // Hata durumunu kullanıcıya ilet
      if (error.message.includes('kayıtlı değil')) {
        return res.status(400).json({
          error: 'Bu telefon numarası WhatsApp\'ta kayıtlı değil',
          phone: req.body.phone
        });
      }

      // Genel hata
      res.status(500).json({
        error: 'Mesaj gönderilemedi',
        details: error.message
      });
    }
  }
);

module.exports = router;

