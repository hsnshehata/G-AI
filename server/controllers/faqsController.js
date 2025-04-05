const Faq = require('../models/Faq');
const Activity = require('../models/Activity');
const { generateAIResponse } = require('../services/openai'); // استدعاء الخدمة اللي بتولّد الإجابة

// إضافة سؤال جديد
exports.addFaq = async (req, res) => {
  const { botId, question, answer } = req.body;

  try {
    if (!botId || !question || !answer) {
      return res.status(400).json({ error: 'botId, question, and answer are required.' });
    }

    if (req.user.role !== 'superadmin' && req.user.pageId !== botId) {
      return res.status(403).json({ error: 'Unauthorized to add FAQ.' });
    }

    const faq = await Faq.create({ botId, question, answer });

    await Activity.create({
      user: req.user.username,
      role: req.user.role,
      botId,
      action: 'Added FAQ',
      details: `Question: ${question}`,
    });

    res.status(201).json({ success: true, faq });
  } catch (err) {
    console.error(`❌ Error adding FAQ: ${err.message}`);
    res.status(500).json({ error: 'Failed to add FAQ.' });
  }
};

// تحديث سؤال موجود
exports.updateFaq = async (req, res) => {
  const { faqId } = req.params;
  const { question, answer } = req.body;

  try {
    const faq = await Faq.findById(faqId);
    if (!faq) return res.status(404).json({ error: 'FAQ not found.' });

    if (req.user.role !== 'superadmin' && req.user.pageId !== faq.botId) {
      return res.status(403).json({ error: 'Unauthorized to update FAQ.' });
    }

    faq.question = question || faq.question;
    faq.answer = answer || faq.answer;
    await faq.save();

    await Activity.create({
      user: req.user.username,
      role: req.user.role,
      botId: faq.botId,
      action: 'Updated FAQ',
      details: `Updated Question: ${faq.question}`,
    });

    res.json({ success: true, faq });
  } catch (err) {
    console.error(`❌ Error updating FAQ: ${err.message}`);
    res.status(500).json({ error: 'Failed to update FAQ.' });
  }
};

// حذف سؤال موجود
exports.deleteFaq = async (req, res) => {
  const { faqId } = req.params;

  try {
    const faq = await Faq.findById(faqId);
    if (!faq) return res.status(404).json({ error: 'FAQ not found.' });

    if (req.user.role !== 'superadmin' && req.user.pageId !== faq.botId) {
      return res.status(403).json({ error: 'Unauthorized to delete FAQ.' });
    }

    await Faq.findByIdAndDelete(faqId);

    await Activity.create({
      user: req.user.username,
      role: req.user.role,
      botId: faq.botId,
      action: 'Deleted FAQ',
      details: `Deleted Question: ${faq.question}`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(`❌ Error deleting FAQ: ${err.message}`);
    res.status(500).json({ error: 'Failed to delete FAQ.' });
  }
};

// جلب كل الأسئلة لبوت معين
exports.getFaqs = async (req, res) => {
  const { botId } = req.params;

  try {
    if (req.user.role !== 'superadmin' && req.user.pageId !== botId) {
      return res.status(403).json({ error: 'Unauthorized to view FAQs.' });
    }

    const faqs = await Faq.find({ botId }).sort({ createdAt: -1 });

    res.json(faqs);
  } catch (err) {
    console.error(`❌ Error fetching FAQs: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch FAQs.' });
  }
};

// تفعيل/تعطيل سؤال
exports.toggleFaq = async (req, res) => {
  const { id } = req.params;

  try {
    const faq = await Faq.findById(id);
    if (!faq) return res.status(404).json({ error: 'FAQ not found.' });

    faq.active = !faq.active; // toggle active status
    await faq.save();

    await Activity.create({
      user: req.user.username,
      role: req.user.role,
      botId: faq.botId,
      action: faq.active ? 'Activated FAQ' : 'Deactivated FAQ',
      details: `Question: ${faq.question}`,
    });

    res.json({ success: true, active: faq.active });
  } catch (err) {
    console.error(`❌ Error toggling FAQ: ${err.message}`);
    res.status(500).json({ error: 'Failed to toggle FAQ.' });
  }
};

// اقتراح إجابة باستخدام GPT
exports.suggestAnswer = async (req, res) => {
  const { question } = req.body;

  try {
    if (!question) return res.status(400).json({ error: 'Question is required.' });

    const aiAnswer = await generateAIResponse(question);

    res.json({ success: true, suggestedAnswer: aiAnswer });
  } catch (err) {
    console.error(`❌ Error generating suggested answer: ${err.message}`);
    res.status(500).json({ error: 'Failed to generate suggested answer.' });
  }
};