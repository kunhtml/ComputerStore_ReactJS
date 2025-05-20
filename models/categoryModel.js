const { readDatabase, writeDatabase } = require('./database');

function getAllCategories({ q, page = 1, limit = 20, sort }) {
  const db = readDatabase();
  let categories = db.categories || [];

  // Search
  if (q) {
    const keyword = q.toLowerCase();
    categories = categories.filter(c => c.toLowerCase().includes(keyword));
  }

  // Sort
  if (sort) {
    if (sort === 'name_asc') categories.sort((a, b) => a.localeCompare(b));
    if (sort === 'name_desc') categories.sort((a, b) => b.localeCompare(a));
  }

  // Pagination
  const total = categories.length;
  const start = (page - 1) * limit;
  const end = start + Number(limit);
  const pagedCategories = categories.slice(start, end);

  return { categories: pagedCategories, total };
}

function createCategory(name) {
  const db = readDatabase();
  if (db.categories.includes(name)) {
    throw new Error('Category đã tồn tại');
  }
  db.categories.push(name);
  writeDatabase(db);
  return name;
}

function updateCategory(oldName, newName) {
  const db = readDatabase();
  const idx = db.categories.findIndex(c => c === oldName);
  if (idx === -1) throw new Error('Không tìm thấy category');
  if (db.categories.includes(newName)) throw new Error('Category mới đã tồn tại');
  db.categories[idx] = newName;
  // Update products' category
  db.products = db.products.map(p => p.category === oldName ? { ...p, category: newName } : p);
  writeDatabase(db);
  return newName;
}

function deleteCategory(name) {
  const db = readDatabase();
  const idx = db.categories.findIndex(c => c === name);
  if (idx === -1) throw new Error('Không tìm thấy category');
  // Không cho xóa nếu còn sản phẩm thuộc category này
  if (db.products.some(p => p.category === name)) throw new Error('Không thể xóa category đang được sử dụng');
  db.categories.splice(idx, 1);
  writeDatabase(db);
  return name;
}

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
}; 