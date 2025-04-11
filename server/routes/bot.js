const express = require('express');
const router = express.Router();
const { processMessage } = require('../botEngine');

router.post('/message', async (req, res) => {
  const { botId, userId, message, isImage, isVoice } = req.body;

  try {
    const reply = await processMessage(botId, userId, message, isImage, isVoice);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

module.exports = router;
