const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  createBot,
  listBots,
  updateBot,
  getBotById
} = require('../controllers/botsController');

console.log('🤖 DEBUG createBot:', typeof createBot); // يجب أن تطبع "function"

// إنشاء بوت جديد
router.post('/create', verifyToken, createBot);

// جلب قائمة البوتات
router.get('/', verifyToken, listBots);

// جلب بوت محدد بناءً على المعرف
router.get('/:id', verifyToken, getBotById);

// تحديث بوت محدد
router.put('/:id', verifyToken, updateBot);

module.exports = router;
