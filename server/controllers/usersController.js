const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

exports.createUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ error: 'اسم المستخدم مستخدم بالفعل' });
    }

    const pageId = uuidv4();

    const newUser = new User({ username, password, pageId });
    await newUser.save();

    res.status(201).json({ message: 'تم إنشاء المستخدم بنجاح', user: newUser });
  } catch (err) {
    console.error('❌ خطأ في إنشاء المستخدم:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء المستخدم' });
  }
};
