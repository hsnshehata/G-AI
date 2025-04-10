const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  pageId: { type: String, required: true, unique: true },
  role: { type: String, default: 'user' }
});

module.exports = mongoose.model('User', userSchema);
