const express = require('express');
const router = express.Router();

const {
  createBot,
  listBots,
  updateBot,
  getBotById
} = require('../controllers/botsController');

router.post('/create', createBot);
router.get('/', listBots);
router.get('/:id', getBotById); // ← ده المسار الجديد
router.put('/:id', updateBot);

module.exports = router;
