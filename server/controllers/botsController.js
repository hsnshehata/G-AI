const Bot = require('../models/Bot');
const User = require('../models/User');

exports.createBot = async (req, res) => {
  const { name, userId, facebookApiKey, facebookPageId } = req.body;

  try {
    console.log('📝 Creating bot:', { name, userId, facebookApiKey, facebookPageId });

    const bot = await Bot.create({ name, userId, facebookApiKey, facebookPageId });
    await User.findByIdAndUpdate(userId, { $push: { bots: bot._id } }, { new: true });

    console.log('✅ Bot created:', bot);
    res.status(201).json({ message: 'تم إنشاء البوت بنجاح', bot });
  } catch (err) {
    console.error('❌ Error creating bot:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};

exports.getBots = async (req, res) => {
  try {
    console.log('📋 Fetching bots for user:', req.user._id);
    const bots = await Bot.find().populate('userId');
    console.log('✅ Bots fetched:', bots.length);
    res.json(bots);
  } catch (err) {
    console.error('❌ Error fetching bots:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};

exports.deleteBot = async (req, res) => {
  try {
    console.log('🗑️ Deleting bot:', req.params.id);

    const bot = await Bot.findById(req.params.id);
    if (!bot) {
      console.log('❌ Bot not found:', req.params.id);
      return res.status(404).json({ message: 'البوت غير موجود' });
    }

    // حذف البوت من قاعدة البيانات
    await Bot.deleteOne({ _id: req.params.id });

    // تحديث المستخدم بحذف البوت من قائمة البوتات
    await User.findByIdAndUpdate(bot.userId, { $pull: { bots: bot._id } }, { new: true });

    console.log('✅ Bot deleted:', req.params.id);
    res.json({ message: 'تم حذف البوت بنجاح' });
  } catch (err) {
    console.error('❌ Error deleting bot:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};

exports.updateBot = async (req, res) => {
  const { name, facebookApiKey, facebookPageId } = req.body;

  try {
    console.log('✏️ Updating bot:', req.params.id, { name, facebookApiKey, facebookPageId });

    const bot = await Bot.findById(req.params.id);
    if (!bot) {
      console.log('❌ Bot not found:', req.params.id);
      return res.status(404).json({ message: 'البوت غير موجود' });
    }

    const updatedBot = await Bot.findByIdAndUpdate(
      req.params.id,
      { name, facebookApiKey, facebookPageId },
      { new: true, runValidators: true }
    );

    console.log('✅ Bot updated:', updatedBot);
    res.json({ message: 'تم تحديث البوت بنجاح', bot: updatedBot });
  } catch (err) {
    console.error('❌ Error updating bot:', err.message, err.stack);
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};
