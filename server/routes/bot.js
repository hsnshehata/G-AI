const express = require('express');
const router = express.Router();
const { processMessage } = require('../botEngine');

router.post('/message', async (req, res) => {
  const { botId, userId, message, isImage, isVoice } = req.body;

  try {
    console.log('📩 Processing message for bot:', botId, { userId, message, isImage, isVoice });
    const reply = await processMessage(botId, userId, message, isImage, isVoice);
    console.log('✅ Message processed, reply:', reply);
    res.json({ reply });
  } catch (err) {
    console.error('❌ Error processing message:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر أثناء معالجة الرسالة' });
  }
});

module.exports = router;
