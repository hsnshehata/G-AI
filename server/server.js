const express = require('express');
const connectDB = require('./config/db');
const Config = require('./models/Config');
const OpenAI = require('openai');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Chat = require('./models/Chat');
const { initializeWhatsAppClient } = require('./services/whatsapp');
const aiRoutes = require('./routes/ai');

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
app.use('/webhook', require('./routes/facebook'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// التحقق من التوكن
const authenticateToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // محاكاة المستخدم لأنك مش بتستخدم قاعدة بيانات حقيقية للمستخدمين
    req.user = { id: decoded.id, username: decoded.username, role: decoded.role };
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
  app.use('/rules', authenticateToken, rulesRoutes);       // القواعد (محمية دلوقتي)
  app.use('/ai', aiRoutes); // إضافة مسارات الذكاء الاصطناعي

  // تشغيل السيرفر
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
})();
