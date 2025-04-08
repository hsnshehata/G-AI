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
    const userRole = req.user?.role;
    const username = req.user?.username;

    let bots;
    if (userRole === 'admin') {
      // إذا كان المستخدم أدمن، يتم جلب كل البوتات
      bots = await Bot.find().sort({ createdAt: -1 });
    } else {
      // إذا كان مستخدم عادي، يتم جلب البوتات الخاصة به فقط
      bots = await Bot.find({ username }).sort({ createdAt: -1 });
    }
    res.json(bots);
  } catch (error) {
    console.error('خطأ في جلب البوتات:', error);
    res.status(500).json({ message: 'فشل في تحميل البوتات' });
  }
};

const updateBot = async (req, res) => {
  try {
    const bot = await Bot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bot) return res.status(404).json({ message: 'البوت غير موجود' });
    res.json({ message: 'تم تحديث البوت بنجاح', bot });
  } catch (error) {
    console.error('خطأ في تحديث البوت:', error);
    res.status(500).json({ message: 'فشل في تحديث البوت' });
  }
};

const getBotById = async (req, res) => {
  try {
    const bot = await Bot.findById(req.params.id);
    if (!bot) return res.status(404).json({ message: 'البوت غير موجود' });
    res.json(bot);
  } catch (error) {
    console.error('خطأ في جلب البوت:', error);
    res.status(500).json({ message: 'فشل في جلب البوت' });
  }
};

module.exports = {
  createBot,
  listBots,
  updateBot,
  getBotById
};
