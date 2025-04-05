const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const filter = req.user.role === 'superadmin' ? {} : { botId: req.user.pageId };
    const activities = await Activity.find(filter).sort({ timestamp: -1 }).limit(100);
    res.json(activities);
  } catch (err) {
    console.error('❌ Error fetching activity:', err.message);
    res.status(500).json({ error: 'Error fetching activity' });
  }
});

module.exports = router;
