const Rule = require('../models/Rule');
const Activity = require('../models/Activity');

exports.getRules = async (req, res) => {
  try {
    const query = req.user.role === 'superadmin' ? {} : { pageId: req.user.pageId };
    const rules = await Rule.find(query);
    res.json({ rules, pageId: req.user.pageId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
};

exports.addRule = async (req, res) => {
  try {
    const { keyword, response, pageId } = req.body;
    if (!keyword || !response || !pageId) return res.status(400).json({ error: 'Missing fields' });

    if (req.user.role !== 'superadmin' && req.user.pageId !== pageId)
      return res.status(403).json({ error: 'Unauthorized' });

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

    if (req.user.role !== 'superadmin' && req.user.pageId !== rule.pageId)
      return res.status(403).json({ error: 'Unauthorized' });

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

    if (req.user.role !== 'superadmin' && req.user.pageId !== rule.pageId)
      return res.status(403).json({ error: 'Unauthorized' });

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
