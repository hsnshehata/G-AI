const express = require('express');
const router = express.Router();

const {
  getRules,
  createRule,
  deleteRule,
  updateRule // لو عندك تعديل قواعد
} = require('../controllers/rulesController');

// جلب القواعد (الخاصة والعامة)
router.get('/', getRules);

// إضافة قاعدة جديدة
router.post('/', addRule);

// تعديل قاعدة موجودة
router.put('/:id', updateRule);

// حذف قاعدة
router.delete('/:id', deleteRule);

module.exports = router;
