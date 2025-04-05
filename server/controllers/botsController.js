const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { initializeWhatsAppClient } = require('../services/whatsapp');

exports.createBot = async (req, res) => {
  const { username, password, pageId, pageToken, title, permissions } = req.body;

  try {
    // Validate required fields
    if (!username || !password || !pageId) {
      return res.status(400).json({ error: 'Username, password, and pageId are required' });
    }

    // Check if username or pageId already exists
    const existingUser = await User.findOne({ $or: [{ username }, { pageId }] });
    if (existingUser) {
      return res.status(409).json({ error: 'Username or pageId already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new bot
    const newBot = await User.create({
      username,
      password: hashedPassword,
      pageId,
      pageToken: pageToken || null,
      title: title || `${username}'s Bot`,
      role: 'admin',
      permissions: permissions || { facebook: true, whatsapp: true, web: true },
      chatPageSettings: { color: '#1877f2', logo: null },
      themeColor: '#1877f2',
    });

    // Initialize WhatsApp client if whatsapp permission is enabled
    if (newBot.permissions.whatsapp) {
      await initializeWhatsAppClient(newBot.pageId);
    }

    res.status(201).json({ success: true, bot: newBot });
  } catch (err) {
    console.error(`❌ Error creating bot: ${err.message}`);
    res.status(500).json({ error: `Failed to create bot: ${err.message}` });
  }
};

exports.getBot = async (req, res) => {
  try {
    const bot = await User.findById(req.params.id).select('-password');
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    // Restrict access: Superadmin can see all, admin can only see their own bot
    if (req.user.role !== 'superadmin' && req.user._id.toString() !== bot._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized access to this bot' });
    }

    res.json(bot);
  } catch (err) {
    console.error(`❌ Error fetching bot: ${err.message}`);
    res.status(500).json({ error: `Failed to fetch bot: ${err.message}` });
  }
};

exports.updateBot = async (req, res) => {
  const { username, password, pageId, pageToken, title, permissions, chatPageSettings, themeColor } = req.body;

  try {
    const bot = await User.findById(req.params.id);
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    // Check for conflicts if username or pageId is being changed
    if (username && username !== bot.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) return res.status(409).json({ error: 'Username already in use' });
    }
    if (pageId && pageId !== bot.pageId) {
      const existingPageId = await User.findOne({ pageId });
      if (existingPageId) return res.status(409).json({ error: 'pageId already in use' });
    }

    // Update fields
    bot.username = username || bot.username;
    bot.password = password ? await bcrypt.hash(password, 10) : bot.password;
    bot.pageId = pageId || bot.pageId;
    bot.pageToken = pageToken !== undefined ? pageToken : bot.pageToken;
    bot.title = title || bot.title;
    bot.permissions = permissions || bot.permissions;
    bot.chatPageSettings = chatPageSettings || bot.chatPageSettings;
    bot.themeColor = themeColor || bot.themeColor;

    await bot.save();

    // Reinitialize WhatsApp client if permissions changed
    if (bot.permissions.whatsapp) {
      await initializeWhatsAppClient(bot.pageId);
    }

    res.json({ success: true, bot });
  } catch (err) {
    console.error(`❌ Error updating bot: ${err.message}`);
    res.status(500).json({ error: `Failed to update bot: ${err.message}` });
  }
};

exports.deleteBot = async (req, res) => {
  try {
    const bot = await User.findById(req.params.id);
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    await User.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Bot deleted successfully' });
  } catch (err) {
    console.error(`❌ Error deleting bot: ${err.message}`);
    res.status(500).json({ error: `Failed to delete bot: ${err.message}` });
  }
};

module.exports = exports;