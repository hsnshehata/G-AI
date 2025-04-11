const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  botId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bot' }, // معرف البوت (اختياري للقواعد الثابتة)
  type: { type: String, required: true, enum: ['general', 'products', 'qa', 'store', 'global'] }, // نوع القاعدة
  content: { type: mongoose.Schema.Types.Mixed, required: true }, // محتوى القاعدة
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // معرف المستخدم اللي أنشأ القاعدة
  createdAt: { type: Date, default: Date.now }, // تاريخ الإنشاء
});

module.exports = mongoose.model('Rule', ruleSchema);
