const express = require('express');
const router = express.Router();
const { handleWebhook, verifyWebhook } = require('../controllers/facebookController');

// GET → للتحقق من ربط فيسبوك
router.get('/', verifyWebhook);

// POST → لاستقبال الرسائل
router.post('/', handleWebhook);

module.exports = router;
