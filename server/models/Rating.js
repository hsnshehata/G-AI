const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  botId: {
    type: String,
    required: true,
    index: true, // For faster queries by botId
  },
  userId: {
    type: String,
    required: true,
    index: true, // For faster queries by userId
  },
  rating: {
    type: String,
    enum: ['positive', 'negative'],
    required: true,
  },
  message: {
    type: String,
    default: '', // Optional feedback message
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Compound index for efficient querying by botId and rating type
ratingSchema.index({ botId: 1, rating: 1 });

module.exports = mongoose.model('Rating', ratingSchema);