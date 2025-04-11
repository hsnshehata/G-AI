const express = require('express');
const router = express.Router();
const Bot = require('../models/Bot');
const request = require('request');
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

    if (body.object !== 'page') {
      console.log('❌ Invalid webhook event: Not a page object');
      return res.sendStatus(404);
    }

    for (const entry of body.entry) {
      if (!entry.messaging || entry.messaging.length === 0) {
        console.log('❌ No messaging events found in entry:', entry);
        continue;
      }

      const webhookEvent = entry.messaging[0];
      const senderPsid = webhookEvent.sender?.id; // معرف المرسل
      const pageId = entry.id; // معرف الصفحة

      console.log('💬 Event received:', { senderPsid, pageId });

      if (!senderPsid) {
        console.log('❌ Missing sender PSID in webhook event');
        continue;
      }

      // جلب الـ bot بناءً على الـ facebookPageId
      const bot = await Bot.findOne({ facebookPageId: pageId });
      if (!bot) {
        console.log('❌ Bot not found for facebookPageId:', pageId);
        continue;
      }

      const botId = bot._id;
      const facebookApiKey = bot.facebookApiKey;
      const facebookPageId = bot.facebookPageId;

      console.log('🤖 Bot found:', { botId: botId.toString(), facebookApiKey, facebookPageId });

      if (!facebookApiKey) {
        console.log('❌ No facebookApiKey found for botId:', botId);
        continue;
      }

      let reply;

      // التحقق من نوع الرسالة (نص، صورة، صوت)
      if (webhookEvent.message?.text) {
        // رسالة نصية
        const message = webhookEvent.message.text;
        console.log('💬 Text message received:', message);
        reply = await processMessage(botId, senderPsid, message, false, false);
      } else if (webhookEvent.message?.attachments?.[0]?.type === 'image') {
        // رسالة صورة
        const imageUrl = webhookEvent.message.attachments[0].payload.url;
        console.log('🖼️ Image message received:', imageUrl);
        reply = await processMessage(botId, senderPsid, imageUrl, true, false);
      } else if (webhookEvent.message?.attachments?.[0]?.type === 'audio') {
        // رسالة صوتية
        const audioUrl = webhookEvent.message.attachments[0].payload.url;
        console.log('🎙️ Audio message received:', audioUrl);
        reply = await processMessage(botId, senderPsid, audioUrl, false, true);
      } else {
        console.log('❌ Unsupported message type');
        reply = 'عذرًا، لا أستطيع التعامل مع هذا النوع من الرسائل حاليًا.';
      }

      console.log('✅ Generated reply:', reply);

      // إرسال الرد للمستخدم (كله نصي دلوقتي)
      await sendMessage(senderPsid, reply, facebookApiKey);
    }

    res.status(200).json({ message: 'EVENT_RECEIVED' });
  } catch (err) {
    console.error('❌ خطأ في معالجة رسالة فيسبوك:', err.message, err.stack);
    res.sendStatus(500);
  }
});

// دالة لإرسال رسالة عبر فيسبوك (نص فقط)
async function sendMessage(senderPsid, message, facebookApiKey) {
  const requestBody = {
    recipient: {
      id: senderPsid,
    },
    message: {
      text: message,
    },
  };

  console.log('📤 Sending message to PSID:', senderPsid, 'Message:', message);

  return new Promise((resolve, reject) => {
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: facebookApiKey },
      method: 'POST',
      json: requestBody,
    }, (err, response, body) => {
      if (err) {
        console.error('❌ خطأ في إرسال الرسالة:', err);
        reject(err);
      } else if (response.body.error) {
        console.error('❌ خطأ من فيسبوك:', response.body.error);
        reject(response.body.error);
      } else {
        console.log('✅ تم إرسال الرسالة بنجاح:', body);
        resolve(body);
      }
    });
  });
}

module.exports = router;
