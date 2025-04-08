const express = require('express');
const router = express.Router();
const {
  getRules,
  addRule,
  deleteRule
} = require('../controllers/rulesController');

router.get('/', getRules);
router.post('/', addRule);
router.delete('/:id', deleteRule);

module.exports = router;
