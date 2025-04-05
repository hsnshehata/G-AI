const mongoose = require('mongoose');

const BotSchema = new mongoose.Schema({
  botName: { type: String, required: true },
  pageId: { type: String, required: true, unique: true }, // نفس معرف البوت على فيسبوك
  username: { type: String, required: true }, // المستخدم المسؤول عن البوت
  password: { type: String, required: true }, // مشفر
  role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },

  // إعدادات الاتصال والتشغيل
  openaiKey: { type: String },
  githubToken: { type: String },
  whatsappToken: { type: String },
  mongoUri: { type: String },

  botDescription: { type: String, default: '' },
  active: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bot', BotSchema);
