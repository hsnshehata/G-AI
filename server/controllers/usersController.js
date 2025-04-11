const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.createUser = async (req, res) => {
  const { username, password, confirmPassword, role } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'كلمات المرور غير متطابقة' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'اسم المستخدم موجود بالفعل' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, role });

    res.status(201).json({ message: 'تم إنشاء المستخدم بنجاح', user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    let users;
    if (req.user.role === 'superadmin') {
      users = await User.find().populate('bots');
    } else {
      users = await User.findById(req.user.id).populate('bots');
      users = [users]; // Wrap in array to match the expected format
    }
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم حذف المستخدم' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

exports.updateUser = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const updateData = { username, role };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ message: 'تم تحديث المستخدم', user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};
