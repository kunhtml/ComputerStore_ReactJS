const { readDatabase, writeDatabase } = require('./database');

function getProductReviews(productId, { q, page = 1, limit = 10, sort }) {
  const db = readDatabase();
  
  // Ensure the product exists
  const productExists = db.products.some(p => p.id === productId);
  if (!productExists) throw new Error('Không tìm thấy sản phẩm');
  
  // Get reviews for this product
  let reviews = (db.reviews || []).filter(r => r.productId === productId);

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
  } else {
    // Default sort by newest
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Pagination
  const total = reviews.length;
  const start = (page - 1) * limit;
  const end = start + Number(limit);
  const pagedReviews = reviews.slice(start, end);

  // Calculate average rating
  const ratings = reviews.map(r => r.rating);
  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
    : 0;

  return { 
    reviews: pagedReviews, 
    total,
    numReviews: reviews.length,
    rating: averageRating
  };
}

function addProductReview(productId, review) {
  const db = readDatabase();
  
  // Ensure the product exists
  const productExists = db.products.some(p => p.id === productId);
  if (!productExists) throw new Error('Không tìm thấy sản phẩm');
  
  // Initialize reviews array if it doesn't exist
  if (!db.reviews) db.reviews = [];
  
  // Create review object
  const newReview = {
    ...review,
    productId,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  
  // Add to reviews array
  db.reviews.push(newReview);
  
  // Update product's rating and numReviews
  updateProductRatings(db, productId);
  
  // Save to database
  writeDatabase(db);
  
  // Get updated product with new ratings
  const updatedProduct = db.products.find(p => p.id === productId);
  
  return {
    review: newReview,
    product: updatedProduct
  };
}

function updateProductReview(productId, reviewId, update) {
  const db = readDatabase();
  
  // Find review index
  const idx = (db.reviews || []).findIndex(r => r.id === reviewId && r.productId === productId);
  if (idx === -1) throw new Error('Không tìm thấy review');
  
  // Update review
  db.reviews[idx] = { ...db.reviews[idx], ...update };
  
  // Update product's rating and numReviews
  updateProductRatings(db, productId);
  
  // Save to database
  writeDatabase(db);
  
  return db.reviews[idx];
}

function deleteProductReview(productId, reviewId) {
  const db = readDatabase();
  
  // Find review index
  const idx = (db.reviews || []).findIndex(r => r.id === reviewId && r.productId === productId);
  if (idx === -1) throw new Error('Không tìm thấy review');
  
  // Remove review
  const deleted = db.reviews.splice(idx, 1)[0];
  
  // Update product's rating and numReviews
  updateProductRatings(db, productId);
  
  // Save to database
  writeDatabase(db);
  
  return deleted;
}

// Helper function to update a product's rating and numReviews
function updateProductRatings(db, productId) {
  const reviews = db.reviews.filter(r => r.productId === productId);
  const numReviews = reviews.length;
  
  // Calculate average rating
  const rating = numReviews > 0 
    ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / numReviews 
    : 0;
  
  // Find product index
  const productIdx = db.products.findIndex(p => p.id === productId);
  if (productIdx !== -1) {
    // Update product
    db.products[productIdx] = {
      ...db.products[productIdx],
      rating,
      numReviews
    };
  }
}

function getAllReviews({ q, userId, page = 1, limit = 100, sort }) {
  const db = readDatabase();
  
  // Get all reviews
  let reviews = db.reviews || [];
  
  // Filter by userId if provided
  if (userId) {
    reviews = reviews.filter(r => r.userId === userId);
  }

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
  } else {
    // Default sort by newest
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Pagination
  const total = reviews.length;
  const start = (page - 1) * limit;
  const end = start + Number(limit);
  const pagedReviews = reviews.slice(start, end);

  return { 
    reviews: pagedReviews, 
    total
  };
}

module.exports = {
  getProductReviews,
  addProductReview,
  updateProductReview,
  deleteProductReview,
  getAllReviews,
}; 