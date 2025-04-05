const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  botId: { type: String, required: true, index: true },
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
  active: { type: Boolean, default: true }, // الحقل الجديد
}, {
  timestamps: true,
});

faqSchema.index({ botId: 1 });

module.exports = mongoose.model('Faq', faqSchema);