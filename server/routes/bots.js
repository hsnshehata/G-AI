const express = require('express');
const router = express.Router();

const {
  createBot,
  listBots
} = require('../controllers/botsController');

// مسار إنشاء بوت جديد
router.post('/create', createBot);

// مسار جلب كل البوتات (جديد)
router.get('/', listBots);

module.exports = router;
