const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: ['general', 'bot'] }, // نوع القاعدة: عامة أو خاصة بالبوت
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rule', ruleSchema);
