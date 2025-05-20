const orderModel = require('../models/orderModel');

exports.getOrders = (req, res) => {
  try {
    console.log("Order controller - getOrders called with query:", req.query);
    const { q, userId, status, page, limit, sort } = req.query;
    
    // Log if any specific filters are being applied
    if (q) console.log(`Filtering by search term: ${q}`);
    if (userId) console.log(`Filtering by userId: ${userId}`);
    if (status) console.log(`Filtering by status: ${status}`);
    
    const result = orderModel.getAllOrders({ q, userId, status, page: Number(page) || 1, limit: Number(limit) || 10, sort });
    
    console.log(`Order controller - returning ${result.orders?.length || 0} orders of total ${result.total || 0}`);
    res.json(result);
  } catch (error) {
    console.error("Order controller error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getOrderById = (req, res) => {
  try {
    const order = orderModel.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createOrder = (req, res) => {
  try {
    const { order } = req.body;
    if (!order) {
      return res.status(400).json({ error: 'Order data is required' });
    }
    const createdOrder = orderModel.createOrder(order);
    res.status(201).json({ success: true, order: createdOrder });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateOrder = (req, res) => {
  try {
    const order = orderModel.updateOrder(req.params.id, req.body);
    res.json({ success: true, order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteOrder = (req, res) => {
  try {
    const order = orderModel.deleteOrder(req.params.id);
    res.json({ success: true, message: 'Order deleted', order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 