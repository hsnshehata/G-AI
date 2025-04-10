const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true }, // اسم المستخدم اللي يربط البوت بيه
  fbToken: { type: String },
  openaiKey: { type: String },
  notes: { type: String },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bot', botSchema);
