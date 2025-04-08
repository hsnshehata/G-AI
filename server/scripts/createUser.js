const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

(async () => {
  try {
    // الاتصال بقاعدة البيانات
    await connectDB();

    const username = 'hsn';
    const password = '662015';
    const role = 'admin';

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم
    const user = new User({
      username,
      password: hashedPassword,
      role,
    });

    await user.save();
    console.log('تم إنشاء المستخدم بنجاح:', user);

    // إغلاق الاتصال
    mongoose.connection.close();
  } catch (err) {
    console.error('خطأ في إنشاء المستخدم:', err);
    mongoose.connection.close();
  }
})();
