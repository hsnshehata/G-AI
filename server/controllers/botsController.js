const Bot = require('../models/Bot');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createBot = async (req, res) => {
  let { name, username, password, fbToken, pageId, openaiKey } = req.body;

  // ✅ تصحيح قيمة pageId لو كانت null أو string فاضي
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
      const newUserData = { username, password: hashedPass };

      if (pageId) {
        newUserData.pageId = pageId;
      }

      user = new User(newUserData);
      await user.save();
    }

    const newBotData = {
      name,
      userId: user._id,
      fbToken,
      openaiKey
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
