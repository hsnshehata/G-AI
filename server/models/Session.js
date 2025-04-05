const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  botId: {
    type: String,
    required: true,
    index: true,
  },
  session: {
    type: Object,
    required: true,
  },
  lastConnected: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

module.exports = mongoose.model('Session', sessionSchema);
