const express = require('express');
const router = express.Router();
const {
  getFaqs,
  addFaq,
  deleteFaq,
  toggleFaq,
  suggestAnswer,
} = require('../controllers/faqsController');

// ✅ جلب الأسئلة
router.get('/', getFaqs);

// ✅ إضافة سؤال
router.post('/add', addFaq);

// ✅ حذف سؤال
router.delete('/:id', deleteFaq);

// ✅ تفعيل/تعطيل سؤال
router.patch('/toggle/:id', toggleFaq);

// ✅ اقتراح إجابة تلقائية باستخدام GPT
router.post('/suggest', suggestAnswer);

module.exports = router;
