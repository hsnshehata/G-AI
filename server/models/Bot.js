const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
  name: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fbToken: String,
  pageId: String,
  openaiKey: String
});

module.exports = mongoose.model('Bot', botSchema);
