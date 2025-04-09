const express = require('express');
const router = express.Router();
const {
  createRule,
  getRules,
  updateRule,
  deleteRule
} = require('../controllers/rulesController');

const verifyToken = require('../middleware/verifyToken');

// ✅ إنشاء قاعدة جديدة
router.post('/', verifyToken, createRule);

// ✅ جلب القواعد مع فلاتر (botId, type, isGlobal)
router.get('/', verifyToken, getRules);

// ✅ تعديل قاعدة
router.put('/:id', verifyToken, updateRule);

// ✅ حذف قاعدة
router.delete('/:id', verifyToken, deleteRule);

module.exports = router;
