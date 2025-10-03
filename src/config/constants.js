/**
 * Application Constants
 * Merkezi yapılandırma sabitleri
 */

import dotenv from 'dotenv';
dotenv.config();

export const CONSTANTS = {
  // OpenAI Configuration
  OPENAI: {
    MODEL: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    MAX_TOKENS: parseInt(process.env.OPENAI_MAX_TOKENS) || 500,
    TEMPERATURE: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
  },

  // Rate Limiting
  RATE_LIMIT: {
    MAX_MESSAGES: parseInt(process.env.RATE_LIMIT_MAX_MESSAGES) || 5,
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 dakika
  },

  // Memory & Context
  MEMORY: {
    MAX_CONTEXT_MESSAGES: parseInt(process.env.MAX_CONTEXT_MESSAGES) || 10,
    CLEANUP_INTERVAL_MS: parseInt(process.env.MEMORY_CLEANUP_INTERVAL_MS) || 3600000, // 1 saat
  },

  // Timeouts
  TIMEOUTS: {
    BOT_RESPONSE_MS: parseInt(process.env.BOT_RESPONSE_TIMEOUT_MS) || 30000,
  },

  // Session
  SESSION: {
    PATH: process.env.SESSION_PATH || './.wwebjs_auth',
  },

  // Logging
  LOGGING: {
    LEVEL: process.env.LOG_LEVEL || 'info',
    FILE_PATH: process.env.LOG_FILE_PATH || './logs/app.log',
  },

  // Messages
  MESSAGES: {
    RATE_LIMIT_EXCEEDED: '⏳ Çok hızlı mesaj gönderiyorsunuz. Lütfen biraz bekleyin.',
    ERROR_RESPONSE: '😔 Şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.',
    PROCESSING: '⏳ Yanıtınızı hazırlıyorum...',
  },
};

export default CONSTANTS;

