const express = require('express');
const router = express.Router();
const { getConfig, updateConfig } = require('../controllers/configController');
const verifyToken = require('../middleware/auth');

router.get('/:botId', verifyToken, getConfig);
router.post('/:botId/update', verifyToken, updateConfig);

module.exports = router;
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
  