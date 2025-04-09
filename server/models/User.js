const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' }, // 'admin' or 'user'

  // ✅ إضافة الحقل pageId مع unique sparse index
  pageId: { type: String, unique: true, sparse: true }
});

module.exports = mongoose.model('User', userSchema);
