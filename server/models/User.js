const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate usernames
    trim: true,
  },
  password: {
    type: String,
    required: true, // Hashed password
  },
  pageId: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate pageIds
    trim: true,
  },
  pageToken: {
    type: String,
    default: null, // Optional token for Facebook or other integrations
  },
  title: {
    type: String,
    default: 'Untitled Bot', // Display name for the bot
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin'],
    default: 'admin',
  },
  permissions: {
    facebook: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: true },
    web: { type: Boolean, default: true },
  },
  chatPageSettings: {
    color: { type: String, default: '#1877f2' }, // Default chat page color
    logo: { type: String, default: null }, // Base64 or URL for chat logo
  },
  themeColor: {
    type: String,
    default: '#1877f2', // Default dashboard theme color
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Indexes for faster queries
userSchema.index({ username: 1 });
userSchema.index({ pageId: 1 });

module.exports = mongoose.model('User', userSchema);