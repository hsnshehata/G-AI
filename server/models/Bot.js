const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  facebookApiKey: { type: String, default: null },
  facebookPageId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bot', botSchema);
