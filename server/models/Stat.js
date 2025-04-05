const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
  botId: {
    type: String,
    required: true,
    index: true, // For faster queries by botId
  },
  source: {
    type: String,
    enum: ['web', 'facebook', 'whatsapp'],
    required: true,
  },
  count: {
    type: Number,
    required: true,
    default: 0, // Number of events (e.g., messages sent, ratings received)
  },
  date: {
    type: String, // Stored as YYYY-MM-DD for daily aggregation
    required: true,
    index: true, // For faster queries by date
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Compound index for efficient querying by botId, source, and date
statSchema.index({ botId: 1, source: 1, date: 1 });

module.exports = mongoose.model('Stat', statSchema);