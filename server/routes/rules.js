const express = require('express');
const router = express.Router();
const { verifyToken, isSuperAdmin } = require('../middleware/verifyToken');

router.use(verifyToken);

const Rule = require('../models/Rule');

router.get('/', async (req, res) => {
  try {
    const rules = await Rule.find().populate('botId createdBy');
    res.json(rules);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

router.post('/', async (req, res) => {
  const { botId, type, content } = req.body;

  try {
    const rule = await Rule.create({ botId, type, content, createdBy: req.user.id });
    res.status(201).json({ message: 'تم إنشاء القاعدة بنجاح', rule });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

router.put('/:id', async (req, res) => {
  const { type, content } = req.body;

  try {
    const rule = await Rule.findByIdAndUpdate(req.params.id, { type, content }, { new: true });
    res.json({ message: 'تم تحديث القاعدة', rule });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Rule.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم حذف القاعدة' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

module.exports = router;
