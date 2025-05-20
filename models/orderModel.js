const { readDatabase, writeDatabase } = require('./database');
const path = require('path');
const fs = require('fs');

// Debug function to log database retrieval
const logDatabasePath = () => {
  const dbPath = path.join(__dirname, '../src/data/database.json');
  console.log('Database path used by orderModel:', dbPath);
  console.log('Database exists:', fs.existsSync(dbPath));
};

function getAllOrders({ q, userId, status, page = 1, limit = 10, sort }) {
  logDatabasePath();
  const db = readDatabase();
  
  // Debug: log what we found
  console.log('Raw orders data:', JSON.stringify(db.orders || []));
  console.log('Number of orders found:', db.orders ? db.orders.length : 0);
  
  let orders = db.orders || [];

  // Search
  if (q) {
    const keyword = q.toLowerCase();
    orders = orders.filter(o =>
      (o.id && o.id.toString().includes(keyword)) ||
      (o.userName && o.userName.toLowerCase().includes(keyword))
    );
    console.log('After search filtering, orders count:', orders.length);
  }

  // Filter by userId
  if (userId) {
    orders = orders.filter(o => o.userId === userId);
    console.log('After userId filtering, orders count:', orders.length);
  }
  
  // Filter by status - added null check and case-insensitive comparison
  if (status) {
    orders = orders.filter(o => o.status && o.status.toLowerCase() === status.toLowerCase());
    console.log('After status filtering, orders count:', orders.length);
  }

  // Sort
  if (sort) {
    if (sort === 'createdAt_asc') orders.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    if (sort === 'createdAt_desc') orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    if (sort === 'total_asc') orders.sort((a, b) => parseFloat(a.totalPrice || a.total || 0) - parseFloat(b.totalPrice || b.total || 0));
    if (sort === 'total_desc') orders.sort((a, b) => parseFloat(b.totalPrice || b.total || 0) - parseFloat(a.totalPrice || a.total || 0));
  } else {
    // Default sort by createdAt desc if no sort specified
    orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  // Pagination
  const total = orders.length;
  const start = (page - 1) * limit;
  const end = start + Number(limit);
  const pagedOrders = orders.slice(start, end);

  console.log('Returning orders:', pagedOrders.length, 'of total:', total);
  
  // Log the actual orders being returned for debugging
  console.log('Orders being returned:', JSON.stringify(pagedOrders));
  
  return { orders: pagedOrders, total };
}

function getOrderById(id) {
  const db = readDatabase();
  const order = db.orders ? db.orders.find(o => o.id === id) : null;
  return order;
}

function createOrder(order) {
  const db = readDatabase();
  
  // Initialize orders array if it doesn't exist
  if (!db.orders) {
    db.orders = [];
  }
  
  order.id = Date.now().toString();
  order.createdAt = new Date().toISOString();
  db.orders.push(order);
  writeDatabase(db);
  return order;
}

function updateOrder(id, update) {
  const db = readDatabase();
  
  if (!db.orders) {
    throw new Error('Không tìm thấy danh sách đơn hàng');
  }
  
  const idx = db.orders.findIndex(o => o.id === id);
  if (idx === -1) throw new Error('Không tìm thấy đơn hàng');
  
  db.orders[idx] = { ...db.orders[idx], ...update };
  writeDatabase(db);
  return db.orders[idx];
}

function deleteOrder(id) {
  const db = readDatabase();
  
  if (!db.orders) {
    throw new Error('Không tìm thấy danh sách đơn hàng');
  }
  
  const idx = db.orders.findIndex(o => o.id === id);
  if (idx === -1) throw new Error('Không tìm thấy đơn hàng');
  
  const deleted = db.orders.splice(idx, 1)[0];
  writeDatabase(db);
  return deleted;
}

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
}; 