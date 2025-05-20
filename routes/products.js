const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Nested review routes
const reviewRoutes = require('./reviews');
router.use('/:productId/reviews', reviewRoutes);

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router; 