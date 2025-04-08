const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const {
  createBot,
  listBots,
  updateBot,
  getBotById
} = require('../controllers/botsController');

// ✅ لازم هنا بعد الـ require
console.log('🤖 DEBUG');
console.log('  createBot:', typeof createBot);
console.log('  listBots:', typeof listBots);
console.log('  updateBot:', typeof updateBot);
console.log('  getBotById:', typeof getBotById);
console.log('🛡️ verifyToken:', typeof verifyToken);

// إنشاء بوت جديد
router.post('/create', verifyToken, createBot);
router.get('/', verifyToken, listBots);
router.get('/:id', verifyToken, getBotById);
router.put('/:id', verifyToken, updateBot);

module.exports = router;
