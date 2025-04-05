const express = require('express');
const router = express.Router();
const { getStatsSummary, exportStats } = require('../controllers/statsController');

router.get('/summary', getStatsSummary);
router.get('/export', exportStats);

module.exports = router;