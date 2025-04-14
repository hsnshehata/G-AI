const mongoose = require('mongoose');
const { Client, RemoteAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const dotenv = require('dotenv');

dotenv.config();

// إعداد MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// نموذج الجلسات
const WhatsAppSessionSchema = new mongoose.Schema({
  botId: { type: String, required: true, unique: true },
  connected: { type: Boolean, default: false },
  startTime: { type: Date },
  sessionData: { type: Object },
});

const WhatsAppSession = mongoose.model('WhatsAppSession', WhatsAppSessionSchema);

class CustomMongoStore {
  constructor({ clientId }) {
    this.clientId = clientId;
  }

  async sessionExists() {
    try {
      const session = await WhatsAppSession.findOne({ botId: this.clientId });
      return session && session.sessionData ? true : false;
    } catch (err) {
      console.error(`❌ خطأ في التحقق من وجود الجلسة للبوت ${this.clientId}:`, err);
      return false;
    }
  }

  async save(data) {
    try {
      await WhatsAppSession.findOneAndUpdate(
        { botId: this.clientId },
        { sessionData: data },
        { upsert: true }
      );
      console.log(`✅ تم حفظ بيانات الجلسة للبوت ${this.clientId}`);
    } catch (err) {
      console.error(`❌ خطأ في حفظ بيانات الجلسة للبوت ${this.clientId}:`, err);
      throw err;
    }
  }

  async load() {
    try {
      const session = await WhatsAppSession.findOne({ botId: this.clientId });
      return session && session.sessionData ? session.sessionData : null;
    } catch (err) {
      console.error(`❌ خطأ في استرجاع بيانات الجلسة للبوت ${this.clientId}:`, err);
      return null;
    }
  }

  async remove() {
    try {
      await WhatsAppSession.findOneAndUpdate(
        { botId: this.clientId },
        { sessionData: null, connected: false }
      );
      console.log(`✅ تم إزالة بيانات الجلسة للبوت ${this.clientId}`);
    } catch (err) {
      console.error(`❌ خطأ في إزالة بيانات الجلسة للبوت ${this.clientId}:`, err);
      throw err;
    }
  }
}

let clients = new Map();

const createClient = async (botId) => {
  const session = await WhatsAppSession.findOne({ botId });
  const client = new Client({
    authStrategy: new RemoteAuth({
      store: new CustomMongoStore({ clientId: botId }),
      backupSyncIntervalMs: 300000,
      clientId: botId.toString(),
    }),
    puppeteer: {
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  client.on('authenticated', async () => {
    console.log(`✅ تم الاتصال بنجاح للبوت ${botId}`);
    await WhatsAppSession.findOneAndUpdate(
      { botId },
      { connected: true, startTime: new Date() },
      { upsert: true }
    );
  });

  client.on('disconnected', async (reason) => {
    console.log(`❌ تم قطع الاتصال للبوت ${botId}: ${reason}`);
    await WhatsAppSession.findOneAndUpdate(
      { botId },
      { connected: false }
    );
    clients.delete(botId);
  });

  client.on('qr', async (qr) => {
    const qrCode = await QRCode.toDataURL(qr);
    console.log(`🔗 رمز QR للبوت ${botId}: ${qrCode}`);
    // يمكنك إرسال رمز QR إلى الواجهة الأمامية عبر WebSocket أو API
  });

  await client.initialize();
  clients.set(botId, client);
  return client;
};

// مثال: إنشاء عميل لـ botId معين
createClient('67fa0cd2361ef3ecda501d90').catch(err => {
  console.error('❌ خطأ في إنشاء العميل:', err);
});
