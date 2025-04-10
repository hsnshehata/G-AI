const User = require('../models/User');

exports.createUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل' });
    }

    const user = new User({ username, password });
    await user.save();

    res.status(201).json({ message: 'تم إنشاء المستخدم بنجاح' });
  } catch (err) {
    console.error('خطأ في إنشاء المستخدم:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء المستخدم' });
  }
};
