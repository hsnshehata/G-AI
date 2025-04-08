const axios = require('axios');
const Bot = require('../models/Bot');
const { handleUserMessage } = require('./chatController'); // إعادة استخدام الرد الذكي

// التحقق من Webhook (مطلوب من فيسبوك)
exports.verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || "test_verify";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
};

// استقبال الرسائل من Facebook
exports.handleWebhook = async (req, res) => {
  try {
    const body = req.body;

    if (body.object !== "page") return res.sendStatus(404);

    for (const entry of body.entry) {
      for (const event of entry.messaging) {
        const senderId = event.sender.id;
        const pageId = entry.id;
        const message = event.message?.text || null;

        if (!message) continue;

        // نبحث عن البوت اللي مرتبط بالصفحة
        const bot = await Bot.findOne({ pageId });
        if (!bot) {
          console.warn("❌ لا يوجد بوت مرتبط بـ Page ID:", pageId);
          continue;
        }

        // نولّد الرد باستخدام الرد الذكي
        const replyRes = await handleUserMessage({
          body: {
            message,
            botId: bot._id.toString(),
            userId: senderId,
            source: "facebook",
            type: "text",
          }
        }, {
          json: (output) => sendFacebookReply(senderId, bot.fbToken, output.reply)
        });

      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ خطأ في handleWebhook:", err.message);
    res.sendStatus(500);
  }
};

// إرسال الرد إلى Facebook
async function sendFacebookReply(userId, token, message) {
  try {
    await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${token}`, {
      recipient: { id: userId },
      message: { text: message }
    });
  } catch (err) {
    console.error("❌ فشل إرسال الرد لفيسبوك:", err.response?.data || err.message);
  }
}
