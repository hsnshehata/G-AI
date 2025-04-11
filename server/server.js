const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// إعدادات CORS للسماح بالاتصال من نطاقات مختلفة (مثل فيسبوك)
app.use(cors({
  origin: '*', // يسمح لكل النطاقات (يمكنك تحديد نطاقات معينة للأمان)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// إعدادات الـ middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// الاتصال بقاعدة البيانات
connectDB();

// إعداد الـ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bots', require('./routes/bots'));
app.use('/api/users', require('./routes/users'));
app.use('/api/rules', require('./routes/rules'));
app.use('/api/bot', require('./routes/bot'));
app.use('/api/webhook', require('./routes/webhook')); // إضافة الـ webhook لفيسبوك

// Route لصفحة الـ Dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
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
