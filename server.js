const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const { readDatabase, writeDatabase, databasePath } = require('./utils/database');

const app = express();
const PORT = process.env.PORT || 5678;

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('public/uploads'));

// Log database path
console.log("Database path:", databasePath);

// API endpoint để kiểm tra kết nối
app.get("/api/ping", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// API endpoint để lấy toàn bộ dữ liệu
app.get("/api/database", (req, res) => {
  const data = readDatabase();
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: "Failed to read database" });
  }
});

// API endpoint để lưu categories
app.post("/api/categories", (req, res) => {
  const { categories } = req.body;

  if (!categories || !Array.isArray(categories)) {
    return res.status(400).json({ error: "Invalid categories data" });
  }

  const data = readDatabase();
  if (!data) {
    return res.status(500).json({ error: "Failed to read database" });
  }

  // Cập nhật categories
  data.categories = categories;

  // Ghi dữ liệu vào file
  if (writeDatabase(data)) {
    res.json({ success: true, categories });
  } else {
    res.status(500).json({ error: "Failed to write database" });
  }
});

// API endpoint để lưu brands
app.post("/api/brands", (req, res) => {
  const { brands } = req.body;

  if (!brands || !Array.isArray(brands)) {
    return res.status(400).json({ error: "Invalid brands data" });
  }

  const data = readDatabase();
  if (!data) {
    return res.status(500).json({ error: "Failed to read database" });
  }

  // Cập nhật brands
  data.brands = brands;

  // Ghi dữ liệu vào file
  if (writeDatabase(data)) {
    res.json({ success: true, brands });
  } else {
    res.status(500).json({ error: "Failed to write database" });
  }
});

// API endpoint để lưu products
app.post("/api/products", (req, res) => {
  const { products } = req.body;

  if (!products || !Array.isArray(products)) {
    return res.status(400).json({ error: "Invalid products data" });
  }

  const data = readDatabase();
  if (!data) {
    return res.status(500).json({ error: "Failed to read database" });
  }

  // Cập nhật products
  data.products = products;

  // Ghi dữ liệu vào file
  if (writeDatabase(data)) {
    res.json({ success: true, products });
  } else {
    res.status(500).json({ error: "Failed to write database" });
  }
});

// Moved to users routes

// Legacy API endpoint removed - now handled by ordersRoute

// Legacy post API endpoint removed - now handled by ordersRoute

// API endpoint for dashboard statistics
app.get("/api/dashboard/stats", (req, res) => {
  try {
    const data = readDatabase();
    if (!data) {
      return res.status(500).json({ error: "Failed to read database" });
    }

    // Calculate dashboard stats
    const totalOrders = data.orders ? data.orders.length : 0;
    const totalProducts = data.products ? data.products.length : 0;
    const totalUsers = data.users ? data.users.length : 0;

    // Calculate total revenue from all completed orders
    const totalRevenue = data.orders
      ? data.orders
        .filter(order => order && order.status === 'delivered')
        .reduce((sum, order) => sum + (order.total || 0), 0)
      : 0;

    // Get recent orders (last 5)
    const recentOrders = data.orders
      ? data.orders
        .filter(order => order !== null && order !== undefined)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5)
        .map(order => ({
          ...order,
          total: order.totalPrice || order.total || 0,
          status: order.status || 'pending',
          createdAt: order.createdAt || new Date().toISOString()
        }))
      : [];

    // Get low stock products (less than 10 items)
    const lowStockProducts = data.products
      ? data.products
        .filter(product => product !== null && product !== undefined && (product.countInStock || 0) < 10)
        .sort((a, b) => (a.countInStock || 0) - (b.countInStock || 0))
        .slice(0, 5)
        .map(product => ({
          ...product,
          countInStock: product.countInStock || 0,
          price: product.price || 0
        }))
      : [];

    res.json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue,
      recentOrders,
      lowStockProducts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
const healthRoute = require('./routes/health');
app.use('/api/health', healthRoute);

// Register all API routes
const usersRoute = require('./routes/users');
app.use('/api/users', usersRoute);

const productsRoute = require('./routes/products');
app.use('/api/products', productsRoute);

const ordersRoute = require('./routes/orders');
app.use('/api/orders', ordersRoute);

const categoriesRoute = require('./routes/categories');
app.use('/api/categories', categoriesRoute);

const brandsRoute = require('./routes/brands');
app.use('/api/brands', brandsRoute);

// Add cart routes
const cartRoute = require('./routes/cart');
app.use('/api/cart', cartRoute);

// Add route for fetching all reviews
const allReviewsRoute = require('./routes/allReviews');
app.use('/api/reviews', allReviewsRoute);

// API endpoint để lấy products
app.get("/api/products", (req, res) => {
  try {
    const data = readDatabase();
    if (!data) {
      return res.status(500).json({ error: "Failed to read database" });
    }

    // Extract query parameters
    const { q, category, brand, page = 1, limit = 10, sort } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Get all products or empty array if none exist
    let products = data.products || [];

    // Apply search filter if 'q' parameter is provided
    if (q) {
      const searchTerm = q.toLowerCase();
      products = products.filter(product => 
        product.name?.toLowerCase().includes(searchTerm) || 
        product.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by category if provided
    if (category) {
      products = products.filter(product => product.category === category);
    }

    // Filter by brand if provided
    if (brand) {
      products = products.filter(product => product.brand === brand);
    }

    // Sort products if sort parameter is provided
    if (sort) {
      if (sort === 'name_asc') {
        products.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sort === 'name_desc') {
        products.sort((a, b) => b.name.localeCompare(a.name));
      } else if (sort === 'price_asc') {
        products.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        products.sort((a, b) => b.price - a.price);
      } else if (sort === 'createdAt_asc') {
        products.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else if (sort === 'createdAt_desc') {
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    }

    // Get total count before pagination
    const total = products.length;

    // Apply pagination
    if (pageNum && limitNum) {
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      products = products.slice(startIndex, endIndex);
    }

    // Return products with total count
    res.json({
      products,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint để lấy brands
app.get("/api/brands", (req, res) => {
  try {
    const data = readDatabase();
    if (!data) {
      return res.status(500).json({ error: "Failed to read database" });
    }
    
    res.json({
      brands: data.brands || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint để lấy categories
app.get("/api/categories", (req, res) => {
  try {
    const data = readDatabase();
    if (!data) {
      return res.status(500).json({ error: "Failed to read database" });
    }
    
    res.json({
      categories: data.categories || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Image upload endpoint
app.post("/api/upload", upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    // Return the full URL of the uploaded image
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: "Error uploading file" });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "build")));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
