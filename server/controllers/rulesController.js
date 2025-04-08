const Rule = require('../models/Rule');
const Activity = require('../models/Activity');

exports.getRules = async (req, res) => {
  try {
    const { botId } = req.query;

    if (!botId) return res.status(400).json({ error: 'botId is required' });

    const rules = await Rule.find({ pageId: botId });

    res.json({ rules, pageId: botId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
};

// باقي الدوال كما هي
exports.addRule = async (req, res) => {
  try {
    const { keyword, response, pageId } = req.body;
    if (!keyword || !response || !pageId)
      return res.status(400).json({ error: 'Missing fields' });

    const newRule = await Rule.create({ keyword, response, pageId });

    await Activity.create({
      user: req.user.username,
      role: req.user.role,
      botId: pageId,
      action: 'Added Rule',
      details: `Keyword: ${keyword}`
    });

    res.status(201).json({ success: true, rule: newRule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add rule' });
  }
};

exports.updateRule = async (req, res) => {
  try {
    const { keyword, response } = req.body;
    const rule = await Rule.findById(req.params.id);

    if (!rule) return res.status(404).json({ error: 'Rule not found' });

    rule.keyword = keyword;
    rule.response = response;

    await rule.save();

    await Activity.create({
      user: req.user.username,
      role: req.user.role,
      botId: rule.pageId,
      action: 'Updated Rule',
      details: `Rule ID: ${rule._id}`
    });

    res.json({ success: true, rule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update rule' });
  }
};

exports.deleteRule = async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.id);
    if (!rule) return res.status(404).json({ error: 'Rule not found' });

    await rule.deleteOne();

    await Activity.create({
      user: req.user.username,
      role: req.user.role,
      botId: rule.pageId,
      action: 'Deleted Rule',
      details: `Rule ID: ${rule._id}`
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete rule' });
  }
};
