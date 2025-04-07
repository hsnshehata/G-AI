const express = require('express');
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

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// التحقق من التوكن
const authenticateToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(404).json({ error: 'User not found' });
    next();
  } catch (err) {
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
  const openai = new OpenAI({
    apiKey: process.env.API_KEY,
  });

  // المسارات
  app.use('/auth', authRoutes);                      // تسجيل الدخول
  app.use('/bots', botRoutes);                       // إنشاء وإدارة البوتات
  app.use('/chats', authenticateToken, chatRoutes);  // المحادثات
  app.use('/ratings', authenticateToken, ratingRoutes); // التقييمات
  app.use('/stats', authenticateToken, statRoutes);  // الإحصائيات
  app.use('/whatsapp', authenticateToken, whatsappRoutes); // واتساب
  app.use('/config', authenticateToken, configRoutes);     // الإعدادات
  app.use('/rules', rulesRoutes);                   // القواعد (مفتوحة حاليًا)

  // تشغيل السيرفر
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
})();
