const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { verifyToken, isSuperAdmin } = require('../middleware/verifyToken');

router.use(verifyToken);

router.get('/', usersController.getUsers);
router.post('/', isSuperAdmin, usersController.createUser);
router.delete('/:id', isSuperAdmin, usersController.deleteUser);
router.put('/:id', isSuperAdmin, usersController.updateUser);

module.exports = router;
