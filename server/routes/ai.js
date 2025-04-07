const express = require('express');
const router = express.Router();
const {
  generateAIResponse,
  analyzeImageAndRespond,
  transcribeAudioAndRespond,
} = require('../controllers/aiController');

// الرد على نص
router.post('/chat', generateAIResponse);

// الرد على صورة
router.post('/image', analyzeImageAndRespond);

// الرد على صوت
router.post('/audio', transcribeAudioAndRespond);

module.exports = router;
