const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// إعدادات CORS للسماح بالاتصال من نطاقات معينة (للأمان في الإنتاج)
const allowedOrigins = [
  'http://localhost:3000', // للتطوير
  'https://g-ai-70ea.onrender.com', // النطاق بتاعك على Render
  // أضف أي نطاقات أخرى هنا
];

app.use(
  cors({
    origin: (origin, callback) => {
      // السماح للطلبات بدون origin (مثل الطلبات من Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// إعدادات الـ middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// إعداد الـ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bots', require('./routes/bots'));
app.use('/api/users', require('./routes/users'));
app.use('/api/rules', require('./routes/rules'));
app.use('/api/bot', require('./routes/bot'));
app.use('/webhook', require('./routes/webhook')); // Route لفيسبوك

// Route لصفحة الـ Dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Route للصفحة الرئيسية
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ خطأ في السيرفر:', err.message, err.stack);
  res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
});

// الاتصال بقاعدة البيانات وتشغيل السيرفر
const startServer = async () => {
  try {
    await connectDB(); // الانتظار حتى ينجح الاتصال بقاعدة البيانات
    console.log('✅ MongoDB connected successfully');

    // تشغيل السيرفر بعد نجاح الاتصال
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message, err.stack);
    process.exit(1); // إغلاق السيرفر لو الاتصال فشل
  }
};

// استدعاء دالة تشغيل السيرفر
startServer();

module.exports = app;
