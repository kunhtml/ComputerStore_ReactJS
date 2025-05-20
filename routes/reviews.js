const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');

router.get('/', reviewController.getProductReviews);
router.post('/', reviewController.addProductReview);
router.put('/:reviewId', reviewController.updateProductReview);
router.delete('/:reviewId', reviewController.deleteProductReview);

module.exports = router; 