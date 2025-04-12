// server/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db'); // تأكد أن المسار ده صحيح حسب مكان ملف connectDB.js

// استدعاء المسارات (أضف أو احذف حسب مشروعك)
const botRoutes = require('./routes/bots');
const chatRoutes = require('./routes/chats');
const ratingRoutes = require('./routes/ratings');
const statRoutes = require('./routes/stats');
const whatsappRoutes = require('./routes/whatsapp');
const configRoutes = require('./routes/config');

const app = express();

// ميدل وير
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// الاتصال بقاعدة البيانات
connectDB();

// ربط المسارات
app.use('/bots', botRoutes);
app.use('/chats', chatRoutes);
app.use('/ratings', ratingRoutes);
app.use('/stats', statRoutes);
app.use('/whatsapp', whatsappRoutes);
app.use('/config', configRoutes);

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
