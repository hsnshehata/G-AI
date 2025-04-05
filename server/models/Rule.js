const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  botId: {
    type: String,
    required: true,
    index: true, // For faster queries by botId
  },
  content: {
    type: String,
    required: true,
    trim: true, // Removes whitespace
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Index for efficient querying by botId
ruleSchema.index({ botId: 1 });

module.exports = mongoose.model('Rule', ruleSchema);