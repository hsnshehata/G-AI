const Rule = require('../models/Rule');
const Bot = require('../models/Bot');

// جلب القواعد (العامة والخاصة)
const getRules = async (req, res) => {
  try {
    const { botId } = req.query;

    if (!botId) {
      // قواعد عامة فقط
      const globalRules = await Rule.find({ type: 'global' });
      return res.json(globalRules);
    }

    const rules = await Rule.find({
      $or: [
        { type: 'global' },
        { type: 'bot', botId }
      ]
    });

    res.json(rules);
  } catch (err) {
    console.error('getRules error:', err);
    res.status(500).json({ error: 'فشل في تحميل القواعد' });
  }
};

// إنشاء قاعدة جديدة
const createRule = async (req, res) => {
  try {
    const { text, type, botId } = req.body;

    if (type === 'bot' && !botId) {
      return res.status(400).json({ error: 'يجب تحديد botId للقواعد الخاصة' });
    }

    const rule = new Rule({ text, type, botId: type === 'bot' ? botId : null });
    await rule.save();
    res.status(201).json({ message: 'تمت إضافة القاعدة', rule });
  } catch (err) {
    console.error('createRule error:', err);
    res.status(500).json({ error: 'فشل في إنشاء القاعدة' });
  }
};

// حذف قاعدة
const deleteRule = async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.id);
    if (!rule) return res.status(404).json({ error: 'القاعدة غير موجودة' });

    await rule.deleteOne();
    res.json({ message: 'تم حذف القاعدة' });
  } catch (err) {
    console.error('deleteRule error:', err);
    res.status(500).json({ error: 'فشل في حذف القاعدة' });
  }
};

module.exports = {
  getRules,
  createRule,
  deleteRule,
};
