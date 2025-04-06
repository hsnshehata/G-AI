const express = require('express');
const router = express.Router();
const {
  getRules,
  addRule,
  updateRule,
  deleteRule
} = require('../controllers/rulesController');

const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', getRules);
router.post('/', addRule);
router.put('/:id', updateRule);
router.delete('/:id', deleteRule);

module.exports = router;
