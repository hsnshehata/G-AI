// server/models/BXBot.js
const mongoose = require('mongoose');

const bxBotSchema = new mongoose.Schema({
  bx_id: { type: String, required: true, unique: true },         // معرف مميز
  bx_name: { type: String, required: true },                     // اسم البوت
  bx_userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // ارتباط بمستخدم
  bx_token: { type: String, default: null },                     // مفتاح الفيسبوك
  bx_ai_key: { type: String, default: null },                    // مفتاح OpenAI
  bx_extra: { type: String, default: null }                      // أي بيانات إضافية
}, { timestamps: true });

module.exports = mongoose.model('BXBot', bxBotSchema);
