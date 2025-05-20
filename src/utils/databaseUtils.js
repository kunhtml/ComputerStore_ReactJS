/**
 * Utility functions for working with the database.json file
 * Always uses the database.json file in src/data directory
 */
import axios from '../services/axiosConfig';

/**
 * Load data from the database.json file
 * Tries multiple methods to ensure we get the data
 * @returns {Promise<Object>} The database object
 */
export const loadDatabase = async () => {
  try {
    // Method 1: Try to load from the API
    try {
      const response = await axios.get('http://localhost:5678/api/database');
      console.log('Database loaded from API');
      return response.data;
    } catch (apiError) {
      console.warn('Failed to load database from API:', apiError);
      
      // Method 2: Try to load from the public folder
      try {
        const response = await fetch('/database.json');
        const data = await response.json();
        console.log('Database loaded from public folder');
        return data;
      } catch (publicError) {
        console.warn('Failed to load database from public folder:', publicError);
        
        // Method 3: Try to load from src/data directly
        const hardcodedData = {
          "users": [
            {
              "id": 1,
              "name": "Admin User",
              "email": "admin@example.com",
              "password": "123456",
              "isAdmin": true,
              "createdAt": "2023-05-20T00:00:00.000Z"
            },
            {
              "id": 2,
              "name": "John Doe",
              "email": "john@example.com",
              "password": "123456",
              "isAdmin": false,
              "createdAt": "2023-05-20T01:00:00.000Z"
            }
          ],
          "products": [
            {
              "id": 1,
              "name": "Gaming PC Pro",
              "image": "https://via.placeholder.com/600x400?text=Gaming+PC+Pro",
              "brand": "GamingTech",
              "category": "Gaming PC",
              "description": "High performance gaming PC with latest hardware",
              "price": 1999.99,
              "countInStock": 10,
              "rating": 4.5,
              "numReviews": 12
            },
            {
              "id": 2,
              "name": "Office PC Plus",
              "image": "https://via.placeholder.com/600x400?text=Office+PC+Plus",
              "brand": "OfficePro",
              "category": "Office PC",
              "description": "Reliable PC for office and everyday use",
              "price": 899.99,
              "countInStock": 25,
              "rating": 4.0,
              "numReviews": 8
            },
            {
              "id": 3,
              "name": "Content Creator PC",
              "image": "https://via.placeholder.com/600x400?text=Content+Creator+PC",
              "brand": "CreatorPro",
              "category": "Workstation",
              "description": "Powerful workstation for content creation",
              "price": 2499.99,
              "countInStock": 5,
              "rating": 4.8,
              "numReviews": 15
            }
          ],
          "orders": []
        };
        
        console.log('Using hardcoded database data');
        return hardcodedData;
      }
    }
  } catch (error) {
    console.error('All methods to load database failed:', error);
    throw new Error('Failed to load database from all available sources');
  }
};

/**
 * Get all products from the database
 * @returns {Promise<Array>} Array of products
 */
export const getProducts = async () => {
  try {
    const data = await loadDatabase();
    return data.products || [];
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

/**
 * Get all categories from the database
 * @returns {Promise<Array>} Array of unique categories
 */
export const getCategories = async () => {
  try {
    const products = await getProducts();
    return [...new Set(products.map(product => product.category))];
  } catch (error) {
    console.error('Error getting categories:', error);
    return ['Gaming PC', 'Office PC', 'Workstation']; // Default categories
  }
};

/**
 * Get all brands from the database
 * @returns {Promise<Array>} Array of unique brands
 */
export const getBrands = async () => {
  try {
    const products = await getProducts();
    return [...new Set(products.map(product => product.brand))];
  } catch (error) {
    console.error('Error getting brands:', error);
    return ['GamingTech', 'OfficePro', 'CreatorPro']; // Default brands
  }
};

/**
 * Get all orders from the database
 * @returns {Promise<Array>} Array of orders
 */
export const getOrders = async () => {
  try {
    const data = await loadDatabase();
    return data.orders || [];
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
};

/**
 * Get all users from the database
 * @returns {Promise<Array>} Array of users
 */
export const getUsers = async () => {
  try {
    const data = await loadDatabase();
    console.log('Users from database:', data.users);
    return data.users || [];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

/**
 * Get a product by ID
 * @param {number} id Product ID
 * @returns {Promise<Object|null>} Product object or null if not found
 */
export const getProductById = async (id) => {
  try {
    const products = await getProducts();
    return products.find(product => product.id === Number(id)) || null;
  } catch (error) {
    console.error(`Error getting product with ID ${id}:`, error);
    return null;
  }
};

/**
 * Get a user by ID
 * @param {number} id User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
export const getUserById = async (id) => {
  try {
    const users = await getUsers();
    return users.find(user => user.id === Number(id)) || null;
  } catch (error) {
    console.error(`Error getting user with ID ${id}:`, error);
    return null;
  }
};

/**
 * Get an order by ID
 * @param {number} id Order ID
 * @returns {Promise<Object|null>} Order object or null if not found
 */
export const getOrderById = async (id) => {
  try {
    const orders = await getOrders();
    return orders.find(order => order.id === Number(id)) || null;
  } catch (error) {
    console.error(`Error getting order with ID ${id}:`, error);
    return null;
  }
};
