const express = require('express');
const router = express.Router();
const Bot = require('../models/Bot');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const bots = await Bot.find().populate('userId');
    if (req.user.role === 'superadmin') {
      return res.json(bots);
    }
    const userBots = bots.filter((bot) => bot.userId._id.toString() === req.user._id.toString());
    res.json(userBots);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

router.post('/', auth, async (req, res) => {
  const { name, userId, facebookApiKey, facebookPageId } = req.body;

  if (!name || !userId) {
    return res.status(400).json({ message: 'اسم البوت ومعرف المستخدم مطلوبان' });
  }

  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'غير مصرح لك' });
  }

  try {
    const bot = new Bot({ name, userId, facebookApiKey, facebookPageId });
    await bot.save();
    res.status(201).json(bot);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { name, facebookApiKey, facebookPageId } = req.body;

  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'غير مصرح لك' });
  }

  try {
    const bot = await Bot.findById(req.params.id);
    if (!bot) {
      return res.status(404).json({ message: 'البوت غير موجود' });
    }

    bot.name = name || bot.name;
    bot.facebookApiKey = facebookApiKey || bot.facebookApiKey;
    bot.facebookPageId = facebookPageId || bot.facebookPageId;
    await bot.save();

    res.json(bot);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'غير مصرح لك' });
  }

  try {
    const bot = await Bot.findById(req.params.id);
    if (!bot) {
      return res.status(404).json({ message: 'البوت غير موجود' });
    }

    await bot.remove();
    res.json({ message: 'تم حذف البوت بنجاح' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

module.exports = router;
