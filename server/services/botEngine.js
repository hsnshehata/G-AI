const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');

async function fetchBotRules(botId) {
  try {
    const response = await axios.get(`${process.env.SERVER_URL || 'http://localhost:3000'}/rules?botId=${botId}`);
    return response.data.rules || [];
  } catch (error) {
    console.error('❌ فشل في تحميل القواعد:', error.message);
    return [];
  }
}

function matchRule(rules, message) {
  const lower = message.toLowerCase();
  return rules.find(rule => lower.includes(rule.keyword.toLowerCase()));
}

async function getGPTReply(message, botOpenAIKey) {
  try {
    const configuration = new Configuration({
      apiKey: botOpenAIKey || process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const res = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    });

    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error('❌ فشل استدعاء OpenAI:', err.message);
    return 'عذرًا، حدث خطأ في الذكاء الاصطناعي.';
  }
}

module.exports = {
  fetchBotRules,
  matchRule,
  getGPTReply
};
