const express = require('express');
const router = express.Router();
const botsController = require('../controllers/botsController');
const { verifyToken, isSuperAdmin } = require('../middleware/verifyToken');

router.use(verifyToken);

router.get('/', botsController.getBots);
router.post('/', isSuperAdmin, botsController.createBot);
router.delete('/:id', isSuperAdmin, botsController.deleteBot);
router.put('/:id', isSuperAdmin, botsController.updateBot);

module.exports = router;
