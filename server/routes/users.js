const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().populate('bots');
    if (req.user.role === 'superadmin') {
      return res.json(users);
    }
    const user = users.find((u) => u._id.toString() === req.user._id.toString());
    res.json([user]);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

router.post('/', auth, async (req, res) => {
  const { username, password, confirmPassword, role } = req.body;

  if (!username || !password || !confirmPassword || !role) {
    return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'كلمات المرور غير متطابقة' });
  }

  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'غير مصرح لك' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'اسم المستخدم موجود بالفعل' });
    }

    const user = new User({ username, password, role });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { username, role } = req.body;

  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'غير مصرح لك' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    user.username = username || user.username;
    user.role = role || user.role;
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'غير مصرح لك' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    await user.remove();
    res.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

module.exports = router;
