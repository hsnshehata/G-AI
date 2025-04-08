const express = require('express');
const router = express.Router();
const { createProduct, getProducts, deleteProduct } = require('../controllers/productController');

router.post('/', createProduct);
router.get('/', getProducts);
router.delete('/:id', deleteProduct); // إضافة endpoint للحذف

module.exports = router;
