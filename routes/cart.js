const express = require('express');
const router = express.Router();
const { readDatabase, writeDatabase } = require('../utils/database');

// Get cart for a user
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const data = readDatabase();
    
    // Check if carts collection exists, if not create it
    if (!data.carts) {
      data.carts = [];
      writeDatabase(data);
    }
    
    // Find cart for the user
    const userCart = data.carts.find(cart => cart.userId === userId);
    
    if (!userCart) {
      return res.json({ cart: { userId, items: [] } });
    }
    
    res.json({ cart: userCart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update cart
router.post('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { items } = req.body;
    
    if (!items) {
      return res.status(400).json({ error: 'Cart items are required' });
    }
    
    const data = readDatabase();
    
    // Initialize carts array if it doesn't exist
    if (!data.carts) {
      data.carts = [];
    }
    
    // Check if cart exists for the user
    const cartIndex = data.carts.findIndex(cart => cart.userId === userId);
    
    if (cartIndex === -1) {
      // Create new cart
      data.carts.push({
        userId,
        items,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Update existing cart
      data.carts[cartIndex] = {
        ...data.carts[cartIndex],
        items,
        updatedAt: new Date().toISOString()
      };
    }
    
    writeDatabase(data);
    
    res.json({ 
      success: true, 
      message: 'Cart updated successfully', 
      cart: { userId, items, updatedAt: new Date().toISOString() } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete cart for a user
router.delete('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const data = readDatabase();
    
    if (!data.carts) {
      return res.json({ success: true, message: 'Cart already empty' });
    }
    
    // Filter out the user's cart
    data.carts = data.carts.filter(cart => cart.userId !== userId);
    
    writeDatabase(data);
    
    res.json({ success: true, message: 'Cart deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add item to cart
router.post('/:userId/items', (req, res) => {
  try {
    const { userId } = req.params;
    const { item } = req.body;
    
    if (!item || !item.product) {
      return res.status(400).json({ error: 'Invalid item data' });
    }
    
    const data = readDatabase();
    
    // Initialize carts array if it doesn't exist
    if (!data.carts) {
      data.carts = [];
    }
    
    // Find cart for the user
    const cartIndex = data.carts.findIndex(cart => cart.userId === userId);
    
    if (cartIndex === -1) {
      // Create new cart with the item
      data.carts.push({
        userId,
        items: [item],
        updatedAt: new Date().toISOString()
      });
    } else {
      // Check if item already exists in cart
      const items = data.carts[cartIndex].items || [];
      const itemIndex = items.findIndex(i => 
        (i.id && i.id === item.id) || 
        (i.product && i.product === item.product)
      );
      
      if (itemIndex === -1) {
        // Add new item to cart
        data.carts[cartIndex].items = [...items, item];
      } else {
        // Update existing item
        data.carts[cartIndex].items[itemIndex] = {
          ...items[itemIndex],
          qty: item.qty
        };
      }
      
      data.carts[cartIndex].updatedAt = new Date().toISOString();
    }
    
    writeDatabase(data);
    
    const updatedCart = data.carts.find(cart => cart.userId === userId);
    
    res.json({ 
      success: true, 
      message: 'Item added to cart', 
      cart: updatedCart 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove item from cart
router.delete('/:userId/items/:itemId', (req, res) => {
  try {
    const { userId, itemId } = req.params;
    const data = readDatabase();
    
    if (!data.carts) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    // Find cart for the user
    const cartIndex = data.carts.findIndex(cart => cart.userId === userId);
    
    if (cartIndex === -1) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    // Remove item from cart
    const items = data.carts[cartIndex].items || [];
    data.carts[cartIndex].items = items.filter(item => 
      (item.id !== itemId) && (item.product !== itemId)
    );
    data.carts[cartIndex].updatedAt = new Date().toISOString();
    
    writeDatabase(data);
    
    res.json({ 
      success: true, 
      message: 'Item removed from cart',
      cart: data.carts[cartIndex]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 