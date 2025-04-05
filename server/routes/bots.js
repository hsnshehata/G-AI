const express = require('express');
const router = express.Router();
const { createBot, getBot, updateBot, deleteBot } = require('../controllers/botsController');

// Middleware to restrict to superadmin only
const restrictToSuperadmin = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Unauthorized - Superadmin access required' });
  }
  next();
};

// Create a new bot (Superadmin only)
router.post('/create', restrictToSuperadmin, createBot);

// Get bot details
router.get('/:id', getBot);

// Update bot (Superadmin only)
router.put('/:id', restrictToSuperadmin, updateBot);

// Delete bot (Superadmin only)
router.delete('/:id', restrictToSuperadmin, deleteBot);

module.exports = router;