const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const Session = require('../models/Session');
const Chat = require('../models/Chat');
const Setting = require('../models/Setting');
const { io } = require('../socket');
const { loadBotRules, generateAIResponse } = require('./botEngine');
const { saveChatToDB } = require('./saveChat');

const whatsappClients = {};

async function initWhatsApp(botId) {
  if (whatsappClients[botId]) return whatsappClients[botId];

  const sessionData = await Session.findOne({ botId });

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: botId }),
    puppeteer: { headless: true },
  });

  whatsappClients[botId] = client;

  client.on('qr', async (qr) => {
    const qrImage = await qrcode.toDataURL(qr);
    io.emit(`qr-${botId}`, { qr: qrImage });

    await Session.findOneAndUpdate(
      { botId },
      { connected: false, lastConnectedAt: null },
      { upsert: true }
    );
  });

  client.on('ready', async () => {
    console.log(`✅ WhatsApp Client ready for bot ${botId}`);

    await Session.findOneAndUpdate(
      { botId },
      { connected: true, lastConnectedAt: new Date() },
      { upsert: true }
    );

    io.emit(`status-${botId}`, { connected: true });
  });

  client.on('disconnected', async () => {
    console.log(`⚠️ WhatsApp Client disconnected for bot ${botId}`);

    await Session.findOneAndUpdate(
      { botId },
      { connected: false },
      { upsert: true }
    );

    io.emit(`status-${botId}`, { connected: false });
  });

  client.on('message', async (msg) => {
    if (!msg.from || msg.from === 'status@broadcast') return;

    try {
      const setting = await Setting.findOne({ botId });
      if (!setting?.whatsappEnabled) return;

      const text = msg.body?.trim();
      const userId = msg.from;
      const source = 'whatsapp';

      const rules = await loadBotRules(botId);
      const reply = await generateAIResponse(text, rules);

      // Send reply
      await msg.reply(reply);

      // Save to DB
      await saveChatToDB({ userId, botId, message: text, source });
      await saveChatToDB({ userId, botId, message: reply, source });
    } catch (err) {
      console.error(`❌ Error handling WhatsApp message for bot ${botId}:`, err);
    }
  });

  client.initialize();

  return client;
}

module.exports = { initWhatsApp };
