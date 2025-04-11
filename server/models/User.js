const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user', enum: ['user', 'superadmin'] },
  bots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bot' }],
});

module.exports = mongoose.model('User', userSchema);
