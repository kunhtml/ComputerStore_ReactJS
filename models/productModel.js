const { readDatabase, writeDatabase } = require('./database');

function getAllProducts({ q, category, brand, page = 1, limit = 10, sort }) {
  const db = readDatabase();
  let products = db.products || [];

  // Search
  if (q) {
    const keyword = q.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(keyword) ||
      (p.description && p.description.toLowerCase().includes(keyword))
    );
  }

  // Filter
  if (category) {
    products = products.filter(p => p.category === category);
  }
  if (brand) {
    products = products.filter(p => p.brand === brand);
  }

  // Sort
  if (sort) {
    if (sort === 'price_asc') products.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') products.sort((a, b) => b.price - a.price);
    if (sort === 'createdAt_asc') products.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sort === 'createdAt_desc') products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Pagination
  const total = products.length;
  const start = (page - 1) * limit;
  const end = start + Number(limit);
  const pagedProducts = products.slice(start, end);

  return { products: pagedProducts, total };
}

function getProductById(id) {
  const db = readDatabase();
  const product = db.products.find(p => p.id === id);
  
  if (product) {
    // Ensure product has a reviews array
    if (!product.reviews) {
      product.reviews = [];
    }
  }
  
  return product;
}

function createProduct(product) {
  const db = readDatabase();
  product.id = Date.now().toString();
  product.createdAt = new Date().toISOString();
  product.reviews = [];
  db.products.push(product);
  writeDatabase(db);
  return product;
}

function updateProduct(id, update) {
  const db = readDatabase();
  const idx = db.products.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Không tìm thấy sản phẩm');
  db.products[idx] = { ...db.products[idx], ...update };
  writeDatabase(db);
  return db.products[idx];
}

function deleteProduct(id) {
  const db = readDatabase();
  const idx = db.products.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Không tìm thấy sản phẩm');
  const deleted = db.products.splice(idx, 1)[0];
  writeDatabase(db);
  return deleted;
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
}; 