const { Client, LocalAuth } = require('whatsapp-web.js');
const WhatsAppStatus = require('../models/WhatsAppStatus');
const Chat = require('../models/Chat');
const Config = require('../models/Config');
const { Configuration, OpenAIApi } = require('openai');

const whatsappClients = {};

async function initializeWhatsAppClient(pageId) {
  if (whatsappClients[pageId]) return whatsappClients[pageId];

  // Initialize OpenAI with API key from MongoDB
  const apiKey = await Config.findOne({ key: 'API_KEY' }).then(c => c.value);
  const openai = new OpenAIApi(new Configuration({ apiKey }));

  whatsappClients[pageId] = new Client({
    authStrategy: new LocalAuth({ clientId: pageId }),
    puppeteer: { headless: true, args: ['--no-sandbox'] },
  });

  whatsappClients[pageId].on('qr', async (qr) => {
    console.log(`📱 QR Code generated for ${pageId}:`, qr);
    await WhatsAppStatus.findOneAndUpdate(
      { pageId },
      { connected: false, qr },
      { upsert: true }
    );
  });

  whatsappClients[pageId].on('ready', async () => {
    console.log(`✅ WhatsApp connected for ${pageId}`);
    await WhatsAppStatus.findOneAndUpdate(
      { pageId },
      { connected: true, lastConnected: new Date(), qr: null },
      { upsert: true }
    );
  });

  whatsappClients[pageId].on('disconnected', async (reason) => {
    console.log(`❌ WhatsApp disconnected for ${pageId}. Reason: ${reason}`);
    await WhatsAppStatus.findOneAndUpdate(
      { pageId },
      { connected: false },
      { upsert: true }
    );
    setTimeout(() => reconnect(pageId), 30000); // Attempt reconnect after 30 seconds
  });

  whatsappClients[pageId].on('message', async (msg) => {
    const userId = msg.from;
    const message = msg.body;

    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
      });
      const reply = response.data.choices[0].message.content;

      // Save chat to DB
      await Chat.findOneAndUpdate(
        { pageId, userId },
        {
          $push: {
            messages: [
              { role: 'user', content: message, source: 'whatsapp', responded: true },
              { role: 'bot', content: reply, source: 'whatsapp', responded: true },
            ],
          },
        },
        { upsert: true }
      );

      // Send reply back to WhatsApp
      await whatsappClients[pageId].sendMessage(msg.from, reply);
    } catch (err) {
      console.error(`❌ Error processing WhatsApp message for ${pageId}:`, err.message);
      await whatsappClients[pageId].sendMessage(msg.from, '❌ حدث خطأ، جرب مرة تانية!');
    }
  });

  try {
    await whatsappClients[pageId].initialize();
  } catch (err) {
    console.error(`❌ Failed to initialize WhatsApp for ${pageId}:`, err.message);
    delete whatsappClients[pageId];
  }

  return whatsappClients[pageId];
}

async function reconnect(pageId) {
  if (whatsappClients[pageId]) {
    try {
      await whatsappClients[pageId].destroy();
      delete whatsappClients[pageId];
      console.log(`🔄 Attempting to reconnect WhatsApp for ${pageId}`);
      await initializeWhatsAppClient(pageId);
    } catch (err) {
      console.error(`❌ Reconnect failed for ${pageId}:`, err.message);
      setTimeout(() => reconnect(pageId), 30000); // Retry after 30 seconds
    }
  }
}

async function getClient(pageId) {
  if (!whatsappClients[pageId]) {
    return await initializeWhatsAppClient(pageId);
  }
  return whatsappClients[pageId];
}

module.exports = { initializeWhatsAppClient, whatsappClients, getClient };