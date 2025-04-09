const express = require('express');
const router = express.Router();
const { createBot, getBots } = require('../controllers/botsController');
const verifyToken = require('../middleware/verifyToken');

router.post('/create', verifyToken, createBot);
router.get('/', verifyToken, getBots);

module.exports = router;
