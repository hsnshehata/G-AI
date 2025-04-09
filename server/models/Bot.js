const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fbToken: { type: String, default: null },
  pageId: { type: String, default: null },
  openaiKey: { type: String, default: null }
});

module.exports = mongoose.model('Bot', botSchema);
