/**
 * Rate Limit Middleware
 * Kullanıcı bazlı mesaj rate limiting (spam koruması)
 */

import { CONSTANTS } from '../config/constants.js';
import { log } from '../utils/logger.js';

// Kullanıcı mesaj geçmişi: { chatId: [timestamp1, timestamp2, ...] }
const userMessageHistory = new Map();

/**
 * Rate limit kontrolü yapar
 * 
 * @param {string} chatId - Kullanıcı/chat ID'si
 * @returns {Object} { allowed: boolean, remaining: number, retryAfter: number }
 */
export function checkRateLimit(chatId) {
  const now = Date.now();
  const windowMs = CONSTANTS.RATE_LIMIT.WINDOW_MS;
  const maxMessages = CONSTANTS.RATE_LIMIT.MAX_MESSAGES;

  // Kullanıcının mesaj geçmişini al
  if (!userMessageHistory.has(chatId)) {
    userMessageHistory.set(chatId, []);
  }

  const messageTimestamps = userMessageHistory.get(chatId);

  // Eski mesajları temizle (window dışındakiler)
  const validTimestamps = messageTimestamps.filter(
    timestamp => now - timestamp < windowMs
  );

  // Güncelle
  userMessageHistory.set(chatId, validTimestamps);

  // Rate limit kontrolü
  if (validTimestamps.length >= maxMessages) {
    const oldestTimestamp = validTimestamps[0];
    const retryAfter = Math.ceil((windowMs - (now - oldestTimestamp)) / 1000); // saniye

    log.warn(`Rate limit exceeded for ${chatId}`, {
      messageCount: validTimestamps.length,
      retryAfter,
    });

    return {
      allowed: false,
      remaining: 0,
      retryAfter,
    };
  }

  // Mesajı geçmişe ekle
  validTimestamps.push(now);
  userMessageHistory.set(chatId, validTimestamps);

  const remaining = maxMessages - validTimestamps.length;

  log.debug(`Rate limit check passed for ${chatId}`, {
    used: validTimestamps.length,
    remaining,
  });

  return {
    allowed: true,
    remaining,
    retryAfter: 0,
  };
}

/**
 * Belirli bir kullanıcının rate limit'ini sıfırlar
 */
export function resetRateLimit(chatId) {
  if (userMessageHistory.has(chatId)) {
    userMessageHistory.delete(chatId);
    log.info(`Rate limit reset for ${chatId}`);
    return true;
  }
  return false;
}

/**
 * Tüm rate limit'leri temizler
 */
export function clearAllRateLimits() {
  const count = userMessageHistory.size;
  userMessageHistory.clear();
  log.info(`All rate limits cleared. Removed ${count} users`);
  return count;
}

/**
 * Eski kullanıcıları temizle (cleanup job)
 */
export function cleanupOldRateLimits() {
  const now = Date.now();
  const maxAge = CONSTANTS.RATE_LIMIT.WINDOW_MS * 2; // 2x window
  let cleaned = 0;

  for (const [chatId, timestamps] of userMessageHistory.entries()) {
    if (timestamps.length === 0) {
      userMessageHistory.delete(chatId);
      cleaned++;
      continue;
    }

    const lastTimestamp = timestamps[timestamps.length - 1];
    if (now - lastTimestamp > maxAge) {
      userMessageHistory.delete(chatId);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    log.debug(`Rate limit cleanup: Removed ${cleaned} inactive users`);
  }

  return cleaned;
}

/**
 * Rate limit durumunu döndürür (debug için)
 */
export function getRateLimitStats() {
  return {
    totalUsers: userMessageHistory.size,
    users: Array.from(userMessageHistory.entries()).map(([chatId, timestamps]) => ({
      chatId,
      messageCount: timestamps.length,
      lastMessage: timestamps[timestamps.length - 1] || null,
    })),
  };
}

// Periyodik cleanup
setInterval(() => {
  cleanupOldRateLimits();
}, CONSTANTS.RATE_LIMIT.WINDOW_MS * 2);

log.info(`Rate limit module initialized. Max: ${CONSTANTS.RATE_LIMIT.MAX_MESSAGES} messages per ${CONSTANTS.RATE_LIMIT.WINDOW_MS}ms`);

