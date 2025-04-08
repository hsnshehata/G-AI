const express = require('express');
const router = express.Router();

const {
  getChats,
  deleteChat,
  resendChat,
  handleUserMessage // ✅ تم إضافتها بالشكل الصحيح
} = require('../controllers/chatController');

// عرض المحادثات
router.get('/', getChats);

// حذف محادثة
router.delete('/:id', deleteChat);

// إعادة إرسال محادثة
router.post('/resend/:id', resendChat);

// الرد على رسالة
router.post('/reply', handleUserMessage); // ✅ ده المسار الأساسي لتشغيل البوت

module.exports = router;
