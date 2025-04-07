const express = require('express');
const router = express.Router();
const { createBot } = require('../controllers/botsController');

// المسار المفتوح بدون توكن
router.post('/create', createBot);

// هنا ممكن تضيف حماية لباقي المسارات بعدين
// router.use(authenticateToken);
// router.get('/list', listBots); ...

module.exports = router;
