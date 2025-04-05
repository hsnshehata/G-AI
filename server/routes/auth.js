const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const authenticateToken = require('../middleware/auth'); // إضافة الميدل وير

// إضافة المصادقة للتأكد من صحة التوكن قبل السماح بتسجيل الدخول
router.post('/login', authenticateToken, login);  // استخدام المصادقة للتوكن

module.exports = router;
