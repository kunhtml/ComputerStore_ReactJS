const productModel = require('../models/productModel');

exports.getProducts = (req, res) => {
  try {
    const { q, category, brand, page, limit, sort } = req.query;
    const result = productModel.getAllProducts({ q, category, brand, page: Number(page) || 1, limit: Number(limit) || 10, sort });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = (req, res) => {
  try {
    const product = productModel.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = (req, res) => {
  try {
    const product = productModel.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateProduct = (req, res) => {
  try {
    const product = productModel.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteProduct = (req, res) => {
  try {
    const product = productModel.deleteProduct(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 