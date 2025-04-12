const request = require('request');
const Bot = require('../models/Bot');
const { processMessage } = require('../botEngine');

// دالة لمعالجة الرسايل من فيسبوك
exports.handleMessage = async (req, res) => {
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

      console.log('🤖 Bot found:', { botId: botId.toString(), facebookApiKey });

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

      // إرسال الرد للمستخدم
      await sendMessage(senderPsid, reply, facebookApiKey);
    }

    res.status(200).json({ message: 'EVENT_RECEIVED' });
  } catch (err) {
    console.error('❌ خطأ في معالجة رسالة فيسبوك:', err.message, err.stack);
    res.sendStatus(500);
  }
};

// دالة لإرسال رسالة عبر فيسبوك
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
    request(
      {
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: facebookApiKey },
        method: 'POST',
        json: requestBody,
      },
      (err, response, body) => {
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
      }
    );
  });
}

module.exports = { handleMessage };
