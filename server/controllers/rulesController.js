const Rule = require('../models/Rule');
const mongoose = require('mongoose');

// إضافة قاعدة جديدة
const createRule = async (req, res) => {
  try {
    const { botId, type, content } = req.body;

    // التحقق من الحقول المطلوبة
    if (!botId || !type || !content) {
      return res.status(400).json({ message: 'جميع الحقول (botId, type, content) مطلوبة' });
    }

    // التحقق من صلاحية botId
    if (!mongoose.Types.ObjectId.isValid(botId)) {
      return res.status(400).json({ message: 'معرف البوت غير صالح' });
    }

    // التحقق من وجود req.user._id
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'المستخدم غير معروف، برجاء تسجيل الدخول' });
    }

    // إنشاء قاعدة جديدة
    const rule = new Rule({
      botId,
      type,
      content,
      createdBy: req.user._id,
    });

    await rule.save();
    res.status(201).json(rule);
  } catch (err) {
    console.error('❌ خطأ في إنشاء القاعدة:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر أثناء إنشاء القاعدة' });
  }
};

// الحصول على كل القواعد لبوت معين أو القواعد الثابتة
const getRules = async (req, res) => {
  try {
    const botId = req.query.botId;

    // التحقق من وجود botId
    if (!botId) {
      return res.status(400).json({ message: 'معرف البوت مطلوب' });
    }

    // التحقق من صلاحية botId
    if (!mongoose.Types.ObjectId.isValid(botId)) {
      return res.status(400).json({ message: 'معرف البوت غير صالح' });
    }

    // بناء الاستعلام بناءً على دور المستخدم
    const query = req.user.role === 'superadmin'
      ? { $or: [{ botId }, { type: 'global' }] }
      : { botId, createdBy: req.user._id };

    const rules = await Rule.find(query).sort({ createdAt: -1 });
    res.json(rules);
  } catch (err) {
    console.error('❌ خطأ في جلب القواعد:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر أثناء جلب القواعد' });
  }
};

// تعديل قاعدة
const updateRule = async (req, res) => {
  try {
    const ruleId = req.params.id;
    const { type, content } = req.body;

    // التحقق من صلاحية الـ ID
    if (!mongoose.Types.ObjectId.isValid(ruleId)) {
      return res.status(400).json({ message: 'معرف القاعدة غير صالح' });
    }

    // البحث عن القاعدة
    const rule = await Rule.findById(ruleId);
    if (!rule) {
      return res.status(404).json({ message: 'القاعدة غير موجودة' });
    }

    // التحقق من صلاحيات المستخدم
    if (req.user.role !== 'superadmin' && rule.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'غير مصرح لك بتعديل هذه القاعدة' });
    }

    // تحديث القاعدة
    rule.type = type || rule.type;
    rule.content = content || rule.content;

    await rule.save();
    res.json({ message: 'تم تعديل القاعدة بنجاح', rule });
  } catch (err) {
    console.error('❌ خطأ في تعديل القاعدة:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر أثناء تعديل القاعدة' });
  }
};

// حذف قاعدة
const deleteRule = async (req, res) => {
  try {
    const ruleId = req.params.id;

    // التحقق من صلاحية الـ ID
    if (!mongoose.Types.ObjectId.isValid(ruleId)) {
      return res.status(400).json({ message: 'معرف القاعدة غير صالح' });
    }

    // البحث عن القاعدة
    const rule = await Rule.findById(ruleId);
    if (!rule) {
      return res.status(404).json({ message: 'القاعدة غير موجودة' });
    }

    // التحقق من صلاحيات المستخدم
    if (req.user.role !== 'superadmin' && rule.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'غير مصرح لك بحذف هذه القاعدة' });
    }

    // حذف القاعدة
    await Rule.findByIdAndDelete(ruleId);
    res.json({ message: 'تم حذف القاعدة بنجاح' });
  } catch (err) {
    console.error('❌ خطأ في حذف القاعدة:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر أثناء حذف القاعدة' });
  }
};

module.exports = {
  createRule,
  getRules,
  updateRule,
  deleteRule,
};
