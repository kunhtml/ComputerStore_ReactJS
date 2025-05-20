const { readDatabase, writeDatabase } = require('./database');

function getProductReviews(productId, { q, page = 1, limit = 10, sort }) {
  const db = readDatabase();
  const product = db.products.find(p => p.id === productId);
  if (!product) throw new Error('Không tìm thấy sản phẩm');
  let reviews = product.reviews || [];

  // Search
  if (q) {
    const keyword = q.toLowerCase();
    reviews = reviews.filter(r =>
      (r.name && r.name.toLowerCase().includes(keyword)) ||
      (r.comment && r.comment.toLowerCase().includes(keyword))
    );
  }

  // Sort
  if (sort) {
    if (sort === 'createdAt_asc') reviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sort === 'createdAt_desc') reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === 'rating_asc') reviews.sort((a, b) => a.rating - b.rating);
    if (sort === 'rating_desc') reviews.sort((a, b) => b.rating - a.rating);
  }

  // Pagination
  const total = reviews.length;
  const start = (page - 1) * limit;
  const end = start + Number(limit);
  const pagedReviews = reviews.slice(start, end);

  return { reviews: pagedReviews, total };
}

function addProductReview(productId, review) {
  const db = readDatabase();
  const product = db.products.find(p => p.id === productId);
  if (!product) throw new Error('Không tìm thấy sản phẩm');
  if (!product.reviews) product.reviews = [];
  review.id = Date.now().toString();
  review.createdAt = new Date().toISOString();
  product.reviews.push(review);
  writeDatabase(db);
  return review;
}

function updateProductReview(productId, reviewId, update) {
  const db = readDatabase();
  const product = db.products.find(p => p.id === productId);
  if (!product) throw new Error('Không tìm thấy sản phẩm');
  const idx = (product.reviews || []).findIndex(r => r.id === reviewId);
  if (idx === -1) throw new Error('Không tìm thấy review');
  product.reviews[idx] = { ...product.reviews[idx], ...update };
  writeDatabase(db);
  return product.reviews[idx];
}

function deleteProductReview(productId, reviewId) {
  const db = readDatabase();
  const product = db.products.find(p => p.id === productId);
  if (!product) throw new Error('Không tìm thấy sản phẩm');
  const idx = (product.reviews || []).findIndex(r => r.id === reviewId);
  if (idx === -1) throw new Error('Không tìm thấy review');
  const deleted = product.reviews.splice(idx, 1)[0];
  writeDatabase(db);
  return deleted;
}

module.exports = {
  getProductReviews,
  addProductReview,
  updateProductReview,
  deleteProductReview,
}; 