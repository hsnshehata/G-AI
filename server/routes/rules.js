const express = require('express');
const router = express.Router();
const {
  getRules,
  createRule,
  deleteRule,
} = require('../controllers/rulesController');

// جلب القواعد (العامة + الخاصة)
router.get('/', getRules);

// إضافة قاعدة
router.post('/', createRule);

// حذف قاعدة
router.delete('/:id', deleteRule);

module.exports = router;
