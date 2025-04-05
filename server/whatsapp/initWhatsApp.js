// server/whatsapp/initWhatsApp.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const Session = require('../models/Session');
const Settings = require('../models/Settings');
const Activity = require('../models/Activity');

const clients = {};
const qrCodes = {};
const connectionStatus = {};

async function initializeWhatsAppClient(botId, io) {
  if (clients[botId]) return clients[botId];

  // Get session from DB
  const sessionData = await Session.findOne({ botId });
  const settings = await Settings.findOne({ botId });

  if (!settings || !settings.whatsappEnabled) {
    console.log(`🚫 WhatsApp disabled for bot ${botId}`);
    return null;
  }

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: botId }),
    puppeteer: { headless: true },
  });

  clients[botId] = client;

  client.on('qr', async (qr) => {
    const qrImageUrl = await qrcode.toDataURL(qr);
    qrCodes[botId] = qrImageUrl;
    io.to(botId).emit('qr', qrImageUrl);
    connectionStatus[botId] = 'QR_READY';

    await Activity.create({
      botId,
      action: 'QR Generated',
      user: 'system',
      role: 'system',
      details: 'New QR code generated for WhatsApp',
    });
  });

  client.on('ready', async () => {
    console.log(`✅ WhatsApp connected for ${botId}`);
    connectionStatus[botId] = 'CONNECTED';

    await Session.findOneAndUpdate(
      { botId },
      { connected: true, lastConnected: new Date() },
      { upsert: true }
    );

    await Activity.create({
      botId,
      action: 'WhatsApp Connected',
      user: 'system',
      role: 'system',
      details: 'WhatsApp session connected successfully',
    });

    io.to(botId).emit('status', { status: 'connected' });
  });

  client.on('disconnected', async (reason) => {
    console.log(`❌ WhatsApp disconnected for ${botId}: ${reason}`);
    connectionStatus[botId] = 'DISCONNECTED';

    await Session.findOneAndUpdate(
      { botId },
      { connected: false },
      { upsert: true }
    );

    io.to(botId).emit('status', { status: 'disconnected' });

    await Activity.create({
      botId,
      action: 'WhatsApp Disconnected',
      user: 'system',
      role: 'system',
      details: reason,
    });
  });

  client.initialize();
  return client;
}

function getQR(botId) {
  return qrCodes[botId] || null;
}

function getStatus(botId) {
  return connectionStatus[botId] || 'NOT_INITIALIZED';
}

function resetSession(botId) {
  if (clients[botId]) {
    clients[botId].destroy();
    delete clients[botId];
  }
  delete qrCodes[botId];
  connectionStatus[botId] = 'RESET';
}

module.exports = {
  initializeWhatsAppClient,
  getQR,
  getStatus,
  resetSession,
};
