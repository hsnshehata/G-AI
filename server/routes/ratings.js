const express = require('express');
const router = express.Router();
const { getRatings, deleteRatings, addRating } = require('../controllers/ratingsController');

router.get('/', getRatings);
router.post('/delete', deleteRatings);
router.post('/add', addRating);

module.exports = router;