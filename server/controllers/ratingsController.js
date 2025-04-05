const Rating = require('../models/Rating');
const Activity = require('../models/Activity');

exports.getRatings = async (req, res) => {
  const { pageId, type } = req.query;

  try {
    if (!pageId || !type || !['positive', 'negative'].includes(type)) {
      return res.status(400).json({ error: 'pageId and valid type (positive/negative) are required' });
    }

    if (req.user.role !== 'superadmin' && req.user.pageId !== pageId) {
      return res.status(403).json({ error: 'Unauthorized access to these ratings' });
    }

    const ratings = await Rating.find({ botId: pageId, rating: type })
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(ratings);
  } catch (err) {
    console.error(`❌ Error fetching ratings: ${err.message}`);
    res.status(500).json({ error: `Failed to fetch ratings: ${err.message}` });
  }
};

exports.deleteRatings = async (req, res) => {
  const { pageId, type } = req.body;

  try {
    if (!pageId || !type || !['positive', 'negative'].includes(type)) {
      return res.status(400).json({ error: 'pageId and valid type (positive/negative) are required' });
    }

    if (req.user.role !== 'superadmin' && req.user.pageId !== pageId) {
      return res.status(403).json({ error: 'Unauthorized to delete these ratings' });
    }

    await Rating.deleteMany({ botId: pageId, rating: type });

    await Activity.create({
      user: req.user.username,
      role: req.user.role,
      botId: pageId,
      action: 'Deleted Ratings',
      details: `Type: ${type}`
    });

    res.json({ success: true, message: `Deleted ${type} ratings successfully` });
  } catch (err) {
    console.error(`❌ Error deleting ratings: ${err.message}`);
    res.status(500).json({ error: `Failed to delete ratings: ${err.message}` });
  }
};

exports.addRating = async (req, res) => {
  const { pageId, userId, rating, message } = req.body;

  try {
    if (!pageId || !userId || !rating || !['positive', 'negative'].includes(rating)) {
      return res.status(400).json({ error: 'pageId, userId, and valid rating (positive/negative) are required' });
    }

    if (req.user.role !== 'superadmin' && req.user.pageId !== pageId) {
      return res.status(403).json({ error: 'Unauthorized to add rating for this bot' });
    }

    const newRating = await Rating.create({
      botId: pageId,
      userId,
      rating,
      message: message || '',
      timestamp: new Date(),
    });

    await Activity.create({
      user: req.user.username,
      role: req.user.role,
      botId: pageId,
      action: 'Added Rating',
      details: `User: ${userId}, Type: ${rating}`
    });

    res.status(201).json({ success: true, rating: newRating });
  } catch (err) {
    console.error(`❌ Error adding rating: ${err.message}`);
    res.status(500).json({ error: `Failed to add rating: ${err.message}` });
  }
};
