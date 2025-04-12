const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    console.log('❌ Missing username or password');
    return res.status(400).json({ message: 'اسم المستخدم وكلمة المرور مطلوبان' });
  }

  try {
    console.log('🔑 Attempting login for user:', username);
    const user = await User.findOne({ username });
    if (!user) {
      console.log('❌ User not found:', username);
      return res.status(400).json({ message: 'المستخدم غير موجود أو كلمة المرور غير صحيحة' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Invalid password for user:', username);
      return res.status(400).json({ message: 'المستخدم غير موجود أو كلمة المرور غير صحيحة' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('✅ Login successful for user:', user._id);
    res.json({ token, role: user.role, userId: user._id, username: user.username });
  } catch (err) {
    console.error('❌ Error during login:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر أثناء تسجيل الدخول' });
  }
});

router.post('/logout', async (req, res) => {
  const { username } = req.body;
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.log('❌ No token provided for logout');
    return res.status(401).json({ message: 'المستخدم غير معروف، لا يوجد token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Logout successful for user:', decoded.username);
    res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
  } catch (err) {
    console.error('❌ Error during logout:', err.message, err.stack);
    res.status(401).json({ message: 'المستخدم غير معروف، الـ token غير صالح' });
  }
});

module.exports = router;
