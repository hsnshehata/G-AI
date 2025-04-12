const axios = require('axios');
const { processMessage } = require('../botEngine');

// تخزين حالة الجلسات (بدون الاعتماد على puppeteer)
const sessions = new Map();

exports.verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN;

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully!');
      res.status(200).send(challenge);
    } else {
      console.error('❌ Webhook verification failed: Invalid token');
      res.sendStatus(403);
    }
  } else {
    console.error('❌ Webhook verification failed: Missing parameters');
    res.sendStatus(400);
  }
};

exports.handleMessage = async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      console.log('💬 Facebook webhook event:', webhookEvent);

      const senderId = webhookEvent.sender.id;
      const pageId = webhookEvent.recipient.id;
      const botId = req.botId; // هنجيب botId من الـ middleware (هنشرحه بعدين)
      const message = webhookEvent.message?.text;
      const isImage = webhookEvent.message?.attachments?.[0]?.type === 'image';
      const imageUrl = isImage ? webhookEvent.message.attachments[0].payload.url : null;

      if (message || isImage) {
        // معالجة الرسالة باستخدام processMessage
        const reply = await processMessage(
          botId,
          senderId,
          isImage ? imageUrl : message,
          isImage,
          false // مش صوت
        );

        // إرسال الرد للمستخدم على فيسبوك
        await sendMessage(senderId, reply);
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } else {
    console.error('❌ Invalid webhook event:', body);
    res.sendStatus(404);
  }
};

// دالة لإرسال رسالة على فيسبوك
async function sendMessage(senderId, message) {
  try {
    const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    await axios.post(
      `https://graph.facebook.com/v20.0/me/messages`,
      {
        recipient: { id: senderId },
        message: { text: message },
      },
      {
        params: { access_token: PAGE_ACCESS_TOKEN },
      }
    );
    console.log('✅ Facebook message sent to:', senderId, 'Message:', message);
  } catch (err) {
    console.error('❌ Error sending Facebook message:', err.message, err.stack);
  }
}

module.exports = { verifyWebhook, handleMessage };
