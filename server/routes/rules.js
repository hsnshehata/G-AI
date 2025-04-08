const express = require('express');
const router = express.Router();

const {
  getRules,
  addRule,
  deleteRule
} = require('../controllers/rulesController');

// جلب القواعد (العامة + الخاصة)
router.get('/', getRules);

// إضافة قاعدة
router.post('/', addRule);

// حذف قاعدة
router.delete('/:id', deleteRule);

module.exports = router;
