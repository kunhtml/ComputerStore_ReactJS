const orderModel = require('../models/orderModel');

exports.getOrders = (req, res) => {
  try {
    const { q, userId, page, limit, sort } = req.query;
    const result = orderModel.getAllOrders({ q, userId, page: Number(page) || 1, limit: Number(limit) || 10, sort });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrderById = (req, res) => {
  try {
    const order = orderModel.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createOrder = (req, res) => {
  try {
    const order = orderModel.createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateOrder = (req, res) => {
  try {
    const order = orderModel.updateOrder(req.params.id, req.body);
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteOrder = (req, res) => {
  try {
    const order = orderModel.deleteOrder(req.params.id);
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 