const Bot = require('../models/Bot');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const createBot = async (req, res) => {
  let { name, username, password, fbToken, pageId, openaiKey } = req.body;

  // تحقق من صلاحية اسم المستخدم
  if (!username || username === 'null' || username.trim() === '') {
    return res.status(400).json({ error: 'اسم المستخدم مطلوب' });
  }

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
      const fakePageId = pageId || crypto.randomUUID();

      const newUserData = {
        username,
        password: hashedPass,
        pageId: fakePageId
      };

      user = new User(newUserData);
      await user.save();
    }

    const newBotData = {
      name,
      userId: user._id,
      username: user.username,
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
    const bots = await Bot.find().populate('userId', 'username');
    res.json(bots);
  } catch (err) {
    res.status(500).json({ error: 'فشل في تحميل البوتات' });
  }
};

const updateBot = async (req, res) => {
  const { id } = req.params;
  const { name, fbToken, pageId, openaiKey } = req.body;

  try {
    const bot = await Bot.findById(id);
    if (!bot) return res.status(404).json({ error: 'البوت غير موجود' });

    bot.name = name || bot.name;
    bot.fbToken = fbToken || bot.fbToken;
    bot.pageId = pageId || bot.pageId;
    bot.openaiKey = openaiKey || bot.openaiKey;

    await bot.save();
    res.json(bot);
  } catch (err) {
    console.error('خطأ في تعديل البوت:', err);
    res.status(500).json({ error: 'فشل في تعديل البوت' });
  }
};

const deleteBot = async (req, res) => {
  const { id } = req.params;

  try {
    const bot = await Bot.findByIdAndDelete(id);
    if (!bot) return res.status(404).json({ error: 'البوت غير موجود' });

    res.json({ message: 'تم حذف البوت بنجاح' });
  } catch (err) {
    res.status(500).json({ error: 'فشل في حذف البوت' });
  }
};

module.exports = {
  createBot,
  getBots,
  updateBot,
  deleteBot
};
