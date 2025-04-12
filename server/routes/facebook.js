const express = require('express');
const router = express.Router();
const { handleMessage } = require('../controllers/facebookController');

// Webhook لاستقبال الرسائل من فيسبوك
router.post('/', handleMessage);

module.exports = router;
