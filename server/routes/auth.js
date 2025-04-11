const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route لتسجيل الدخول
router.post('/login', authController.login);

// Route لتسجيل الخروج
router.post('/logout', authController.logout);

module.exports = router;
