/**
 * OpenAI Client Test Script
 * 
 * Bu dosyayı çalıştırarak openaiClient modülünü test edebilirsiniz:
 * node src/llm/openaiClient.test.js
 */

import { askLLM, getConfig } from './openaiClient.js';

async function testOpenAIClient() {
  console.log('🧪 OpenAI Client Test Başlatılıyor...\n');

  // 1. Konfigürasyon kontrolü
  console.log('📋 Yapılandırma:');
  const config = getConfig();
  console.log(JSON.stringify(config, null, 2));
  console.log('');

  if (!config.apiKeyConfigured) {
    console.error('❌ HATA: OPENAI_API_KEY ayarlanmamış!');
    console.log('💡 .env dosyasında OPENAI_API_KEY değişkenini ayarlayın.\n');
    process.exit(1);
  }

  // 2. Basit soru-cevap testi
  console.log('🤖 Test 1: Basit soru-cevap');
  try {
    const response = await askLLM({
      messages: [
        { role: 'user', content: 'Merhaba, nasılsın?' }
      ]
    });
    console.log('✅ Yanıt alındı:', response);
    console.log('');
  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.log('');
  }

  // 3. Kontext ile test
  console.log('🤖 Test 2: Context ile soru');
  try {
    const response = await askLLM({
      messages: [
        { role: 'user', content: 'Benim adım Ali.' },
        { role: 'assistant', content: 'Merhaba Ali! Tanıştığımıza memnun oldum.' },
        { role: 'user', content: 'Benim adım neydi?' }
      ]
    });
    console.log('✅ Yanıt alındı:', response);
    console.log('');
  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.log('');
  }

  // 4. Boş mesaj testi (hata bekleniyor)
  console.log('🤖 Test 3: Validation testi (boş mesaj)');
  try {
    await askLLM({ messages: [] });
    console.log('❌ Hata fırlatılmalıydı!');
  } catch (error) {
    console.log('✅ Beklenen hata yakalandı:', error.message);
    console.log('');
  }

  console.log('✨ Tüm testler tamamlandı!');
}

// Test'i çalıştır
testOpenAIClient().catch(console.error);

