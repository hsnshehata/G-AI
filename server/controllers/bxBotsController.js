const Bot = require('../models/Bot');
const User = require('../models/User');

// إنشاء بوت جديد
exports.createBot = async (req, res) => {
  try {
    const { name, username, fbToken, openaiKey, notes } = req.body;

    if (!name || !username) {
      return res.status(400).json({ error: 'اسم البوت واسم المستخدم مطلوبان' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    const bot = new Bot({
      name,
      username,
      fbToken,
      openaiKey,
      notes,
      ownerId: user._id
    });

    await bot.save();
    res.status(201).json({ message: 'تم إنشاء البوت بنجاح', bot });
  } catch (err) {
    console.error('❌ خطأ في إنشاء البوت:', err);
    res.status(500).json({ error: 'فشل في إنشاء البوت' });
  }
};

// حذف بوت
exports.deleteBot = async (req, res) => {
  try {
    const { id } = req.params;
    await Bot.findByIdAndDelete(id);
    res.status(200).json({ message: 'تم حذف البوت' });
  } catch (err) {
    console.error('❌ خطأ في الحذف:', err);
    res.status(500).json({ error: 'فشل في حذف البوت' });
  }
};

// تعديل بوت
exports.updateBot = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const bot = await Bot.findByIdAndUpdate(id, updates, { new: true });
    if (!bot) {
      return res.status(404).json({ error: 'البوت غير موجود' });
    }

    res.status(200).json({ message: 'تم تحديث البوت', bot });
  } catch (err) {
    console.error('❌ خطأ في التعديل:', err);
    res.status(500).json({ error: 'فشل في تعديل البوت' });
  }
};

// عرض جميع البوتات
exports.getAllBots = async (req, res) => {
  try {
    const bots = await Bot.find();
    res.status(200).json(bots);
  } catch (err) {
    console.error('❌ خطأ في تحميل البوتات:', err);
    res.status(500).json({ error: 'فشل في تحميل البوتات' });
  }
};
