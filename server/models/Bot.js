const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  facebookApiKey: { type: String, default: null }, // الـ Page Access Token
  facebookPageId: { type: String, default: null }, // معرف الصفحة على فيسبوك
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bot', botSchema);
