const { Client, LocalAuth } = require('whatsapp-web.js');
const WhatsAppSession = require('../models/WhatsAppSession');
const Bot = require('../models/Bot');
const { processMessage } = require('../botEngine');

// تخزين الجلسات المفتوحة في الذاكرة (لكل botId)
const clients = new Map();

exports.getSessionStatus = async (req, res) => {
  const { botId } = req.params;
  const userId = req.user.id; // من الـ middleware

  try {
    // التأكد من إن البوت تابع للمستخدم
    const bot = await Bot.findOne({ _id: botId, createdBy: userId });
    if (!bot) {
      return res.status(404).json({ message: 'البوت غير موجود أو لا يخصك' });
    }

    const session = await WhatsAppSession.findOne({ botId });
    if (!session) {
      return res.status(200).json({ isConnected: false });
    }

    res.status(200).json({
      isConnected: session.isConnected,
      connectedAt: session.connectedAt,
    });
  } catch (err) {
    console.error('❌ خطأ في جلب حالة الجلسة:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

exports.connectWhatsApp = async (req, res) => {
  const { botId } = req.params;
  const userId = req.user.id;

  try {
    // التأكد من إن البوت تابع للمستخدم
    const bot = await Bot.findOne({ _id: botId, createdBy: userId });
    if (!bot) {
      return res.status(404).json({ message: 'البوت غير موجود أو لا يخصك' });
    }

    // التحقق لو فيه جلسة مفتوحة بالفعل
    if (clients.has(botId)) {
      return res.status(400).json({ message: 'الجلسة مفتوحة بالفعل' });
    }

    // إنشاء جلسة جديدة
    const client = new Client({
      authStrategy: new LocalAuth({ clientId: botId }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    // حفظ العميل في الذاكرة
    clients.set(botId, client);

    client.on('qr', async (qr) => {
      console.log('📸 QR Code generated for botId:', botId);
      res.status(200).json({ qr });
    });

    client.on('authenticated', async (session) => {
      console.log('✅ WhatsApp authenticated for botId:', botId);
      await WhatsAppSession.findOneAndUpdate(
        { botId },
        { botId, sessionData: session, connectedAt: new Date(), isConnected: true },
        { upsert: true, new: true }
      );
    });

    client.on('ready', () => {
      console.log('✅ WhatsApp client ready for botId:', botId);
    });

    client.on('disconnected', async (reason) => {
      console.log('❌ WhatsApp disconnected for botId:', botId, 'Reason:', reason);
      await WhatsAppSession.findOneAndUpdate(
        { botId },
        { isConnected: false },
        { new: true }
      );
      clients.delete(botId);
    });

    client.on('message', async (msg) => {
      console.log('💬 WhatsApp message received:', msg);
      const senderId = msg.from;
      const message = msg.body;
      const isImage = msg.hasMedia && msg.type === 'image';
      const isVoice = msg.hasMedia && msg.type === 'audio';

      const reply = await processMessage(botId, senderId, message, isImage, isVoice);
      if (reply) {
        await client.sendMessage(senderId, reply);
        console.log('✅ WhatsApp reply sent:', reply);
      }
    });

    await client.initialize();
  } catch (err) {
    console.error('❌ خطأ في ربط واتساب:', err);
    clients.delete(botId);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

exports.disconnectWhatsApp = async (req, res) => {
  const { botId } = req.params;
  const userId = req.user.id;

  try {
    // التأكد من إن البوت تابع للمستخدم
    const bot = await Bot.findOne({ _id: botId, createdBy: userId });
    if (!bot) {
      return res.status(404).json({ message: 'البوت غير موجود أو لا يخصك' });
    }

    const client = clients.get(botId);
    if (!client) {
      return res.status(400).json({ message: 'لا توجد جلسة مفتوحة' });
    }

    await client.destroy();
    await WhatsAppSession.findOneAndUpdate(
      { botId },
      { isConnected: false },
      { new: true }
    );
    clients.delete(botId);

    console.log('✅ WhatsApp session disconnected for botId:', botId);
    res.status(200).json({ message: 'تم فصل الجلسة بنجاح' });
  } catch (err) {
    console.error('❌ خطأ في فصل الجلسة:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};
