const express = require('express');
const router = express.Router();
const { createFaq, getFaqs, deleteFaq } = require('../controllers/faqController');

router.post('/', createFaq);
router.get('/', getFaqs);
router.delete('/:id', deleteFaq); // إضافة endpoint للحذف

module.exports = router;
