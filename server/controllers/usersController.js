const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Bot = require('../models/Bot');

exports.createUser = async (req, res) => {
  const { username, password, confirmPassword, role } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'كلمات المرور غير متطابقة' });
  }

  try {
    console.log('📝 Creating user:', { username, role });

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('❌ Username already exists:', username);
      return res.status(400).json({ message: 'اسم المستخدم موجود بالفعل' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, role });

    console.log('✅ User created:', user._id);
    res.status(201).json({ message: 'تم إنشاء المستخدم بنجاح', user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    console.error('❌ Error creating user:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    console.log('📋 Fetching users for user:', req.user._id);
    let users;
    if (req.user.role === 'superadmin') {
      users = await User.find().populate('bots');
    } else {
      users = await User.findById(req.user.id).populate('bots');
      users = [users];
    }
    console.log('✅ Users fetched:', users.length);
    res.json(users);
  } catch (err) {
    console.error('❌ Error fetching users:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
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
};

exports.updateUser = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    console.log('✏️ Updating user:', req.params.id, { username, role });

    const user = await User.findById(req.params.id);
    if (!user) {
      console.log('❌ User not found:', req.params.id);
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    const updateData = { username, role };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    console.log('✅ User updated:', updatedUser._id);
    res.json({ message: 'تم تحديث المستخدم بنجاح', user: { id: updatedUser._id, username: updatedUser.username, role: updatedUser.role } });
  } catch (err) {
    console.error('❌ Error updating user:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};
