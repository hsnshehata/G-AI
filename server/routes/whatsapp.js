const express = require('express');
const router = express.Router();
const { getStatus, connect, disconnect, sendTestMessage } = require('../controllers/whatsappController');

router.get('/status', getStatus);
router.post('/connect', connect);
router.post('/disconnect', disconnect);
router.post('/test-message', sendTestMessage);

module.exports = router;