const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  openaiKey: { type: String, required: false },
  githubToken: { type: String, required: false },
  whatsappEnabled: { type: Boolean, default: false },
  whatsappSession: { type: Object, default: {} },
  telegramToken: { type: String },
  whatsappWebhookURL: { type: String },
  lemonfoxKey: { type: String },
  mongoUri: { type: String },
  allowBotPause: { type: Boolean, default: false },
  allowedDomains: [{ type: String }],
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
