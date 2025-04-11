const mongoose = require('mongoose');

const whatsappSessionSchema = new mongoose.Schema({
  botId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bot', required: true, unique: true },
  sessionData: { type: Object }, // بيانات الجلسة (محفوظة من whatsapp-web.js)
  connectedAt: { type: Date }, // وقت بدء الجلسة
  isConnected: { type: Boolean, default: false }, // حالة الاتصال
});

module.exports = mongoose.model('WhatsAppSession', whatsappSessionSchema);
