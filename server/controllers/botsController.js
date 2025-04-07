const Bot = require('../models/Bot');

// إنشاء بوت جديد
const createBot = async (req, res) => {
  try {
    const { name, username, password, fbToken, pageId, openaiKey } = req.body;

    // تحقق من البيانات المطلوبة
    if (!name || !username || !password) {
      return res.status(400).json({ message: 'الرجاء إدخال جميع الحقول المطلوبة' });
    }

    // التحقق من وجود اسم مستخدم مكرر
    const existing = await Bot.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'اسم المستخدم مستخدم بالفعل' });
    }

    // إنشاء البوت وتخزينه
    const bot = new Bot({
      name,
      username,
      password,
      fbToken: fbToken || null,
      pageId: fbToken ? pageId : null,
      openaiKey: openaiKey || null,
    });

    await bot.save();
    res.status(201).json({ message: 'تم إنشاء البوت بنجاح', bot });
  } catch (error) {
    console.error('خطأ أثناء إنشاء البوت:', error);
    res.status(500).json({ message: 'حدث خطأ في السيرفر' });
  }
};

module.exports = {
  createBot,
};
