const express = require('express');
const router = express.Router();
const { createStoreLink, getStoreLink, deleteStoreLink } = require('../controllers/storeLinkController');

router.post('/', createStoreLink);
router.get('/', getStoreLink);
router.delete('/:id', deleteStoreLink); // إضافة endpoint للحذف

module.exports = router;
