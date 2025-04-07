const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  fbToken: {
    type: String,
    default: null
  },
  pageId: {
    type: String,
    default: null
  },
  openaiKey: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bot', botSchema);
