const userModel = require('../models/userModel');
const { readDatabase, writeDatabase } = require('../models/database');

// Simple password hashing function
const hashPassword = (password) => {
  // Đây là cách mã hóa đơn giản, không nên dùng trong thực tế
  return `hashed_${password}`;
};

// Kiểm tra password
const validatePassword = (inputPassword, storedPassword) => {
  // Cách đơn giản (không nên dùng trong thực tế)
  return storedPassword === `hashed_${inputPassword}`;
};

exports.getUsers = (req, res) => {
  try {
    const { q, page, limit, sort } = req.query;
    const result = userModel.getAllUsers({ q, page: Number(page) || 1, limit: Number(limit) || 10, sort });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = (req, res) => {
  try {
    const user = userModel.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Không trả về password
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = (req, res) => {
  try {
    const { name, email, password, isAdmin = false } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    
    // Kiểm tra email đã tồn tại chưa
    const existingUser = userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Hash password trước khi lưu
    const hashedPassword = hashPassword(password);
    
    // Tạo user mới
    const newUser = userModel.createUser({
      name,
      email,
      password: hashedPassword,
      isAdmin
    });
    
    // Không trả về password
    const { password: pwd, ...userWithoutPassword } = newUser;
    
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateUser = (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, password, role } = req.body;
    const currentUser = req.user; // Assuming you have middleware to attach current user

    // Prevent admin from changing their own role
    if (currentUser.id === userId && currentUser.isAdmin && role !== 'admin') {
      return res.status(403).json({ error: 'Admin không thể tự thay đổi vai trò của mình!' });
    }

    // Validate role
    const validRoles = ['customer', 'employee', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Vai trò không hợp lệ' });
    }

    // Update user
    const updatedUser = userModel.updateUser(userId, { 
      name, 
      email, 
      password, 
      role 
    });

    // Remove sensitive information
    const { password: pwd, ...userWithoutPassword } = updatedUser;
    
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = (req, res) => {
  try {
    const userId = req.params.id;
    const currentUser = req.user; // Assuming you have middleware to attach current user

    // Prevent deleting admin users
    const userToDelete = userModel.getUserById(userId);
    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userToDelete.isAdmin) {
      return res.status(403).json({ error: 'Không thể xóa tài khoản admin!' });
    }

    // Proceed with deletion
    userModel.deleteUser(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Thêm login endpoint
exports.loginUser = (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Tìm user theo email
    const user = userModel.findUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Kiểm tra password
    const isPasswordValid = validatePassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Không trả về password
    const { password: pwd, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add bulk import users function
exports.bulkImportUsers = (req, res) => {
  try {
    const { users } = req.body;
    
    if (!users || !Array.isArray(users)) {
      return res.status(400).json({ error: 'Invalid users data' });
    }
    
    const db = readDatabase();
    
    // Hash passwords before saving
    const processedUsers = users.map(user => ({
      ...user,
      password: user.password ? hashPassword(user.password) : user.password,
      id: user.id || Date.now().toString(),
      createdAt: user.createdAt || new Date().toISOString()
    }));
    
    db.users = processedUsers;
    writeDatabase(db);
    
    res.json({ success: true, count: users.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 