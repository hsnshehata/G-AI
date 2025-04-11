const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  botId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bot', required: true },
  type: { type: String, required: true, enum: ['general', 'products', 'qa', 'store', 'global'] },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Rule', ruleSchema);
