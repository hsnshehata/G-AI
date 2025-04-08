const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true }, // النص بتاع القاعدة
  type: { type: String, required: true, enum: ['general', 'bot'] }, // نوع القاعدة: عامة أو خاصة بالبوت
  botId: { type: String, default: null }, // معرف البوت (اختياري دلوقتي)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rule', ruleSchema);
