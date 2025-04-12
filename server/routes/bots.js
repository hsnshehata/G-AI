const express = require('express');
const router = express.Router();
const Bot = require('../models/Bot');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

router.get('/', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: 'المستخدم غير معروف، برجاء تسجيل الدخول' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('❌ Invalid token:', err.message);
      return res.status(401).json({ message: 'المستخدم غير معروف، الـ token غير صالح' });
    }

    console.log('📋 Fetching bots for user:', decoded.id);
    const bots = await Bot.find().populate('userId');
    if (decoded.role === 'superadmin') {
      console.log('✅ Returning all bots for superadmin:', bots.length);
      return res.json(bots);
    }

    const userBots = bots.filter((bot) => bot.userId._id.toString() === decoded.id);
    console.log('✅ Returning user bots:', userBots.length);
    res.json(userBots);
  } catch (err) {
    console.error('❌ Error fetching bots:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر أثناء جلب البوتات' });
  }
});

router.post('/', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: 'المستخدم غير معروف، برجاء تسجيل الدخول' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error('❌ Invalid token:', err.message);
    return res.status(401).json({ message: 'المستخدم غير معروف، الـ token غير صالح' });
  }

  const { name, userId, facebookApiKey, facebookPageId } = req.body;

  if (!name || !userId) {
    console.log('❌ Missing required fields:', { name, userId });
    return res.status(400).json({ message: 'اسم البوت ومعرف المستخدم مطلوبان' });
  }

  if (decoded.role !== 'superadmin') {
    console.log('❌ Unauthorized access:', decoded.id);
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
    res.status(500).json({ message: 'خطأ في السيرفر أثناء إنشاء البوت' });
  }
});

router.put('/:id', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: 'المستخدم غير معروف، برجاء تسجيل الدخول' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error('❌ Invalid token:', err.message);
    return res.status(401).json({ message: 'المستخدم غير معروف، الـ token غير صالح' });
  }

  const { name, facebookApiKey, facebookPageId } = req.body;

  if (decoded.role !== 'superadmin') {
    console.log('❌ Unauthorized access:', decoded.id);
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
    res.status(500).json({ message: 'خطأ في السيرفر أثناء تعديل البوت' });
  }
});

router.delete('/:id', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: 'المستخدم غير معروف، برجاء تسجيل الدخول' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error('❌ Invalid token:', err.message);
    return res.status(401).json({ message: 'المستخدم غير معروف، الـ token غير صالح' });
  }

  if (decoded.role !== 'superadmin') {
    console.log('❌ Unauthorized access:', decoded.id);
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
    res.status(500).json({ message: 'خطأ في السيرفر أثناء حذف البوت' });
  }
});

module.exports = router;
