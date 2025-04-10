const express = require('express');
const router = express.Router();
const {
  createBXBot,
  getBXBots,
  updateBXBot,
  deleteBXBot
} = require('../controllers/bxBotsController');

const verifyToken = require('../middleware/verifyToken');

// 🔐 حماية المسارات بالتوكن
router.post('/create', verifyToken, createBXBot);
router.get('/', verifyToken, getBXBots);
router.put('/:id', verifyToken, updateBXBot);
router.delete('/:id', verifyToken, deleteBXBot);

module.exports = router;
