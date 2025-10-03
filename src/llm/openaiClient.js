import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// OpenAI client initialization
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: parseInt(process.env.BOT_RESPONSE_TIMEOUT_MS) || 30000,
});

// Configuration with defaults
const CONFIG = {
  model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 500,
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
};

// System prompt - Türkçe, kısa ve net cevaplar
const SYSTEM_PROMPT = `Sen yardımcı bir asistansın. Türkçe konuşuyorsun. 
Cevaplarını kısa, net ve öz tut. Gereksiz detaylara girmeden doğrudan soruyu yanıtla. 
Samimi ve arkadaşça bir dil kullan ama profesyonel kal.`;

/**
 * OpenAI API'sine mesaj gönderir ve yanıt alır
 * 
 * @param {Object} params - Parametreler
 * @param {Array} params.messages - Konuşma mesajları [{role: 'user', content: '...'}]
 * @returns {Promise<string>} - LLM'den gelen yanıt metni
 * @throws {Error} - API hatası veya timeout durumunda
 */
export async function askLLM({ messages }) {
  // Validation
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages array is required and must not be empty');
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  // Sistem mesajını başa ekle
  const messagesWithSystem = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages,
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: CONFIG.model,
      messages: messagesWithSystem,
      max_tokens: CONFIG.maxTokens,
      temperature: CONFIG.temperature,
    });

    // Yanıtı çıkar
    const response = completion.choices?.[0]?.message?.content;

    if (!response) {
      throw new Error('OpenAI returned empty response');
    }

    return response.trim();

  } catch (error) {
    // Hata türüne göre anlamlı mesajlar
    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      throw new Error('OpenAI API\'sine bağlanılamadı. İnternet bağlantınızı kontrol edin.');
    }

    if (error.status === 401) {
      throw new Error('OpenAI API anahtarı geçersiz. Lütfen OPENAI_API_KEY\'i kontrol edin.');
    }

    if (error.status === 429) {
      throw new Error('OpenAI API rate limit aşıldı. Lütfen birkaç dakika bekleyin.');
    }

    if (error.status === 500 || error.status === 503) {
      throw new Error('OpenAI servisi şu anda yanıt vermiyor. Lütfen daha sonra tekrar deneyin.');
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error('OpenAI isteği zaman aşımına uğradı. Lütfen tekrar deneyin.');
    }

    // Genel hata
    throw new Error(`OpenAI API hatası: ${error.message || 'Bilinmeyen hata'}`);
  }
}

/**
 * OpenAI client yapılandırmasını döndürür (debug/test için)
 */
export function getConfig() {
  return {
    ...CONFIG,
    apiKeyConfigured: !!process.env.OPENAI_API_KEY,
  };
}

