const rateLimit = require('express-rate-limit');

/**
 * Rate limiting middleware'i
 * Dakika başına maksimum istek sayısını sınırlar
 */
const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 dakika
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10, // Maksimum 10 istek
  message: {
    error: 'Çok fazla istek gönderildi. Lütfen bir süre bekleyip tekrar deneyin.'
  },
  standardHeaders: true, // `RateLimit-*` header'ları döndür
  legacyHeaders: false, // `X-RateLimit-*` header'larını devre dışı bırak
  handler: (req, res) => {
    res.status(429).json({
      error: 'Çok fazla istek gönderildi. Lütfen bir süre bekleyip tekrar deneyin.',
      retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || 60000) / 1000)
    });
  }
});

module.exports = rateLimiter;

