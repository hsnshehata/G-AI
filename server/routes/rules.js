const express = require('express');
const router = express.Router();
const Rule = require('../models/Rule');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const botId = req.query.botId;
    if (!botId) {
      return res.status(400).json({ message: 'معرف البوت مطلوب' });
    }

    const query = req.user.role === 'superadmin'
      ? { $or: [{ botId }, { type: 'global' }] }
      : { botId, userId: req.user._id };

    const rules = await Rule.find(query);
    res.json(rules);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

router.post('/', auth, async (req, res) => {
  const { botId, type, content } = req.body;

  if (!botId || !type || !content) {
    return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
  }

  try {
    const rule = new Rule({
      botId,
      type,
      content,
      userId: req.user._id,
    });

    await rule.save();
    res.status(201).json(rule);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { type, content } = req.body;

  try {
    const rule = await Rule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ message: 'القاعدة غير موجودة' });
    }

    if (rule.userId.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'غير مصرح لك' });
    }

    rule.type = type || rule.type;
    rule.content = content || rule.content;
    await rule.save();

    res.json(rule);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ message: 'القاعدة غير موجودة' });
    }

    if (rule.userId.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'غير مصرح لك' });
    }

    await rule.remove();
    res.json({ message: 'تم حذف القاعدة بنجاح' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

module.exports = router;
