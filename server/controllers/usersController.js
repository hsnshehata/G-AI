const User = require('../models/User');
const { v4: uuidv4 } = require('uuid'); // ✅ توليد UUID تلقائي

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

    const pageId = uuidv4(); // ✅ توليد pageId تلقائي

    const newUser = new User({ username, password, pageId });
    await newUser.save();

    res.status(201).json({ message: 'تم إنشاء المستخدم بنجاح', pageId });
  } catch (err) {
    console.error('خطأ في إنشاء المستخدم:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء المستخدم' });
  }
};
