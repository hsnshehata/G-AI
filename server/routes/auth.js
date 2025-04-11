const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log('Login attempt:', { username, password }); // للتأكد من البيانات اللي بتوصل

  if (!username || !password) {
    return res.status(400).json({ message: 'اسم المستخدم وكلمة المرور مطلوبان' });
  }

  try {
    const user = await User.findOne({ username });
    console.log('User found:', user); // للتأكد إن المستخدم موجود
    if (!user) {
      return res.status(400).json({ message: 'بيانات تسجيل الدخول غير صحيحة' });
    }

    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch); // للتأكد إن كلمة المرور متطابقة
    if (!isMatch) {
      return res.status(400).json({ message: 'بيانات تسجيل الدخول غير صحيحة' });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('Token generated:', token); // للتأكد إن التوكن اتولد

    res.json({ token, role: user.role, userId: user._id });
  } catch (err) {
    console.error('Error in login:', err); // للتأكد من الخطأ
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

module.exports = router;
