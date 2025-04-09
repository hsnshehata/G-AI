const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  botId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bot', default: null }, // null لو قاعدة عامة
  type: {
    type: String,
    enum: ['text', 'qa', 'price', 'store'],
    required: true
  },
  text: String, // للقواعد النصية
  question: String, // لـ Q&A
  answer: String,   // لـ Q&A
  service: String,  // لـ الأسعار
  price: Number,    // لـ الأسعار
  createdAt: { type: Date, default: Date.now },
  isGlobal: { type: Boolean, default: false } // القواعد الثابتة للسوبر أدمن
});

module.exports = mongoose.model('Rule', ruleSchema);
