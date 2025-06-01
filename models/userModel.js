const { readDatabase, writeDatabase } = require('./database');

function getAllUsers({ q, page = 1, limit = 10, sort }) {
  const db = readDatabase();
  let users = db.users || [];

  // Search
  if (q) {
    const keyword = q.toLowerCase();
    users = users.filter(u =>
      u.name.toLowerCase().includes(keyword) ||
      u.email.toLowerCase().includes(keyword)
    );
  }

  // Sort
  if (sort) {
    if (sort === 'name_asc') users.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'name_desc') users.sort((a, b) => b.name.localeCompare(a.name));
    if (sort === 'createdAt_asc') users.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sort === 'createdAt_desc') users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Pagination
  const total = users.length;
  const start = (page - 1) * limit;
  const end = start + Number(limit);
  const pagedUsers = users.slice(start, end);

  return { users: pagedUsers, total };
}

function getUserById(id) {
  const db = readDatabase();
  return db.users.find(u => u.id === id);
}

function createUser(user) {
  const db = readDatabase();
  if (db.users.some(u => u.email === user.email)) {
    throw new Error('Email đã tồn tại');
  }
  user.id = Date.now().toString();
  user.createdAt = new Date().toISOString();
  db.users.push(user);
  writeDatabase(db);
  return user;
}

function updateUser(id, update) {
  const db = readDatabase();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) throw new Error('Không tìm thấy user');

  // Merge existing user data with new data
  const updatedUser = {
    ...db.users[idx],
    ...update
  };

  // Validate role if provided
  const validRoles = ['customer', 'employee', 'admin'];
  if (update.role && !validRoles.includes(update.role)) {
    throw new Error('Invalid role');
  }

  // Prevent changing admin role
  if (db.users[idx].isAdmin && update.role !== 'admin') {
    throw new Error('Cannot change admin role');
  }

  // Update users array
  db.users[idx] = updatedUser;
  writeDatabase(db);

  return updatedUser;
}

function deleteUser(id) {
  const db = readDatabase();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) throw new Error('Không tìm thấy user');

  // Prevent deleting admin users
  if (db.users[idx].isAdmin) {
    throw new Error('Cannot delete admin user');
  }

  // Remove user
  const deleted = db.users.splice(idx, 1)[0];
  writeDatabase(db);

  return deleted;
}

function findUserByEmail(email) {
  const db = readDatabase();
  return db.users.find(u => u.email === email);
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  findUserByEmail,
}; 