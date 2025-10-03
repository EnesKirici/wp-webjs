/**
 * WhatsApp-OpenAI Bot
 * Main Entry Point
 */

import { initializeClient, destroyClient } from './src/services/whatsappClient.js';
import { handleMessage, handleCommand } from './src/router.js';
import { log } from './src/utils/logger.js';
import { getSessionInfo } from './src/services/sessionStore.js';
import { CONSTANTS } from './src/config/constants.js';

// ASCII Art Banner
console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║      WhatsApp × OpenAI Bot                    ║
║      POC - v1.0.0                             ║
║                                               ║
╚═══════════════════════════════════════════════╝
`);

/**
 * Ana başlatma fonksiyonu
 */
async function main() {
  try {
    log.info('Starting WhatsApp-OpenAI Bot...');

    // Environment kontrolü
    if (!process.env.OPENAI_API_KEY) {
      log.error('❌ OPENAI_API_KEY is not set in .env file');
      log.error('Please create a .env file and add your OpenAI API key');
      process.exit(1);
    }

    // Session bilgisi
    const sessionInfo = getSessionInfo();
    if (sessionInfo.exists) {
      log.info('✅ Existing session found, will attempt to reuse it');
    } else {
      log.info('📱 No session found, QR code will be displayed');
    }

    // Yapılandırma bilgisi
    log.info('Configuration:', {
      model: CONSTANTS.OPENAI.MODEL,
      maxTokens: CONSTANTS.OPENAI.MAX_TOKENS,
      rateLimit: `${CONSTANTS.RATE_LIMIT.MAX_MESSAGES} messages per ${CONSTANTS.RATE_LIMIT.WINDOW_MS / 1000}s`,
      maxContext: CONSTANTS.MEMORY.MAX_CONTEXT_MESSAGES,
    });

    // WhatsApp client'ı başlat
    await initializeClient(async (message) => {
      // Komut mu kontrol et
      if (handleCommand(message)) {
        return;
      }

      // Normal mesaj işle
      await handleMessage(message);
    });

    log.info('✨ Bot is running! Send a message to your WhatsApp number to test.');

  } catch (error) {
    log.error('Failed to start bot', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
async function shutdown(signal) {
  log.info(`${signal} received, shutting down gracefully...`);

  try {
    await destroyClient();
    log.info('✅ Shutdown complete');
    process.exit(0);
  } catch (error) {
    log.error('Error during shutdown', error);
    process.exit(1);
  }
}

// Signal handlers
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error);
  shutdown('UNCAUGHT_EXCEPTION');
});

// Start the bot
main();

