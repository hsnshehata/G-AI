const Bot = require('../models/Bot');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // لتوليد pageId عشوائي

const createBot = async (req, res) => {
  let { name, username, password, fbToken, pageId, openaiKey } = req.body;

  // لو pageId فاضي، نخليه undefined عشان نتحكم فيه
  if (!pageId || pageId === 'null' || pageId.trim() === '') {
    pageId = undefined;
  }

  try {
    let user = await User.findOne({ username });

    if (user) {
      const existingBot = await Bot.findOne({ userId: user._id });
      if (existingBot) {
        return res.status(409).json({ error: 'يوجد بوت بالفعل لهذا المستخدم' });
      }
    } else {
      if (!password) return res.status(400).json({ error: 'كلمة المرور مطلوبة' });

      const hashedPass = await bcrypt.hash(password, 10);

      // ✅ توليد pageId مؤقت عشوائي
      const fakePageId = pageId || crypto.randomUUID();

      const newUserData = {
        username,
        password: hashedPass,
        pageId: fakePageId
      };

      user = new User(newUserData);
      await user.save();
    }

    // إعداد بيانات البوت
    const newBotData = {
      name,
      userId: user._id,
      fbToken: fbToken || null,
      openaiKey: openaiKey || null
    };

    if (pageId) {
      newBotData.pageId = pageId;
    }

    const newBot = new Bot(newBotData);
    await newBot.save();

    res.status(201).json(newBot);

  } catch (err) {
    console.error('خطأ في إنشاء البوت:', err);
    res.status(500).json({ error: 'فشل في إنشاء البوت' });
  }
};

const getBots = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    let bots = role === 'admin'
      ? await Bot.find().populate('userId', 'username')
      : await Bot.find({ userId }).populate('userId', 'username');

    bots = bots.map(bot => ({
      _id: bot._id,
      name: bot.name,
      username: bot.userId?.username || 'غير معروف'
    }));

    res.json(bots);
  } catch (err) {
    res.status(500).json({ error: 'خطأ في جلب البوتات' });
  }
};

module.exports = { createBot, getBots };
