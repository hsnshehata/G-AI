const Faq = require('../models/Faq');

// حفظ سؤال وإجابة جديد
exports.createFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'الرجاء إدخال جميع الحقول المطلوبة' });
    }

    const faq = new Faq({ question, answer });
    await faq.save();
    res.status(201).json(faq);
  } catch (err) {
    console.error('خطأ في حفظ السؤال والإجابة:', err);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
};

// جلب كل الأسئلة والأجوبة
exports.getFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find();
    res.json(faqs);
  } catch (err) {
    console.error('خطأ في جلب الأسئلة والأجوبة:', err);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
};

// حذف سؤال وإجابة
exports.deleteFaq = async (req, res) => {
  try {
    const faqId = req.params.id;
    const faq = await Faq.findByIdAndDelete(faqId);
    if (!faq) {
      return res.status(404).json({ error: 'لم يتم العثور على السؤال والإجابة' });
    }
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) {
    console.error('خطأ في حذف السؤال والإجابة:', err);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
};
