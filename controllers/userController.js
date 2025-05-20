const userModel = require('../models/userModel');

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
    // Nếu có cập nhật password, hash nó
    if (req.body.password) {
      req.body.password = hashPassword(req.body.password);
    }
    
    const user = userModel.updateUser(req.params.id, req.body);
    
    // Không trả về password
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = (req, res) => {
  try {
    const user = userModel.deleteUser(req.params.id);
    
    // Không trả về password
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ error: error.message });
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