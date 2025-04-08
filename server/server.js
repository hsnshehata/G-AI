// server/server.js
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const Config = require('./models/Config');
const OpenAI = require('openai');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Chat = require('./models/Chat');
const { initializeWhatsAppClient } = require('./services/whatsapp');

// مسارات المشروع
const botRoutes = require('./routes/bots');
const chatRoutes = require('./routes/chats');
const ratingRoutes = require('./routes/ratings');
const statRoutes = require('./routes/stats');
const whatsappRoutes = require('./routes/whatsapp');
const configRoutes = require('./routes/config');
const authRoutes = require('./routes/auth');
const rulesRoutes = require('./routes/rules');
const faqRoutes = require('./routes/faq');
const productRoutes = require('./routes/products');
const storeLinkRoutes = require('./routes/storeLink');
const aiRoutes = require('./routes/ai');
const facebookRoutes = require('./routes/facebook');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Webhook لفيسبوك
app.use('/webhook', facebookRoutes);

// التحقق من التوكن
const authenticateToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role || 'user',
    };
    next();
  } catch (err) {
    console.error('خطأ في التحقق من التوكن:', err.message);
    res.status(403).json({ error: 'Invalid token' });
  }
};

// بدء التشغيل
(async () => {
  // الاتصال بقاعدة البيانات
  await connectDB();

  // تحميل إعدادات Config إلى process.env
  const configs = await Config.find();
  configs.forEach(config => {
    process.env[config.key] = config.value;
  });

  // تهيئة OpenAI
  const openai = new OpenAI({ apiKey: process.env.API_KEY });

  // ربط المسارات
  app.use('/auth', authRoutes);
  app.use('/bots', botRoutes);
  app.use('/chats', authenticateToken, chatRoutes);
  app.use('/ratings', authenticateToken, ratingRoutes);
  app.use('/stats', authenticateToken, statRoutes);
  app.use('/whatsapp', authenticateToken, whatsappRoutes);
  app.use('/config', authenticateToken, configRoutes);
  app.use('/rules', authenticateToken, rulesRoutes);
  app.use('/faq', authenticateToken, faqRoutes);
  app.use('/products', authenticateToken, productRoutes);
  app.use('/store-link', authenticateToken, storeLinkRoutes);
  app.use('/ai', aiRoutes);

  // ✅ كود تشخيص botsController.js لو فيه مشكلة في الاستيراد
  if (process.env.DEBUG === 'true') {
    try {
      const controller = require(path.join(__dirname, 'controllers', 'botsController.js'));

      console.log('✅ ملف botsController.js تم استيراده بنجاح');
      console.log('🔍 createBot:', typeof controller.createBot);
      console.log('🔍 listBots:', typeof controller.listBots);
      console.log('🔍 getBotById:', typeof controller.getBotById);
      console.log('🔍 updateBot:', typeof controller.updateBot);
    } catch (err) {
      console.error('❌ فشل تحميل ملف botsController.js');
      console.error(err.message);
    }
  }

  // إرجاع index.html لأي طلب غير معروف
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  // تشغيل السيرفر
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
})();
