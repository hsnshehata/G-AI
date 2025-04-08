const Rule = require('../models/Rule');

// إرجاع جميع القواعد الخاصة بالبوت
exports.getRules = async (req, res) => {
  try {
    const { botId } = req.query;
    if (!botId) return res.status(400).json({ error: 'botId is required' });

    const rules = await Rule.find({ botId });
    res.json({ rules, botId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
};

// إضافة قاعدة جديدة
exports.addRule = async (req, res) => {
  try {
    const { text, type, botId } = req.body;

    if (!text || !type) {
      return res.status(400).json({ message: 'الرجاء إدخال جميع الحقول المطلوبة' });
    }

    const newRule = new Rule({
      text,
      type,
      botId: botId || null, // لو مفيش botId، هيبقى null
    });

    await newRule.save();
    res.status(201).json({ message: 'تم حفظ القاعدة بنجاح', rule: newRule });
  } catch (err) {
    console.error('خطأ في حفظ القاعدة:', err);
    res.status(500).json({ error: 'فشل في حفظ القاعدة' });
  }
};

// حذف قاعدة
exports.deleteRule = async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.id);

    if (!rule) return res.status(404).json({ error: 'Rule not found' });

    await rule.deleteOne();
    res.json({ message: 'Rule deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete rule' });
  }
};
