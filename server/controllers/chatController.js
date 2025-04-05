const Chat = require('../models/Chat');
const Activity = require('../models/Activity');

// 📥 عرض الرسائل مع فلترة حسب البوت، المستخدم أو التاريخ
exports.getChats = async (req, res) => {
  try {
    const { pageId, userId, from, to } = req.query;

    const query = {};
    if (req.user.role !== 'superadmin') query.botId = req.user.pageId;
    else if (pageId) query.botId = pageId;
    if (userId) query.userId = userId;
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    const chats = await Chat.find(query).sort({ timestamp: -1 }).limit(200);
    res.json(chats);
  } catch (err) {
    console.error('❌ Error loading chats:', err.message);
    res.status(500).json({ error: 'Failed to load chats' });
  }
};

// 🗑️ حذف رسالة واحدة فقط
exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    // التحقق من الصلاحيات
    if (req.user.role !== 'superadmin' && chat.botId !== req.user.pageId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Chat.findByIdAndDelete(chatId);

    await Activity.create({
      user: req.user.username,
      role: req.user.role,
      botId: chat.botId,
      action: 'Deleted Chat Message',
      details: `Message: ${chat.message}, User: ${chat.userId}`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error deleting chat:', err.message);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
};

// ↩️ إرسال الرد مرة تانية يدويًا (مكان ما كنا هنوصله)
exports.resendChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    if (req.user.role !== 'superadmin' && chat.botId !== req.user.pageId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // هنا هيتم إرسال الرسالة من جديد، لكن محتاجين ربط مع نظام البوت سواء Facebook, WhatsApp, Web
    // مؤقتًا نرجّع نفس الرسالة
    res.json({ success: true, message: `Resend not yet implemented`, chat });
  } catch (err) {
    console.error('❌ Error resending chat:', err.message);
    res.status(500).json({ error: 'Failed to resend chat' });
  }
};
