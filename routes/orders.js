const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { readDatabase } = require('../utils/database');

router.get('/', orderController.getOrders);
router.get('/debug', (req, res) => {
  try {
    const db = readDatabase();
    res.json({
      rawOrders: db.orders || [],
      ordersCount: db.orders ? db.orders.length : 0,
      message: 'This is a debug endpoint for checking raw order data'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

module.exports = router; 