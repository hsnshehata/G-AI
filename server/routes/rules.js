const express = require('express');
const router = express.Router();
const Rule = require('../models/Rule');
const { verifyToken } = require('../middleware/auth');

// حفظ قاعدة جديدة
router.post('/', verifyToken, async (req, res) => {
  try {
    const { text, type, botId } = req.body;

    // التحقق من الحقول الأساسية
    if (!text || !type) {
      return res.status(400).json({ error: 'الرجاء إدخال جميع الحقول المطلوبة' });
    }

    // التحقق من botId عندما يكون النوع bot
    if (type === 'bot' && !botId) {
      return res.status(400).json({ error: 'botId مطلوب للقواعد الخاصة بالبوت' });
    }

    const rule = new Rule({
      text,
      type,
      botId: type === 'bot' ? botId : undefined,
    });

    await rule.save();
    res.status(201).json(rule);
  } catch (err) {
    console.error('خطأ في حفظ القاعدة:', err);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
});

// جلب القواعد
router.get('/', verifyToken, async (req, res) => {
  try {
    const { botId } = req.query;
    const rules = await Rule.find({
      $or: [
        { type: 'general' },
        { type: 'bot', botId },
      ],
    });
    res.json(rules);
  } catch (err) {
    console.error('خطأ في جلب القواعد:', err);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
});

module.exports = router;
