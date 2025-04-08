const Chat = require('../models/Chat');
const axios = require('axios');
const Bot = require('../models/Bot');
const { fetchBotRules, matchRule, getGPTReply } = require('../services/botEngine');

// ✅ عرض المحادثات
const getChats = async (req, res) => {
  try {
    const { botId, source } = req.query;
    const filter = {};
    if (botId) filter.botId = botId;
    if (source) filter.source = source;

    const chats = await Chat.find(filter).sort({ timestamp: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: 'فشل في جلب المحادثات' });
  }
};

// ✅ حذف محادثة
const deleteChat = async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'فشل في حذف الرسالة' });
  }
};

// ✅ إعادة إرسال (غير مفعل بعد)
const resendChat = async (req, res) => {
  res.json({ message: 'قريبًا...' });
};

// ✅ الدالة الأساسية للرد الذكي
const handleUserMessage = async (req, res) => {
  try {
    const { message, botId, userId, source, type, mediaUrl } = req.body;

    if (!botId || !userId || !source) {
      return res.status(400).json({ error: 'البيانات ناقصة' });
    }

    let finalReply = '';

    // ✅ الرد على الصوت
    if (type === 'voice' && mediaUrl) {
      try {
        const lemonRes = await axios.post('https://api.lemonfox.ai/transcribe', {
          audio_url: mediaUrl
        }, {
          headers: { Authorization: `Bearer ${process.env.LEMONFOX_API_KEY}` }
        });

        const transcribedText = lemonRes.data.text;
        finalReply = `🗣️ تم تحويل الصوت: ${transcribedText}`;
      } catch (err) {
        console.error('🎤 خطأ في تحويل الصوت:', err.message);
        finalReply = '⚠️ لم أتمكن من فهم الصوت.';
      }
    }

    // ✅ الرد على الصور
    else if (type === 'image' && mediaUrl) {
      finalReply = `🖼️ تم استلام الصورة. (تحليل الصور غير مفعل بعد)`;
    }

    // ✅ الرسائل النصية
    else if (message) {
      const rules = await fetchBotRules(botId);
      const matchedRule = matchRule(rules, message);

      if (matchedRule) {
        finalReply = matchedRule.response;
      } else {
        const bot = await Bot.findById(botId);
        const botKey = bot?.openaiKey || process.env.OPENAI_API_KEY;
        finalReply = await getGPTReply(message, botKey);
      }
    }

    // ✅ حفظ الرسالة
    await Chat.create({
      userId,
      botId,
      message: message || `[${type}]`,
      source,
      timestamp: new Date(),
    });

    res.json({
      reply: finalReply || '❓ لم أتمكن من الرد.',
      usedAI: !finalReply.startsWith('🗣️') && !finalReply.startsWith('🖼️'),
    });
  } catch (err) {
    console.error('❌ handleUserMessage:', err.message);
    res.status(500).json({ error: 'حدث خطأ أثناء الرد' });
  }
};

module.exports = {
  getChats,
  deleteChat,
  resendChat,
  handleUserMessage // ← لازم تكون مصدّرة صح
};
