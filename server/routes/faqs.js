const express = require('express');
const router = express.Router();
const { createFaq, getFaqs } = require('../controllers/faqController');

router.post('/', createFaq);
router.get('/', getFaqs);

module.exports = router;
