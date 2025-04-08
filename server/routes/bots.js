const express = require('express');
const router = express.Router();

const {
  createBot,
  listBots,
  updateBot
} = require('../controllers/botsController');

router.post('/create', createBot);
router.get('/', listBots);
router.put('/:id', updateBot);

module.exports = router;
