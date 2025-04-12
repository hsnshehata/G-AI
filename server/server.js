const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// إعدادات CORS للسماح بالاتصال من نطاقات مختلفة (مثل فيسبوك)
app.use(
  cors({
    origin: '*', // يسمح لكل النطاقات (يمكنك تحديد نطاقات معينة للأمان)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// إعدادات الـ middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// الاتصال بقاعدة البيانات
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// إعداد الـ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bots', require('./routes/bots'));
app.use('/api/users', require('./routes/users'));
app.use('/api/rules', require('./routes/rules'));
app.use('/api/bot', require('./routes/bot'));
app.use('/webhook/facebook', require('./routes/facebook')); // Route لفيسبوك (بدل /api/webhook)
app.use('/api/whatsapp', require('./routes/whatsapp')); // Route لواتساب (محتفظين بيه لكن مركّنينه دلوقتي)

// Route لصفحة الـ Dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Route للصفحة الرئيسية (اختياري)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ خطأ في السيرفر:', err.message, err.stack);
  res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

module.exports = app;
