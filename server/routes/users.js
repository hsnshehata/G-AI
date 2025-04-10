const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Bot = require('../models/Bot');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    console.log('📋 Fetching users for user:', req.user._id);
    const users = await User.find().populate('bots');
    if (req.user.role === 'superadmin') {
      console.log('✅ Returning all users for superadmin:', users.length);
      return res.json(users);
    }
    const user = users.find((u) => u._id.toString() === req.user._id.toString());
    console.log('✅ Returning user:', user._id);
    res.json([user]);
  } catch (err) {
    console.error('❌ Error fetching users:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { username, password, confirmPassword, role } = req.body;

  if (!username || !password || !confirmPassword || !role) {
    console.log('❌ Missing required fields:', { username, role });
    return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
  }

  if (password !== confirmPassword) {
    console.log('❌ Passwords do not match');
    return res.status(400).json({ message: 'كلمات المرور غير متطابقة' });
  }

  if (req.user.role !== 'superadmin') {
    console.log('❌ Unauthorized access:', req.user._id);
    return res.status(403).json({ message: 'غير مصرح لك' });
  }

  try {
    console.log('📝 Creating user:', { username, role });
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('❌ Username already exists:', username);
      return res.status(400).json({ message: 'اسم المستخدم موجود بالفعل' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();

    console.log('✅ User created:', user._id);
    res.status(201).json(user);
  } catch (err) {
    console.error('❌ Error creating user:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { username, role } = req.body;

  if (req.user.role !== 'superadmin') {
    console.log('❌ Unauthorized access:', req.user._id);
    return res.status(403).json({ message: 'غير مصرح لك' });
  }

  try {
    console.log('✏️ Updating user:', req.params.id, { username, role });
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log('❌ User not found:', req.params.id);
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    user.username = username || user.username;
    user.role = role || user.role;
    await user.save();

    console.log('✅ User updated:', user._id);
    res.json(user);
  } catch (err) {
    console.error('❌ Error updating user:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'superadmin') {
    console.log('❌ Unauthorized access:', req.user._id);
    return res.status(403).json({ message: 'غير مصرح لك' });
  }

  try {
    console.log('🗑️ Deleting user:', req.params.id);
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log('❌ User not found:', req.params.id);
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // حذف كل البوتات المرتبطة بالمستخدم
    await Bot.deleteMany({ userId: user._id });
    console.log('✅ Deleted bots for user:', user._id);

    // حذف المستخدم
    await User.deleteOne({ _id: req.params.id });

    console.log('✅ User deleted:', req.params.id);
    res.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (err) {
    console.error('❌ Error deleting user:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
});

module.exports = router;
