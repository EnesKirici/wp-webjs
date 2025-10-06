/**
 * Mesaj gönderme isteğini doğrular
 */
const validateSendMessage = (req, res, next) => {
  const { phone, message } = req.body;

  // Phone kontrolü
  if (!phone) {
    return res.status(400).json({
      error: 'Telefon numarası gerekli'
    });
  }

  // Phone formatı kontrolü (sadece rakamlar, 10-15 hane arası)
  const phoneRegex = /^\d{10,15}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      error: 'Geçersiz telefon formatı. Sadece rakam kullanın (10-15 hane). Örnek: 905551234567'
    });
  }

  // Message kontrolü
  if (!message) {
    return res.status(400).json({
      error: 'Mesaj boş olamaz'
    });
  }

  // Message tipi kontrolü
  if (typeof message !== 'string') {
    return res.status(400).json({
      error: 'Mesaj string tipinde olmalıdır'
    });
  }

  // Message uzunluk kontrolü
  const trimmedMessage = message.trim();
  if (trimmedMessage.length === 0) {
    return res.status(400).json({
      error: 'Mesaj boş olamaz'
    });
  }

  if (trimmedMessage.length > 1000) {
    return res.status(400).json({
      error: 'Mesaj çok uzun. Maksimum 1000 karakter kullanabilirsiniz'
    });
  }

  // Doğrulama başarılı, temizlenmiş mesajı kaydet
  req.body.message = trimmedMessage;

  next();
};

module.exports = {
  validateSendMessage
};

