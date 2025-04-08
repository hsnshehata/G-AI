const Chat = require('../models/Chat');
const axios = require('axios');
const { fetchBotRules, matchRule, getGPTReply } = require('../services/botEngine');

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

const deleteChat = async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'فشل في حذف الرسالة' });
  }
};

// ✅ أهم دالة: الرد المتكامل
const handleUserMessage = async (req, res) => {
  try {
    const { message, botId, userId, source, type, mediaUrl } = req.body;

    if (!botId || !userId || !source) {
      return res.status(400).json({ error: 'البيانات غير مكتملة' });
    }

    let finalReply = '';

    // 1. لو الرسالة صوت
    if (type === 'voice' && mediaUrl) {
      try {
        const lemonRes = await axios.post('https://api.lemonfox.ai/transcribe', {
          audio_url: mediaUrl
        }, {
          headers: { Authorization: `Bearer ${process.env.LEMONFOX_API_KEY}` }
        });

        const transcribedText = lemonRes.data.text;
        finalReply = `🗣️ الرسالة الصوتية تم تحويلها: ${transcribedText}`;
      } catch (err) {
        console.error('🎤 خطأ في تحليل الصوت:', err.message);
        finalReply = '⚠️ لم أتمكن من فهم الرسالة الصوتية.';
      }
    }

    // 2. لو صورة
    else if (type === 'image' && mediaUrl) {
      finalReply = `🖼️ استلمت الصورة. (تحليل الصور غير مفعل بعد)`;
      // يمكنك لاحقًا ربطها بخدمة رؤية مثل Gemini أو OpenAI Vision
    }

    // 3. نص عادي
    else if (message) {
      const rules = await fetchBotRules(botId);
      const matchedRule = matchRule(rules, message);

      if (matchedRule) {
        finalReply = matchedRule.response;
      } else {
        // جلب مفتاح البوت (لو موجود)
        const botRes = await axios.get(`${process.env.SERVER_URL || 'http://localhost:3000'}/bots/${botId}`);
        const bot = botRes.data;

        finalReply = await getGPTReply(message, bot.openaiKey);
      }
    }

    await Chat.create({
      userId,
      botId,
      message: message || `[${type}]`,
      source,
      timestamp: new Date(),
    });

    res.json({
      reply: finalReply || '❓ لم أستطع الرد على رسالتك.',
      usedAI: !finalReply.startsWith('🗣️') && !finalReply.startsWith('🖼️'),
    });
  } catch (err) {
    console.error('❌ handleUserMessage:', err.message);
    res.status(500).json({ error: 'حدث خطأ أثناء الرد على الرسالة' });
  }
};

module.exports = {
  getChats,
  deleteChat,
  handleUserMessage
};
