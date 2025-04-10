const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  fbToken: { type: String },
  openaiKey: { type: String },
  notes: { type: String },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Bot', botSchema);
