const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  pageId: {
    type: String,
    required: true,
    unique: true,
    default: () => require('uuid').v4() // توليد UUID تلقائي
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }
});

module.exports = mongoose.model('User', userSchema);
