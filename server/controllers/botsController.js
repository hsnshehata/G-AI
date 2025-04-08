const Bot = require('../models/Bot');

const createBot = async (req, res) => {
  try {
    const { name, username, password, fbToken, pageId, openaiKey } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ error: 'يرجى إدخال جميع الحقول المطلوبة' });
    }

    const exists = await Bot.findOne({ username });
    if (exists) {
      return res.status(409).json({ error: 'اسم المستخدم موجود بالفعل' });
    }

    const bot = new Bot({ name, username, password, fbToken, pageId, openaiKey });
    await bot.save();
    res.status(201).json({ message: 'تم إنشاء البوت بنجاح', bot });

  } catch (err) {
    console.error('❌ خطأ في إنشاء البوت:', err);
    res.status(500).json({ error: 'فشل في إنشاء البوت' });
  }
};

const listBots = async (req, res) => {
  try {
    const { role, username } = req.user;

    const bots = role === 'admin'
      ? await Bot.find().sort({ createdAt: -1 })
      : await Bot.find({ username }).sort({ createdAt: -1 });

    res.json(bots);
  } catch (err) {
    console.error('❌ خطأ في جلب البوتات:', err);
    res.status(500).json({ error: 'فشل في تحميل البوتات' });
  }
};

const getBotById = async (req, res) => {
  try {
    const bot = await Bot.findById(req.params.id);
    if (!bot) {
      return res.status(404).json({ error: 'البوت غير موجود' });
    }
    res.json(bot);
  } catch (err) {
    console.error('❌ خطأ في جلب بيانات البوت:', err);
    res.status(500).json({ error: 'فشل في جلب بيانات البوت' });
  }
};

const updateBot = async (req, res) => {
  try {
    const bot = await Bot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bot) {
      return res.status(404).json({ error: 'البوت غير موجود' });
    }

    res.json({ message: 'تم التحديث بنجاح', bot });
  } catch (err) {
    console.error('❌ خطأ في تحديث البوت:', err);
    res.status(500).json({ error: 'فشل في تحديث البوت' });
  }
};

module.exports = {
  createBot,
  listBots,
  getBotById,
  updateBot
};
