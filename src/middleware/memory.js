/**
 * Memory Middleware
 * Konuşma geçmişini (context) yönetir
 */

import { CONSTANTS } from '../config/constants.js';
import { log } from '../utils/logger.js';

// Konuşma geçmişini saklar: { chatId: [{role, content, timestamp}] }
const conversationMemory = new Map();

/**
 * Konuşma geçmişini ekler
 */
export function addToMemory(chatId, role, content) {
  if (!conversationMemory.has(chatId)) {
    conversationMemory.set(chatId, []);
  }

  const conversation = conversationMemory.get(chatId);
  conversation.push({
    role,
    content,
    timestamp: Date.now(),
  });

  // Max context limit kontrolü
  if (conversation.length > CONSTANTS.MEMORY.MAX_CONTEXT_MESSAGES * 2) {
    // Her mesaj user+assistant olduğu için *2
    const removed = conversation.shift();
    log.debug(`Memory limit reached for ${chatId}, removed oldest message`, { removed });
  }

  log.debug(`Added to memory: ${chatId} [${role}]`, { contentLength: content.length });
}

/**
 * Konuşma geçmişini OpenAI formatında döndürür
 */
export function getContext(chatId) {
  const conversation = conversationMemory.get(chatId) || [];
  
  // Son N mesaj çifti (user + assistant)
  const maxMessages = CONSTANTS.MEMORY.MAX_CONTEXT_MESSAGES * 2;
  const recentMessages = conversation.slice(-maxMessages);

  // OpenAI formatına dönüştür
  return recentMessages.map(({ role, content }) => ({
    role,
    content,
  }));
}

/**
 * Belirli bir konuşma geçmişini temizler
 */
export function clearMemory(chatId) {
  if (conversationMemory.has(chatId)) {
    conversationMemory.delete(chatId);
    log.info(`Memory cleared for chat: ${chatId}`);
    return true;
  }
  return false;
}

/**
 * Tüm hafızayı temizler
 */
export function clearAllMemory() {
  const count = conversationMemory.size;
  conversationMemory.clear();
  log.info(`All memory cleared. Removed ${count} conversations`);
  return count;
}

/**
 * Eski konuşmaları temizler (cleanup job)
 */
export function cleanupOldConversations() {
  const now = Date.now();
  const maxAge = CONSTANTS.MEMORY.CLEANUP_INTERVAL_MS;
  let cleaned = 0;

  for (const [chatId, conversation] of conversationMemory.entries()) {
    if (conversation.length === 0) {
      conversationMemory.delete(chatId);
      cleaned++;
      continue;
    }

    // Son mesaj çok eskiyse konuşmayı sil
    const lastMessage = conversation[conversation.length - 1];
    if (now - lastMessage.timestamp > maxAge) {
      conversationMemory.delete(chatId);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    log.info(`Cleanup: Removed ${cleaned} old conversations`);
  }

  return cleaned;
}

/**
 * Memory durumunu döndürür (debug için)
 */
export function getMemoryStats() {
  return {
    totalConversations: conversationMemory.size,
    conversations: Array.from(conversationMemory.entries()).map(([chatId, messages]) => ({
      chatId,
      messageCount: messages.length,
      lastActivity: messages[messages.length - 1]?.timestamp || null,
    })),
  };
}

// Periyodik cleanup başlat
setInterval(() => {
  cleanupOldConversations();
}, CONSTANTS.MEMORY.CLEANUP_INTERVAL_MS);

log.info(`Memory module initialized. Cleanup interval: ${CONSTANTS.MEMORY.CLEANUP_INTERVAL_MS}ms`);

