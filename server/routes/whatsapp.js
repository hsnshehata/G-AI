const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const auth = require('../middleware/auth');

// Routes محمية بـ middleware للتأكد من إن المستخدم مسجّل دخول
router.get('/status/:botId', auth, whatsappController.getSessionStatus);
router.post('/connect/:botId', auth, whatsappController.connectWhatsApp);
router.post('/disconnect/:botId', auth, whatsappController.disconnectWhatsApp);

module.exports = router;
