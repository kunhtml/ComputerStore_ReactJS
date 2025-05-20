const { readDatabase, writeDatabase } = require('./database');

function getAllBrands({ q, page = 1, limit = 20, sort }) {
  const db = readDatabase();
  let brands = db.brands || [];

  // Search
  if (q) {
    const keyword = q.toLowerCase();
    brands = brands.filter(b => b.toLowerCase().includes(keyword));
  }

  // Sort
  if (sort) {
    if (sort === 'name_asc') brands.sort((a, b) => a.localeCompare(b));
    if (sort === 'name_desc') brands.sort((a, b) => b.localeCompare(a));
  }

  // Pagination
  const total = brands.length;
  const start = (page - 1) * limit;
  const end = start + Number(limit);
  const pagedBrands = brands.slice(start, end);

  return { brands: pagedBrands, total };
}

function createBrand(name) {
  const db = readDatabase();
  if (db.brands.includes(name)) {
    throw new Error('Brand đã tồn tại');
  }
  db.brands.push(name);
  writeDatabase(db);
  return name;
}

function updateBrand(oldName, newName) {
  const db = readDatabase();
  const idx = db.brands.findIndex(b => b === oldName);
  if (idx === -1) throw new Error('Không tìm thấy brand');
  if (db.brands.includes(newName)) throw new Error('Brand mới đã tồn tại');
  db.brands[idx] = newName;
  // Update products' brand
  db.products = db.products.map(p => p.brand === oldName ? { ...p, brand: newName } : p);
  writeDatabase(db);
  return newName;
}

function deleteBrand(name) {
  const db = readDatabase();
  const idx = db.brands.findIndex(b => b === name);
  if (idx === -1) throw new Error('Không tìm thấy brand');
  // Không cho xóa nếu còn sản phẩm thuộc brand này
  if (db.products.some(p => p.brand === name)) throw new Error('Không thể xóa brand đang được sử dụng');
  db.brands.splice(idx, 1);
  writeDatabase(db);
  return name;
}

module.exports = {
  getAllBrands,
  createBrand,
  updateBrand,
  deleteBrand,
}; 