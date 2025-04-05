const axios = require('axios');
const Settings = require('../models/Settings'); // لازم تكون أنشأته قبل كدا أو أقوله أعملهولك

async function suggestAnswer(question) {
  try {
    // نجيب الإعدادات من قاعدة البيانات
    const settings = await Settings.findOne();
    const apiKey = settings?.openaiKey;

    if (!apiKey) {
      throw new Error('🔐 مفتاح OpenAI غير موجود في الإعدادات');
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'أنت مساعد ذكي يساعد في تقديم إجابات قصيرة وواضحة لأسئلة شائعة لخدمة العملاء.',
          },
          {
            role: 'user',
            content: `اقترح إجابة مناسبة لهذا السؤال:\n"${question}"`,
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.error('❌ GPT Suggestion Error:', err.message);
    throw new Error('فشل في اقتراح الإجابة من GPT');
  }
}

module.exports = { suggestAnswer };
