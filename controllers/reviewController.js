const reviewModel = require('../models/reviewModel');

exports.getAllReviews = (req, res) => {
  try {
    const { q, page, limit, sort, userId } = req.query;
    const result = reviewModel.getAllReviews({ q, userId, page: Number(page) || 1, limit: Number(limit) || 100, sort });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductReviews = (req, res) => {
  try {
    const { q, page, limit, sort } = req.query;
    const result = reviewModel.getProductReviews(req.params.productId, { q, page: Number(page) || 1, limit: Number(limit) || 10, sort });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addProductReview = (req, res) => {
  try {
    const result = reviewModel.addProductReview(req.params.productId, req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateProductReview = (req, res) => {
  try {
    const review = reviewModel.updateProductReview(req.params.productId, req.params.reviewId, req.body);
    res.json({ success: true, review });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteProductReview = (req, res) => {
  try {
    const review = reviewModel.deleteProductReview(req.params.productId, req.params.reviewId);
    res.json({ success: true, review });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 