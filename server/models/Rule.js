const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['global', 'bot'], // global = قواعد عامة، bot = خاصة ببوت معين
    required: true
  },
  botId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bot',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Rule', ruleSchema);
