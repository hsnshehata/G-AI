const User = require('../models/User');

exports.createUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل' });
    }

    const newUser = new User({ username, password });
    await newUser.save();

    res.status(201).json({ message: 'تم إنشاء المستخدم بنجاح' });
  } catch (err) {
    console.error('خطأ في إنشاء المستخدم:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء المستخدم' });
  }
};
