const express = require('express');
const router = express.Router();
const { handleMessage } = require('../controllers/facebookController');

// مفتاح التحقق من Webhook
const VERIFY_TOKEN = 'my_verify_token';

// Webhook للتحقق من فيسبوك
router.get('/facebook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('📩 Webhook GET request received:', req.query);

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully');
      res.status(200).send(challenge);
    } else {
      console.log('❌ Webhook verification failed: Invalid token');
      res.sendStatus(403);
    }
  } else {
    console.log('❌ Webhook verification failed: Missing mode or token');
    res.sendStatus(400);
  }
});

// Webhook لاستقبال الرسائل من فيسبوك
router.post('/facebook', handleMessage);

module.exports = router;
