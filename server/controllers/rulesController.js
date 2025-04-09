const Rule = require('../models/Rule');

// إضافة قاعدة جديدة
const createRule = async (req, res) => {
  try {
    const rule = new Rule(req.body);
    await rule.save();
    res.status(201).json(rule);
  } catch (err) {
    console.error('❌ خطأ في إنشاء القاعدة:', err);
    res.status(500).json({ error: 'فشل في إنشاء القاعدة' });
  }
};

// الحصول على كل القواعد لبوت معين أو عامة
const getRules = async (req, res) => {
  try {
    const { botId, type, isGlobal } = req.query;

    const query = {};

    if (botId) query.botId = botId;
    if (type) query.type = type;
    if (isGlobal !== undefined) query.isGlobal = isGlobal === 'true';

    const rules = await Rule.find(query).sort({ createdAt: -1 });
    res.json(rules);
  } catch (err) {
    console.error('❌ خطأ في جلب القواعد:', err);
    res.status(500).json({ error: 'فشل في جلب القواعد' });
  }
};

// تعديل قاعدة
const updateRule = async (req, res) => {
  try {
    const updated = await Rule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'لم يتم العثور على القاعدة' });
    res.json(updated);
  } catch (err) {
    console.error('❌ خطأ في التحديث:', err);
    res.status(500).json({ error: 'فشل في تحديث القاعدة' });
  }
};

// حذف قاعدة
const deleteRule = async (req, res) => {
  try {
    const deleted = await Rule.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'القاعدة غير موجودة' });
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) {
    console.error('❌ خطأ في الحذف:', err);
    res.status(500).json({ error: 'فشل في حذف القاعدة' });
  }
};

module.exports = {
  createRule,
  getRules,
  updateRule,
  deleteRule
};
