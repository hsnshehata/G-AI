const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  const { botId, userId, from, to } = req.query;

  const filter = {};
  if (botId) filter.botId = botId;
  if (userId) filter.userId = userId;
  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from);
    if (to) filter.timestamp.$lte = new Date(to);
  }

  // لو مش سوبر أدمن يتقيد بالبروبوت بتاعه
  if (req.user.role !== 'superadmin') {
    filter.botId = req.user.pageId;
  }

  try {
    const chats = await Chat.find(filter).sort({ timestamp: -1 }).limit(200);
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching chats' });
  }
});
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const chat = await Chat.findById(id);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    // تحقق من الصلاحية
    if (req.user.role !== 'superadmin' && req.user.pageId !== chat.botId) {
      return res.status(403).json({ error: 'Unauthorized to delete this message' });
    }

    await Chat.findByIdAndDelete(id);

    await Activity.create({
      user: req.user.username,
      role: req.user.role,
      botId: chat.botId,
      action: 'Deleted Chat',
      details: `Message: ${chat.message}`
    });

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error deleting chat:', err);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

module.exports = router;
