const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const User = require('../models/User');
const { createUser } = require('../controllers/usersController');

// ✅ جلب المستخدمين
router.get('/', verifyToken, async (req, res) => {
  try {
    const users = await User.find({}, 'username role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'فشل في جلب المستخدمين' });
  }
});

// ✅ إنشاء مستخدم جديد
router.post('/create', verifyToken, createUser);

module.exports = router;
