/**
 * API Key doğrulama middleware'i
 */
const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const expectedApiKey = process.env.API_KEY;

  // API key kontrolü
  if (!apiKey) {
    return res.status(401).json({
      error: 'API anahtarı eksik. x-api-key header\'ı gerekli.'
    });
  }

  if (apiKey !== expectedApiKey) {
    return res.status(401).json({
      error: 'API anahtarı geçersiz'
    });
  }

  // API key doğru, devam et
  next();
};

module.exports = authMiddleware;

