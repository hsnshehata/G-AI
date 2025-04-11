const Bot = require('../models/Bot');
const User = require('../models/User');

exports.createBot = async (req, res) => {
  const { name, userId } = req.body;

  try {
    const bot = await Bot.create({ name, userId });
    await User.findByIdAndUpdate(userId, { $push: { bots: bot._id } });
    res.status(201).json({ message: 'Bot created', bot });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBots = async (req, res) => {
  try {
    const bots = await Bot.find().populate('userId');
    res.json(bots);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteBot = async (req, res) => {
  try {
    const bot = await Bot.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(bot.userId, { $pull: { bots: bot._id } });
    res.json({ message: 'Bot deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBot = async (req, res) => {
  const { name } = req.body;

  try {
    const bot = await Bot.findByIdAndUpdate(req.params.id, { name }, { new: true });
    res.json({ message: 'Bot updated', bot });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
