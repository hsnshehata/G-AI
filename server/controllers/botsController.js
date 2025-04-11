const Bot = require('../models/Bot');
const User = require('../models/User');

exports.createBot = async (req, res) => {
  const { name, userId, facebookApiKey, facebookPageId } = req.body;

  try {
    const bot = await Bot.create({ name, userId, facebookApiKey, facebookPageId });
    await User.findByIdAndUpdate(userId, { $push: { bots: bot._id } });
    res.status(201).json({ message: 'تم إنشاء البوت بنجاح', bot });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

exports.getBots = async (req, res) => {
  try {
    const bots = await Bot.find().populate('userId');
    res.json(bots);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

exports.deleteBot = async (req, res) => {
  try {
    const bot = await Bot.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(bot.userId, { $pull: { bots: bot._id } });
    res.json({ message: 'تم حذف البوت' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

exports.updateBot = async (req, res) => {
  const { name, facebookApiKey, facebookPageId } = req.body;

  try {
    const bot = await Bot.findByIdAndUpdate(req.params.id, { name, facebookApiKey, facebookPageId }, { new: true });
    res.json({ message: 'تم تحديث البوت', bot });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};
