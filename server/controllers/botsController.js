const Bot = require('../models/Bot');

const createBot = async (req, res) => {
  try {
    const { name, username, password, fbToken, pageId, openaiKey } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ message: 'الرجاء إدخال جميع الحقول المطلوبة' });
    }

    const existing = await Bot.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'اسم المستخدم مستخدم بالفعل' });
    }

    const bot = new Bot({ name, username, password, fbToken, pageId, openaiKey });
    await bot.save();

    res.status(201).json({ message: 'تم إنشاء البوت بنجاح', bot });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

const listBots = async (req, res) => {
  try {
    const bots = await Bot.find().sort({ createdAt: -1 });
    res.json(bots);
  } catch (error) {
    res.status(500).json({ message: 'فشل في تحميل البوتات' });
  }
};

const updateBot = async (req, res) => {
  try {
    const bot = await Bot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'تم تحديث البوت بنجاح', bot });
  } catch (error) {
    res.status(500).json({ message: 'فشل في تحديث البوت' });
  }
};

module.exports = { createBot, listBots, updateBot };
