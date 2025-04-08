const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  keyword: { type: String, required: true },
  response: { type: String, required: true },
  pageId: { type: String, required: true }, // معرف البوت أو "global"
  ruleType: { type: String, enum: ['bot', 'global', 'faq', 'product'], required: true }, // نوع القاعدة
});

module.exports = mongoose.model('Rule', ruleSchema);
