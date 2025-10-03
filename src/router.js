/**
 * Message Router
 * Gelen mesajları yönlendirir ve OpenAI ile yanıt üretir
 */

import { askLLM } from './llm/openaiClient.js';
import { checkRateLimit } from './middleware/rateLimit.js';
import { addToMemory, getContext } from './middleware/memory.js';
import { log } from './utils/logger.js';
import { CONSTANTS } from './config/constants.js';

/**
 * Gelen mesajı işler ve yanıt gönderir
 * 
 * @param {Object} message - WhatsApp message object
 */
export async function handleMessage(message) {
  const chatId = message.from;
  const userMessage = message.body.trim();

  // Boş mesajları ignore et
  if (!userMessage) {
    log.debug(`Empty message from ${chatId}, ignoring`);
    return;
  }

  try {
    // 1. Rate limit kontrolü
    const rateLimitResult = checkRateLimit(chatId);
    
    if (!rateLimitResult.allowed) {
      const retryMessage = `${CONSTANTS.MESSAGES.RATE_LIMIT_EXCEEDED}\n⏱️ ${rateLimitResult.retryAfter} saniye sonra tekrar deneyin.`;
      await message.reply(retryMessage);
      log.warn(`Rate limit exceeded for ${chatId}`);
      return;
    }

    // 2. Kullanıcı mesajını memory'e ekle
    addToMemory(chatId, 'user', userMessage);

    // 3. Typing indicator (mesaj yazıyor göstergesi)
    await message.getChat().then(chat => chat.sendStateTyping());

    // 4. Context'i al (konuşma geçmişi)
    const context = getContext(chatId);

    log.info(`Processing message from ${chatId}`, {
      message: userMessage,
      messageLength: userMessage.length,
      contextLength: context.length,
    });

    // 5. OpenAI'ye gönder
    const aiResponse = await askLLM({ messages: context });

    // 6. Yanıtı gönder
    await message.reply(aiResponse);

    // 7. AI yanıtını memory'e ekle
    addToMemory(chatId, 'assistant', aiResponse);

    log.info(`Response sent to ${chatId}`, {
      response: aiResponse,
      responseLength: aiResponse.length,
    });

  } catch (error) {
    log.error(`Error processing message from ${chatId}`, error);

    // Kullanıcıya hata mesajı gönder
    try {
      await message.reply(CONSTANTS.MESSAGES.ERROR_RESPONSE);
    } catch (replyError) {
      log.error('Failed to send error message to user', replyError);
    }
  }
}

/**
 * Özel komutları işler (/reset, /help vb.)
 * @param {Object} message - WhatsApp message object
 * @returns {boolean} - Komut işlendiyse true
 */
export function handleCommand(message) {
  const text = message.body.trim().toLowerCase();

  // /help komutu
  if (text === '/help' || text === '/yardim') {
    const helpMessage = `🤖 *WhatsApp AI Bot*\n\n` +
      `Ben OpenAI ile çalışan bir asistanım. Sorularınızı cevaplayabilirim.\n\n` +
      `*Komutlar:*\n` +
      `/help - Bu yardım mesajını gösterir\n` +
      `/reset - Konuşma geçmişini sıfırlar\n\n` +
      `*Not:* Dakikada en fazla ${CONSTANTS.RATE_LIMIT.MAX_MESSAGES} mesaj gönderebilirsiniz.`;
    
    message.reply(helpMessage);
    return true;
  }

  // Diğer komutlar buraya eklenebilir

  return false;
}

log.info('Router module initialized');

