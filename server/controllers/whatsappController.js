const WhatsAppStatus = require('../models/WhatsAppStatus');
const { initializeWhatsAppClient, whatsappClients, getClient } = require('../services/whatsapp');

exports.getStatus = async (req, res) => {
  const { pageId } = req.query;

  try {
    // Validate input
    if (!pageId) {
      return res.status(400).json({ error: 'pageId is required' });
    }

    // Restrict access: Superadmin can see all, admin can only see their own status
    if (req.user.role !== 'superadmin' && req.user.pageId !== pageId) {
      return res.status(403).json({ error: 'Unauthorized access to this WhatsApp status' });
    }

    // Fetch status
    const status = await WhatsAppStatus.findOne({ pageId });
    if (!status) {
      return res.status(404).json({ error: 'WhatsApp status not found for this pageId' });
    }

    res.json({
      pageId: status.pageId,
      connected: status.connected,
      lastConnected: status.lastConnected,
      qr: status.qr || null,
    });
  } catch (err) {
    console.error(`❌ Error fetching WhatsApp status: ${err.message}`);
    res.status(500).json({ error: `Failed to fetch WhatsApp status: ${err.message}` });
  }
};

exports.connect = async (req, res) => {
  const { pageId } = req.body;

  try {
    // Validate input
    if (!pageId) {
      return res.status(400).json({ error: 'pageId is required' });
    }

    // Restrict access
    if (req.user.role !== 'superadmin' && req.user.pageId !== pageId) {
      return res.status(403).json({ error: 'Unauthorized to connect this WhatsApp instance' });
    }

    // Check if already connected
    const existingStatus = await WhatsAppStatus.findOne({ pageId });
    if (existingStatus && existingStatus.connected) {
      return res.status(409).json({ error: 'WhatsApp is already connected' });
    }

    // Initialize client and wait for QR
    const client = await initializeWhatsAppClient(pageId);
    client.once('qr', (qr) => {
      res.json({ success: true, qr });
    });

    // Timeout if no QR is generated within 30 seconds
    setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({ error: 'QR code generation timed out' });
      }
    }, 30000);
  } catch (err) {
    console.error(`❌ Error connecting WhatsApp: ${err.message}`);
    res.status(500).json({ error: `Failed to connect WhatsApp: ${err.message}` });
  }
};

exports.disconnect = async (req, res) => {
  const { pageId } = req.body;

  try {
    // Validate input
    if (!pageId) {
      return res.status(400).json({ error: 'pageId is required' });
    }

    // Restrict access
    if (req.user.role !== 'superadmin' && req.user.pageId !== pageId) {
      return res.status(403).json({ error: 'Unauthorized to disconnect this WhatsApp instance' });
    }

    // Check if client exists
    if (!whatsappClients[pageId]) {
      return res.status(404).json({ error: 'No active WhatsApp client found for this pageId' });
    }

    // Destroy client
    await whatsappClients[pageId].destroy();
    delete whatsappClients[pageId];
    await WhatsAppStatus.findOneAndUpdate(
      { pageId },
      { connected: false, qr: null },
      { upsert: true }
    );

    res.json({ success: true, message: 'WhatsApp disconnected successfully' });
  } catch (err) {
    console.error(`❌ Error disconnecting WhatsApp: ${err.message}`);
    res.status(500).json({ error: `Failed to disconnect WhatsApp: ${err.message}` });
  }
};

exports.sendTestMessage = async (req, res) => {
  const { pageId, to, message } = req.body;

  try {
    // Validate input
    if (!pageId || !to || !message) {
      return res.status(400).json({ error: 'pageId, to, and message are required' });
    }

    // Restrict access
    if (req.user.role !== 'superadmin' && req.user.pageId !== pageId) {
      return res.status(403).json({ error: 'Unauthorized to send test message' });
    }

    // Get client
    const client = await getClient(pageId);
    if (!client || !(await WhatsAppStatus.findOne({ pageId })).connected) {
      return res.status(400).json({ error: 'WhatsApp is not connected' });
    }

    // Send message
    await client.sendMessage(to, message);
    res.json({ success: true, message: 'Test message sent successfully' });
  } catch (err) {
    console.error(`❌ Error sending test message: ${err.message}`);
    res.status(500).json({ error: `Failed to send test message: ${err.message}` });
  }
};

module.exports = exports;