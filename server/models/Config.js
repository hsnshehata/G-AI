const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate keys
    trim: true, // Removes whitespace
  },
  value: {
    type: String,
    required: true,
    trim: true, // Removes whitespace
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Index for faster lookups by key
configSchema.index({ key: 1 });

module.exports = mongoose.model('Config', configSchema);