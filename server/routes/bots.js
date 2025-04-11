const express = require('express');
const router = express.Router();
const Bot = require('../models/Bot');
const User = require('../models/User');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    console.log('📋 Fetching bots for user:', req.user._id);
    const bots = await Bot.find().populate('userId');
    if (req.user.role === 'superadmin') {
      console.log('✅ Returning all bots for superadmin:', bots.length);
      return res.json(bots);
    }
    const userBots = bots.filter((bot) => bot.userId._id.toString() === req.user._id.toString());
    console.log('✅ Returning user bots:', userBots.length);
    res.json(userBots);
  } catch (err) {
    console.error('❌ Error fetching bots:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { name, userId, facebookApiKey, facebookPageId } = req.body;

  if (!name || !userId) {
    console.log('❌ Missing required fields:', { name, userId });
    return res.status(400).json({ message: 'اسم البوت ومعرف المستخدم مطلوبان' });
  }

  if (req.user.role !== 'superadmin') {
    console.log('❌ Unauthorized access:', req.user._id);
    return res.status(403).json({ message: 'غير مصرح لك' });
  }

  try {
    console.log('📝 Creating bot:', { name, userId, facebookApiKey, facebookPageId });
    const bot = new Bot({ name, userId, facebookApiKey, facebookPageId });
    await bot.save();

    // تحديث المستخدم بإضافة البوت لقائمة البوتات
    await User.findByIdAndUpdate(userId, { $push: { bots: bot._id } }, { new: true });

    console.log('✅ Bot created:', bot._id);
    res.status(201).json(bot);
  } catch (err) {
    console.error('❌ Error creating bot:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { name, facebookApiKey, facebookPageId } = req.body;

  if (req.user.role !== 'superadmin') {
    console.log('❌ Unauthorized access:', req.user._id);
    return res.status(403).json({ message: 'غير مصرح لك' });
  }

  try {
    console.log('✏️ Updating bot:', req.params.id, { name, facebookApiKey, facebookPageId });
    const bot = await Bot.findById(req.params.id);
    if (!bot) {
      console.log('❌ Bot not found:', req.params.id);
      return res.status(404).json({ message: 'البوت غير موجود' });
    }

    bot.name = name || bot.name;
    bot.facebookApiKey = facebookApiKey !== undefined ? facebookApiKey : bot.facebookApiKey;
    bot.facebookPageId = facebookPageId !== undefined ? facebookPageId : bot.facebookPageId;
    await bot.save();

    console.log('✅ Bot updated:', bot._id);
    res.json(bot);
  } catch (err) {
    console.error('❌ Error updating bot:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'superadmin') {
    console.log('❌ Unauthorized access:', req.user._id);
    return res.status(403).json({ message: 'غير مصرح لك' });
  }

  try {
    console.log('🗑️ Deleting bot:', req.params.id);
    const bot = await Bot.findById(req.params.id);
    if (!bot) {
      console.log('❌ Bot not found:', req.params.id);
      return res.status(404).json({ message: 'البوت غير موجود' });
    }

    // حذف البوت من قاعدة البيانات
    await Bot.deleteOne({ _id: req.params.id });

    // تحديث المستخدم بحذف البوت من قائمة البوتات
    await User.findByIdAndUpdate(bot.userId, { $pull: { bots: bot._id } }, { new: true });

    console.log('✅ Bot deleted:', req.params.id);
    res.json({ message: 'تم حذف البوت بنجاح' });
  } catch (err) {
    console.error('❌ Error deleting bot:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
});

module.exports = router;
