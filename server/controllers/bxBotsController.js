const BXBot = require('../models/BXBot');
const User = require('../models/User');
const crypto = require('crypto');

// إنشاء بوت جديد
const createBXBot = async (req, res) => {
  const { bx_name, bx_user, bx_token, bx_ai_key, bx_extra } = req.body;

  if (!bx_name || !bx_user) {
    return res.status(400).json({ error: 'الاسم والمستخدم مطلوبان' });
  }

  try {
    const user = await User.findById(bx_user);
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

    const bx_id = crypto.randomUUID();

    const newBXBot = new BXBot({
      bx_id,
      bx_name,
      bx_userRef: user._id,
      bx_token: bx_token || null,
      bx_ai_key: bx_ai_key || null,
      bx_extra: bx_extra || null
    });

    await newBXBot.save();
    res.status(201).json(newBXBot);
  } catch (err) {
    console.error('خطأ أثناء إنشاء البوت:', err);
    res.status(500).json({ error: 'فشل في إنشاء البوت' });
  }
};

// جلب كل البوتات
const getBXBots = async (req, res) => {
  try {
    const bots = await BXBot.find().populate('bx_userRef', 'username');
    res.json(bots);
  } catch (err) {
    res.status(500).json({ error: 'فشل في تحميل البوتات' });
  }
};

// تعديل بوت موجود
const updateBXBot = async (req, res) => {
  const { id } = req.params;
  const { bx_name, bx_token, bx_ai_key, bx_extra } = req.body;

  try {
    const bot = await BXBot.findById(id);
    if (!bot) return res.status(404).json({ error: 'البوت غير موجود' });

    bot.bx_name = bx_name || bot.bx_name;
    bot.bx_token = bx_token || bot.bx_token;
    bot.bx_ai_key = bx_ai_key || bot.bx_ai_key;
    bot.bx_extra = bx_extra || bot.bx_extra;

    await bot.save();
    res.json(bot);
  } catch (err) {
    console.error('خطأ أثناء تعديل البوت:', err);
    res.status(500).json({ error: 'فشل في تعديل البوت' });
  }
};

// حذف بوت
const deleteBXBot = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await BXBot.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'البوت غير موجود' });
    res.json({ message: 'تم حذف البوت بنجاح' });
  } catch (err) {
    res.status(500).json({ error: 'فشل في حذف البوت' });
  }
};

module.exports = {
  createBXBot,
  getBXBots,
  updateBXBot,
  deleteBXBot
};
