const Bot = require('../models/Bot');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// إنشاء بوت جديد
const createBot = async (req, res) => {
  let { name, username, password, fbToken, pageId, openaiKey } = req.body;

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
      username: user.username, // ✅ مهم جدًا عشان ما يبقاش null
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

// تحديث بوت موجود
const updateBot = async (req, res) => {
  const { id } = req.params;
  const { name, fbToken, openaiKey, pageId } = req.body;

  try {
    const updatedBot = await Bot.findByIdAndUpdate(
      id,
      {
        name,
        fbToken: fbToken || null,
        openaiKey: openaiKey || null,
        pageId: pageId || null
      },
      { new: true }
    );

    if (!updatedBot) {
      return res.status(404).json({ error: 'البوت غير موجود' });
    }

    res.json(updatedBot);
  } catch (err) {
    console.error('خطأ في تحديث البوت:', err);
    res.status(500).json({ error: 'فشل في تحديث البوت' });
  }
};

// حذف بوت
const deleteBot = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBot = await Bot.findByIdAndDelete(id);
    if (!deletedBot) {
      return res.status(404).json({ error: 'البوت غير موجود' });
    }
    res.json({ message: 'تم حذف البوت بنجاح' });
  } catch (err) {
    console.error('خطأ في حذف البوت:', err);
    res.status(500).json({ error: 'فشل في حذف البوت' });
  }
};

// جلب كل البوتات
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

module.exports = {
  createBot,
  getBots,
  updateBot,
  deleteBot
};
