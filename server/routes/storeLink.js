const express = require('express');
const router = express.Router();
const { createStoreLink, getStoreLink } = require('../controllers/storeLinkController');

router.post('/', createStoreLink);
router.get('/', getStoreLink);

module.exports = router;
