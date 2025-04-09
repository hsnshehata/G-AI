const createBot = async (req, res) => {
  try {
    const { name, username, password, fbToken, pageId, openaiKey } = req.body;

    if (!name || !username) {
      return res.status(400).json({ error: 'اسم البوت واسم المستخدم مطلوبان' });
    }

    const existingUser = await User.findOne({ username });

    let userId;

    if (existingUser) {
      const botExists = await Bot.findOne({ userId: existingUser._id });

      if (botExists) {
        return res.status(409).json({ error: 'يوجد بالفعل بوت مربوط بهذا المستخدم' });
      }

      userId = existingUser._id;
    } else {
      if (!password) {
        return res.status(400).json({ error: 'كلمة المرور مطلوبة لإنشاء مستخدم جديد' });
      }

      const newUser = new User({
        username,
        password: await bcrypt.hash(password, 10),
        role: 'user'
      });

      await newUser.save();
      userId = newUser._id;
    }

    const newBot = new Bot({
      name,
      userId,
      fbToken,
      pageId,
      openaiKey
    });

    await newBot.save();

    res.status(201).json(newBot);
  } catch (error) {
    console.error('Error creating bot:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء البوت' });
  }
};
