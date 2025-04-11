const express = require('express');
const router = express.Router();
const axios = require('axios');
const Bot = require('../models/Bot');
const { processMessage } = require('../botEngine');

// Webhook للتحقق من فيسبوك
router.get('/facebook', (req, res) => {
  const VERIFY_TOKEN = 'my_verify_token';

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
router.post('/facebook', async (req, res) => {
  try {
    console.log('📩 Webhook POST request received:', JSON.stringify(req.body, null, 2));
    const body = req.body;

    if (body.object !== 'page') return res.sendStatus(404);

    for (const entry of body.entry) {
      if (!entry.messaging || entry.messaging.length === 0) continue;

      const webhookEvent = entry.messaging[0];
      const senderPsid = webhookEvent.sender?.id;
      const pageId = entry.id;

      console.log('💬 Event received:', { senderPsid, pageId });

      if (!senderPsid) continue;

      const bot = await Bot.findOne({ facebookPageId: pageId });
      if (!bot) continue;

      const botId = bot._id;
      const facebookApiKey = bot.facebookApiKey;

      if (!facebookApiKey) continue;

      let reply;

      if (webhookEvent.message?.text) {
        reply = await processMessage(botId, senderPsid, webhookEvent.message.text, false, false);
      } else if (webhookEvent.message?.attachments?.[0]?.type === 'image') {
        const imageUrl = webhookEvent.message.attachments[0].payload.url;
        reply = await processMessage(botId, senderPsid, imageUrl, true, false);
      } else if (webhookEvent.message?.attachments?.[0]?.type === 'audio') {
        const audioUrl = webhookEvent.message.attachments[0].payload.url;
        reply = await processMessage(botId, senderPsid, audioUrl, false, true);
      } else {
        reply = 'عذرًا، لا أستطيع التعامل مع هذا النوع من الرسائل حاليًا.';
      }

      console.log('✅ Generated reply:', reply);
      await sendMessage(senderPsid, reply, facebookApiKey);
    }

    res.status(200).json({ message: 'EVENT_RECEIVED' });
  } catch (err) {
    console.error('❌ خطأ في معالجة رسالة فيسبوك:', err.message, err.stack);
    res.sendStatus(500);
  }
});

// دالة إرسال رسالة باستخدام axios بدل request
async function sendMessage(senderPsid, message, facebookApiKey) {
  try {
    const response = await axios.post(
      'https://graph.facebook.com/v2.6/me/messages',
      {
        recipient: { id: senderPsid },
        message: { text: message },
      },
      {
        params: { access_token: facebookApiKey },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    console.log('✅ تم إرسال الرسالة بنجاح:', response.data);
    return response.data;
  } catch (err) {
    console.error('❌ خطأ أثناء إرسال الرسالة:', err.response?.data || err.message);
    throw err;
  }
}

module.exports = router;
