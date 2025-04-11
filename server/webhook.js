const express = require('express');
const router = express.Router();
const Rule = require('../models/Rule');
const request = require('request');

// Webhook للتحقق من فيسبوك
router.get('/facebook', (req, res) => {
  const VERIFY_TOKEN = 'my_verify_token_123'; // نفس التوكن اللي استخدمته في الخطوة 2.4

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// Webhook لاستقبال الرسائل من فيسبوك
router.post('/facebook', async (req, res) => {
  try {
    const body = req.body;

    if (body.object === 'page') {
      body.entry.forEach(async (entry) => {
        const webhookEvent = entry.messaging[0];
        const senderPsid = webhookEvent.sender.id; // معرف المرسل
        const message = webhookEvent.message ? webhookEvent.message.text : null;

        if (message) {
          // البحث عن قاعدة بناءً على botId
          const botId = 'YOUR_BOT_ID'; // استبدلها بالـ botId اللي عندك
          const rule = await Rule.findOne({ botId, type: 'general' });

          let reply = 'عذرًا، لم أتمكن من فهم رسالتك. جرب مرة تانية!';

          if (rule) {
            // هنا ممكن تضيف منطق عشان تختار الرد بناءً على محتوى الرسالة
            reply = rule.content; // أو اختار رد مناسب من content
          }

          // إرسال الرد للمستخدم
          sendMessage(senderPsid, reply);
        }
      });

      res.status(200).json({ message: 'EVENT_RECEIVED' });
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.error('❌ خطأ في معالجة رسالة فيسبوك:', err.message, err.stack);
    res.sendStatus(500);
  }
});

// دالة لإرسال رسالة عبر فيسبوك
function sendMessage(senderPsid, message) {
  const PAGE_ACCESS_TOKEN = 'YOUR_PAGE_ACCESS_TOKEN'; // استبدلها بالـ Page Access Token اللي نسخته في الخطوة 2.3

  const requestBody = {
    recipient: {
      id: senderPsid,
    },
    message: {
      text: message,
    },
  };

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: requestBody,
  }, (err, response, body) => {
    if (err) {
      console.error('❌ خطأ في إرسال الرسالة:', err);
    } else if (response.body.error) {
      console.error('❌ خطأ من فيسبوك:', response.body.error);
    } else {
      console.log('✅ تم إرسال الرسالة بنجاح');
    }
  });
}

module.exports = router;
