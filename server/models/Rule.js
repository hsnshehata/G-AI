const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  // معرف البوت المرتبط بالقاعدة (اختياري لأن القواعد الثابتة ما بيكونش ليها botId)
  botId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bot' },
  
  // نوع القاعدة (مطلوب)
  type: { type: String, required: true, enum: ['general', 'products', 'qa', 'store', 'global'] },
  
  // محتوى القاعدة (يمكن أن يكون أي نوع بيانات)
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  
  // معرف المستخدم اللي أنشأ القاعدة
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // تاريخ الإنشاء
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Rule', ruleSchema);
