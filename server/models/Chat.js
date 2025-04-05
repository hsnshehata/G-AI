const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true, // يجعل الحقل مطلوبًا
  },
  botId: {
    type: String,
    required: true, // يجعل الحقل مطلوبًا
  },
  message: {
    type: String,
    required: true, // يجعل الحقل مطلوبًا
  },
  source: {
    type: String,
    enum: ['web', 'facebook', 'whatsapp'], // يحدد القيم الممكنة
    required: true, // يجعل الحقل مطلوبًا
  },
  timestamp: {
    type: Date,
    default: Date.now, // يضيف التوقيت الحالي بشكل تلقائي
  },
}, {
  timestamps: true, // يضيف createdAt و updatedAt تلقائيًا
});

// إنشاء الفهرس (index) لتسريع الاستعلامات
chatSchema.index({ userId: 1 }); // فهرس على userId
chatSchema.index({ botId: 1 }); // فهرس على botId
chatSchema.index({ source: 1 }); // فهرس على source

module.exports = mongoose.model('Chat', chatSchema);