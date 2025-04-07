const express = require('express');
const router = express.Router();
const { createBot } = require('../controllers/botsController');

// إنشاء بوت جديد
router.post('/create', createBot);

module.exports = router;
