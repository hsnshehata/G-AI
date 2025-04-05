const mongoose = require('mongoose');

const whatsAppStatusSchema = new mongoose.Schema({
  pageId: {
    type: String,
    required: true,
    unique: true, // Ensures one status per pageId
    index: true, // For faster queries by pageId
    trim: true,
  },
  connected: {
    type: Boolean,
    required: true,
    default: false, // Indicates if WhatsApp is currently connected
  },
  lastConnected: {
    type: Date,
    default: null, // Last time WhatsApp was connected
  },
  qr: {
    type: String,
    default: null, // QR code string when connecting
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Index for efficient querying by pageId
whatsAppStatusSchema.index({ pageId: 1 });

module.exports = mongoose.model('WhatsAppStatus', whatsAppStatusSchema);