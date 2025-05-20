const { readDatabase, writeDatabase } = require('./database');

function getAllOrders({ q, userId, page = 1, limit = 10, sort }) {
  const db = readDatabase();
  let orders = db.orders || [];

  // Search
  if (q) {
    const keyword = q.toLowerCase();
    orders = orders.filter(o =>
      (o.id && o.id.toString().includes(keyword)) ||
      (o.userName && o.userName.toLowerCase().includes(keyword))
    );
  }

  // Filter by userId
  if (userId) {
    orders = orders.filter(o => o.userId === userId);
  }

  // Sort
  if (sort) {
    if (sort === 'createdAt_asc') orders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sort === 'createdAt_desc') orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === 'total_asc') orders.sort((a, b) => a.total - b.total);
    if (sort === 'total_desc') orders.sort((a, b) => b.total - a.total);
  }

  // Pagination
  const total = orders.length;
  const start = (page - 1) * limit;
  const end = start + Number(limit);
  const pagedOrders = orders.slice(start, end);

  return { orders: pagedOrders, total };
}

function getOrderById(id) {
  const db = readDatabase();
  return db.orders.find(o => o.id === id);
}

function createOrder(order) {
  const db = readDatabase();
  order.id = Date.now().toString();
  order.createdAt = new Date().toISOString();
  db.orders.push(order);
  writeDatabase(db);
  return order;
}

function updateOrder(id, update) {
  const db = readDatabase();
  const idx = db.orders.findIndex(o => o.id === id);
  if (idx === -1) throw new Error('Không tìm thấy đơn hàng');
  db.orders[idx] = { ...db.orders[idx], ...update };
  writeDatabase(db);
  return db.orders[idx];
}

function deleteOrder(id) {
  const db = readDatabase();
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