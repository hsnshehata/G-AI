const Activity = require('../models/Activity');

exports.getActivityLog = async (req, res) => {
  const { pageId } = req.query;

  try {
    // المشرف العادي يقدر يشوف نشاط البوت بتاعه فقط
    if (req.user.role !== 'superadmin' && req.user.pageId !== pageId) {
      return res.status(403).json({ error: 'Unauthorized access to activity logs' });
    }

    const filter = req.user.role === 'superadmin' ? {} : { botId: pageId };

    const logs = await Activity.find(filter).sort({ timestamp: -1 }).limit(100);

    res.json(logs);
  } catch (err) {
    console.error('❌ Error fetching activity log:', err.message);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
};
