const Chat = require('../models/Chat');
const { loadRulesAndReply } = require('../services/botEngine');

// جلب الرسائل
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

// حذف رسالة
const deleteChat = async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'فشل في حذف الرسالة' });
  }
};

// الرد على رسالة (جديدة)
const replyToMessage = async (req, res) => {
  try {
    const { message, botId, userId, source } = req.body;

    if (!message || !botId || !userId || !source) {
      return res.status(400).json({ error: 'بيانات ناقصة' });
    }

    // جلب الرد من القواعد
    const ruleReply = await loadRulesAndReply(message, botId);

    // حفظ الرسالة
    await Chat.create({
      userId,
      botId,
      message,
      source,
      timestamp: new Date(),
    });

    res.json({
      reply: ruleReply || null,
      usedRule: !!ruleReply,
    });
  } catch (err) {
    console.error('Error in replyToMessage:', err.message);
    res.status(500).json({ error: 'فشل في معالجة الرسالة' });
  }
};

module.exports = {
  getChats,
  deleteChat,
  replyToMessage
};
