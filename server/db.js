const mongoose = require('mongoose');

// دالة لمحاولة الاتصال بـ MongoDB مع إعادة المحاولة
const connectDB = async () => {
  const maxRetries = 5; // عدد المحاولات القصوى
  const retryInterval = 5000; // الوقت بين كل محاولة (5 ثواني)

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // التحقق من وجود MONGODB_URI
      if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }

      console.log(`📡 Attempting to connect to MongoDB (Attempt ${attempt}/${maxRetries})...`);

      // الاتصال بـ MongoDB
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // الوقت المسموح لاختيار السيرفر
      });

      console.log('✅ MongoDB connected successfully');
      break; // الخروج من الحلقة لو الاتصال نجح
    } catch (err) {
      console.error(`❌ MongoDB connection error (Attempt ${attempt}/${maxRetries}):`, err.message, err.stack);

      if (attempt === maxRetries) {
        console.error('❌ Max retries reached. Exiting process...');
        process.exit(1); // الخروج لو وصلنا لآخر محاولة وفشلنا
      }

      console.log(`⏳ Retrying in ${retryInterval / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, retryInterval)); // الانتظار قبل المحاولة التالية
    }
  }

  // مراقبة حالة الاتصال
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected! Attempting to reconnect...');
    // يمكنك هنا إضافة منطق لإعادة الاتصال تلقائيًا
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected successfully');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message, err.stack);
  });
};

module.exports = connectDB;
