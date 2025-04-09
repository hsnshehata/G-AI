const express = require('express');
const router = express.Router();
const {
  createBot,
  getBots,
  updateBot,
  deleteBot
} = require('../controllers/botsController');

const verifyToken = require('../middleware/verifyToken');

router.post('/create', verifyToken, createBot);
router.get('/', verifyToken, getBots);

// ✅ المسارات الجديدة:
router.put('/:id', verifyToken, updateBot);
router.delete('/:id', verifyToken, deleteBot);

module.exports = router;
