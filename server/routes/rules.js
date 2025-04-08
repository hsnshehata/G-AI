const express = require('express');
const router = express.Router();
const Rule = require('../models/Rule');

// حفظ قاعدة جديدة
router.post('/', async (req, res) => {
  try {
    const { text, type, botId } = req.body;
    if (!text || !type) {
      return res.status(400).json({ error: 'الرجاء إدخال جميع الحقول المطلوبة' });
    }

    const rule = new Rule({
      text,
      type,
      botId: type === 'bot' ? botId : undefined, // botId مطلوب فقط للقواعد الخاصة بالبوت
    });

    await rule.save();
    res.status(201).json(rule);
  } catch (err) {
    console.error('خطأ في حفظ القاعدة:', err);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
});

// جلب القواعد
router.get('/', async (req, res) => {
  try {
    const { botId } = req.query;
    const rules = await Rule.find({
      $or: [
        { type: 'general' }, // جلب القواعد العامة
        { type: 'bot', botId }, // جلب القواعد الخاصة بالبوت
      ],
    });
    res.json(rules);
  } catch (err) {
    console.error('خطأ في جلب القواعد:', err);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
});

module.exports = router;
