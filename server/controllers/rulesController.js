const Rule = require('../models/Rule');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// إضافة قاعدة جديدة
const createRule = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'المستخدم غير معروف، برجاء تسجيل الدخول' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('❌ خطأ في التحقق من الـ token:', err.message);
      return res.status(401).json({ message: 'المستخدم غير معروف، الـ token غير صالح' });
    }

    const { botId, type, content } = req.body;

    // التحقق من الحقول المطلوبة
    if (!botId || !type || !content) {
      return res.status(400).json({ message: 'جميع الحقول (botId, type, content) مطلوبة' });
    }

    // التحقق من صلاحية botId
    if (!mongoose.Types.ObjectId.isValid(botId)) {
      return res.status(400).json({ message: 'معرف البوت غير صالح' });
    }

    // إنشاء قاعدة جديدة
    const rule = new Rule({
      botId,
      type,
      content,
      createdBy: decoded.id, // نستخدم decoded.id من الـ token
    });

    await rule.save();
    console.log('✅ تم إنشاء القاعدة بنجاح:', rule);
    res.status(201).json(rule);
  } catch (err) {
    console.error('❌ خطأ في إنشاء القاعدة:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر أثناء إنشاء القاعدة' });
  }
};

// الحصول على كل القواعد لبوت معين أو القواعد الثابتة
const getRules = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'المستخدم غير معروف، برجاء تسجيل الدخول' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('❌ خطأ في التحقق من الـ token:', err.message);
      return res.status(401).json({ message: 'المستخدم غير معروف، الـ token غير صالح' });
    }

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
    const query = decoded.role === 'superadmin'
      ? { $or: [{ botId }, { type: 'global' }] }
      : { botId, createdBy: decoded.id };

    const rules = await Rule.find(query).sort({ createdAt: -1 });
    console.log('✅ تم جلب القواعد بنجاح:', rules.length);
    res.json(rules);
  } catch (err) {
    console.error('❌ خطأ في جلب القواعد:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر أثناء جلب القواعد' });
  }
};

// تعديل قاعدة
const updateRule = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'المستخدم غير معروف، برجاء تسجيل الدخول' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('❌ خطأ في التحقق من الـ token:', err.message);
      return res.status(401).json({ message: 'المستخدم غير معروف، الـ token غير صالح' });
    }

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
    if (decoded.role !== 'superadmin' && rule.createdBy.toString() !== decoded.id) {
      return res.status(403).json({ message: 'غير مصرح لك بتعديل هذه القاعدة' });
    }

    // تحديث القاعدة
    rule.type = type || rule.type;
    rule.content = content || rule.content;

    await rule.save();
    console.log('✅ تم تعديل القاعدة بنجاح:', rule);
    res.json({ message: 'تم تعديل القاعدة بنجاح', rule });
  } catch (err) {
    console.error('❌ خطأ في تعديل القاعدة:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر أثناء تعديل القاعدة' });
  }
};

// حذف قاعدة
const deleteRule = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'المستخدم غير معروف، برجاء تسجيل الدخول' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('❌ خطأ في التحقق من الـ token:', err.message);
      return res.status(401).json({ message: 'المستخدم غير معروف، الـ token غير صالح' });
    }

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
    if (decoded.role !== 'superadmin' && rule.createdBy.toString() !== decoded.id) {
      return res.status(403).json({ message: 'غير مصرح لك بحذف هذه القاعدة' });
    }

    // حذف القاعدة
    await Rule.findByIdAndDelete(ruleId);
    console.log('✅ تم حذف القاعدة بنجاح:', ruleId);
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
