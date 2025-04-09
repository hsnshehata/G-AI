const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const connectDB = require('./db');

// استدعاء الراوتات
const authRoutes = require('./routes/auth');
const botRoutes = require('./routes/bots');
const userRoutes = require('./routes/users');

// تحميل المتغيرات من .env
dotenv.config();

// إنشاء السيرفر
const app = express();
const PORT = process.env.PORT || 3000;

// الاتصال بقاعدة البيانات
connectDB();

// ميدل وير
app.use(cors());
app.use(express.json());

// 📂 ملفات الواجهة
app.use(express.static(path.join(__dirname, '../public')));

// 🔐 الراوتات الخاصة بالـ API
app.use('/api/login', authRoutes);
app.use('/api/bots', botRoutes);
app.use('/api/users', userRoutes);

// 🏠 أي مسار غير معروف → يرجّع صفحة تسجيل الدخول
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 🚀 تشغيل السيرفر
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
