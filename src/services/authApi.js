import axios from 'axios';

const API_URL = 'http://localhost:3001';

// Get all users (admin only)
export const getUsers = async () => {
  const response = await axios.get(`${API_URL}/users`);
  return response.data;
};

// Get user by ID (admin only)
export const getUserById = async (id) => {
  const response = await axios.get(`${API_URL}/users/${id}`);
  return response.data;
};

// Get user by email
export const getUserByEmail = async (email) => {
  const response = await axios.get(`${API_URL}/users?email=${email}`);
  return response.data[0] || null;
};

// Login
export const login = async (email, password) => {
  try {
    // Get user by email
    const response = await axios.get(`${API_URL}/users?email=${email}`);
    const user = response.data[0];
    
    // Check if user exists and password matches
    if (user && user.password === password) {
      // Don't include password in the returned user object
      const { password, ...userWithoutPassword } = user;
      
      // Store user in localStorage
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      return userWithoutPassword;
    }
    
    throw new Error('Invalid email or password');
  } catch (error) {
    throw error;
  }
};

// Register
export const register = async (userData) => {
  try {
    // Check if user with this email already exists
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Get all users to determine the next ID
    const users = await getUsers();
    const nextId = users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;
    
    // Create new user
    const newUser = {
      id: nextId,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: 'customer', // Default role for new users
      active: true,
      createdAt: new Date().toISOString()
    };
    
    // Save user to database
    const response = await axios.post(`${API_URL}/users`, newUser);
    
    // Don't include password in the returned user object
    const { password, ...userWithoutPassword } = response.data;
    
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

// Logout
export const logout = () => {
  localStorage.removeItem('currentUser');
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const userJson = localStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

// Check if user is admin
export const isAdmin = () => {
  const currentUser = getCurrentUser();
  return currentUser && currentUser.role === 'admin';
};

// Update user (admin only or own account)
export const updateUser = async (id, userData) => {
  const response = await axios.put(`${API_URL}/users/${id}`, userData);
  return response.data;
};

// Delete user (admin only)
export const deleteUser = async (id) => {
  await axios.delete(`${API_URL}/users/${id}`);
  return true;
};
