/**
 * WhatsApp Client Service
 * WhatsApp Web.js entegrasyonu
 */

import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { log } from '../utils/logger.js';
import { CONSTANTS } from '../config/constants.js';
import { ensureSessionDirectory, hasSession } from './sessionStore.js';

let client = null;
let isReady = false;
let messageHandler = null;

/**
 * WhatsApp client'ı başlatır
 * 
 * @param {Function} onMessage - Mesaj geldiğinde çağrılacak callback
 */
export async function initializeClient(onMessage) {
  if (client) {
    log.warn('WhatsApp client already initialized');
    return client;
  }

  messageHandler = onMessage;

  // Session klasörünü hazırla
  ensureSessionDirectory();

  log.info('Initializing WhatsApp client...');

  // Client oluştur
  client = new Client({
    authStrategy: new LocalAuth({
      clientId: 'whatsapp-openai-bot',
      dataPath: CONSTANTS.SESSION.PATH,
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
        '--disable-gpu',
      ],
    },
  });

  // Event handlers
  setupEventHandlers();

  // Client'ı başlat
  await client.initialize();

  return client;
}

/**
 * Event handler'ları ayarla
 */
function setupEventHandlers() {
  // QR kod
  client.on('qr', (qr) => {
    log.info('QR Code received. Please scan with WhatsApp:');
    console.log('\n');
    qrcode.generate(qr, { small: true });
    console.log('\n');
    log.info('Scan the QR code above with your WhatsApp app');
  });

  // Authenticated
  client.on('authenticated', () => {
    log.info('✅ WhatsApp authenticated successfully');
  });

  // Auth failure
  client.on('auth_failure', (error) => {
    log.error('❌ WhatsApp authentication failed', error);
  });

  // Ready
  client.on('ready', () => {
    isReady = true;
    log.info('🚀 WhatsApp Client is ready!');
    log.info('You can now send messages to the bot');
  });

  // Mesaj geldiğinde
  client.on('message', async (message) => {
    try {
      // Kendi mesajlarını ignore et
      if (message.fromMe) {
        return;
      }

      log.info(`📨 Message received from ${message.from}`, {
        body: message.body.substring(0, 100),
      });

      // Mesaj handler'ı çağır
      if (messageHandler) {
        await messageHandler(message);
      }
    } catch (error) {
      log.error('Error handling message', error);
    }
  });

  // Bağlantı koptu
  client.on('disconnected', (reason) => {
    isReady = false;
    log.warn('WhatsApp client disconnected', { reason });
  });

  // Loading screen
  client.on('loading_screen', (percent, message) => {
    log.debug(`Loading WhatsApp: ${percent}% - ${message}`);
  });
}

/**
 * Client hazır mı?
 */
export function isClientReady() {
  return isReady && client !== null;
}

/**
 * Client'ı al
 */
export function getClient() {
  return client;
}

/**
 * Client'ı kapat (graceful shutdown)
 */
export async function destroyClient() {
  if (client) {
    log.info('Destroying WhatsApp client...');
    await client.destroy();
    client = null;
    isReady = false;
    log.info('WhatsApp client destroyed');
  }
}

log.info('WhatsApp client module loaded');

