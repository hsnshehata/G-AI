const Bot = require('../models/Bot');

exports.getConfig = async (req, res) => {
  const { botId } = req.params;

  try {
    // تحقق من الصلاحيات
    if (req.user.role !== 'superadmin' && req.user.botId !== botId) {
      return res.status(403).json({ error: 'Unauthorized to view config' });
    }

    const bot = await Bot.findById(botId);
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    const config = {
      openaiKey: bot.openaiKey,
      githubToken: bot.githubToken,
      whatsappToken: bot.whatsappToken,
      mongoUri: bot.mongoUri,
      botName: bot.botName,
      botDescription: bot.botDescription,
      active: bot.active
    };

    res.json(config);
  } catch (err) {
    console.error(`❌ Error fetching config: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch config' });
  }
};

exports.updateConfig = async (req, res) => {
  const { botId } = req.params;
  const {
    openaiKey,
    githubToken,
    whatsappToken,
    mongoUri,
    botName,
    botDescription,
    active
  } = req.body;

  try {
    // تحقق من الصلاحيات
    if (req.user.role !== 'superadmin' && req.user.botId !== botId) {
      return res.status(403).json({ error: 'Unauthorized to update config' });
    }

    const updated = await Bot.findByIdAndUpdate(botId, {
      openaiKey,
      githubToken,
      whatsappToken,
      mongoUri,
      botName,
      botDescription,
      active
    }, { new: true });

    if (!updated) return res.status(404).json({ error: 'Bot not found' });

    res.json({ success: true, message: 'Config updated successfully' });
  } catch (err) {
    console.error(`❌ Error updating config: ${err.message}`);
    res.status(500).json({ error: 'Failed to update config' });
  }
};
