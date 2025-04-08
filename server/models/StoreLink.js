const mongoose = require('mongoose');

const storeLinkSchema = new mongoose.Schema({
  apiKey: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('StoreLink', storeLinkSchema);
