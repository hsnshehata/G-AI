const express = require('express');
const router = express.Router();
const { getChats, deleteChat, resendChat } = require('../controllers/chatController'); // استيراد الدوال

// عرض المحادثات
router.get('/', getChats);

// حذف محادثة
router.delete('/:id', deleteChat);

// إعادة إرسال محادثة
router.post('/resend/:id', resendChat);

module.exports = router;
