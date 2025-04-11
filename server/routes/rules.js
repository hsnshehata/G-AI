const express = require('express');
const router = express.Router();
const { getRules, createRule, updateRule, deleteRule } = require('../controllers/rulesController');
const auth = require('../middleware/auth');

// جلب كل القواعد لبوت معين أو القواعد الثابتة (للسوبر أدمن)
router.get('/', auth, getRules);

// إضافة قاعدة جديدة
router.post('/', auth, createRule);

// تعديل قاعدة موجودة
router.put('/:id', auth, updateRule);

// حذف قاعدة
router.delete('/:id', auth, deleteRule);

module.exports = router;
