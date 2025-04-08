const Rule = require('../models/Rule');

// إرجاع جميع القواعد الخاصة بالبوت
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

// إضافة قاعدة جديدة
exports.addRule = async (req, res) => {
  try {
    const { keyword, response, pageId, ruleType } = req.body;

    const newRule = new Rule({
      keyword,
      response,
      pageId,
      ruleType,
    });

    await newRule.save();
    res.json(newRule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add rule' });
  }
};

// حذف قاعدة
exports.deleteRule = async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.id);

    if (!rule) return res.status(404).json({ error: 'Rule not found' });

    await rule.deleteOne();
    res.json({ message: 'Rule deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete rule' });
  }
};
