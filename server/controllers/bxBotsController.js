const Bot = require('../models/Bot');
const User = require('../models/User');

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
    res.status(201).json({ message: '✅ تم إنشاء البوت بنجاح', bot });
  } catch (err) {
    console.error('❌ خطأ في إنشاء البوت:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء البوت' });
  }
};
