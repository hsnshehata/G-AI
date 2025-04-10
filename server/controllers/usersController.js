const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

exports.createUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '❌ اسم المستخدم وكلمة المرور مطلوبان' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: '⚠️ اسم المستخدم مستخدم من قبل' });
    }

    const pageId = uuidv4(); // توليد Page ID عشوائي

    const newUser = new User({
      username,
      password,
      pageId
    });

    await newUser.save();

    res.status(201).json({
      message: '✅ تم إنشاء المستخدم بنجاح',
      user: {
        username: newUser.username,
        pageId: newUser.pageId,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('❌ خطأ أثناء إنشاء المستخدم:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء المستخدم' });
  }
};
