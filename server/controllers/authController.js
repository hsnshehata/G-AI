const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// دالة لتسجيل الأحداث في السجل (logs)
const logAction = async (action) => {
  console.log(`📝 ${new Date().toISOString()} - ${action}`);
};

// دالة تسجيل الدخول
exports.login = async (req, res) => {
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

    // التحقق من كلمة المرور
    let isMatch;
    if (typeof user.comparePassword === 'function') {
      // لو فيه دالة comparePassword في المودل
      isMatch = await user.comparePassword(password);
    } else {
      // لو مفيش، نستخدم bcrypt مباشرة
      isMatch = await bcrypt.compare(password, user.password);
    }
    console.log('Password match:', isMatch); // للتأكد إن كلمة المرور متطابقة
    if (!isMatch) {
      return res.status(400).json({ message: 'بيانات تسجيل الدخول غير صحيحة' });
    }

    // توليد الـ token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('Token generated:', token); // للتأكد إن التوكن اتولد

    await logAction(`تسجيل دخول لـ ${username}`);

    res.json({ token, role: user.role, userId: user._id, username: user.username });
  } catch (err) {
    console.error('Error in login:', err); // للتأكد من الخطأ
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

// دالة تسجيل الخروج
exports.logout = async (req, res) => {
  const { username } = req.body;

  console.log('Logout attempt:', { username }); // للتأكد من البيانات اللي بتوصل

  try {
    if (!username) {
      return res.status(400).json({ message: 'اسم المستخدم مطلوب' });
    }

    await logAction(`تسجيل خروج لـ ${username}`);

    res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
  } catch (err) {
    console.error('Error in logout:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};
