const axios = require('axios');

// الرد على الرسائل بناءً على القواعد المخزنة
async function loadRulesAndReply(userMessage, botId) {
  if (!botId || !userMessage) return null;

  try {
    const response = await axios.get(`${process.env.SERVER_URL || 'http://localhost:3000'}/rules?botId=${botId}`);
    const rules = response.data.rules || [];

    const lowerMsg = userMessage.toLowerCase();

    for (const rule of rules) {
      if (lowerMsg.includes(rule.keyword.toLowerCase())) {
        return rule.response;
      }
    }

    return null;

  } catch (error) {
    console.error('❌ فشل في تحميل قواعد البوت:', error.message);
    return null;
  }
}

module.exports = {
  loadRulesAndReply
};
