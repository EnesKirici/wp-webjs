const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const apiRoutes = require('./routes/api');

/**
 * Express sunucusunu oluşturur ve yapılandırır
 */
function createServer() {
  const app = express();

  // Güvenlik middleware'leri
  app.use(helmet());
  app.use(cors());

  // Body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
  });

  // API routes
  app.use('/api', apiRoutes);

  // Ana sayfa - API bilgileri
  app.get('/', (req, res) => {
    res.json({
      name: 'WhatsApp API',
      version: '1.0.0',
      description: 'WhatsApp mesaj gönderme API servisi',
      endpoints: {
        health: 'GET /api/health',
        send: 'POST /api/send'
      },
      documentation: {
        send: {
          method: 'POST',
          path: '/api/send',
          headers: {
            'x-api-key': 'API anahtarınız',
            'Content-Type': 'application/json'
          },
          body: {
            phone: 'Telefon numarası (örn: 905551234567)',
            message: 'Gönderilecek mesaj (1-1000 karakter)'
          }
        },
        health: {
          method: 'GET',
          path: '/api/health',
          description: 'Servis durumu kontrolü'
        }
      }
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Endpoint bulunamadı',
      path: req.path,
      availableEndpoints: [
        'GET /',
        'GET /api/health',
        'POST /api/send'
      ]
    });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Sunucu hatası:', err);
    res.status(500).json({
      error: 'Sunucu hatası',
      message: err.message
    });
  });

  return app;
}

module.exports = createServer;

