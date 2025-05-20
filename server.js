const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5678;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Đường dẫn đến file database.json
const databasePath = path.join(__dirname, "src", "data", "database.json");
console.log("Database path:", databasePath);

// Hàm đọc dữ liệu từ database.json
const readDatabase = () => {
  try {
    const data = fs.readFileSync(databasePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return null;
  }
};

// Hàm ghi dữ liệu vào database.json
const writeDatabase = (data) => {
  try {
    // Kiểm tra xem thư mục có tồn tại không
    const dirPath = path.dirname(databasePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    }

    // Ghi dữ liệu vào file
    fs.writeFileSync(databasePath, JSON.stringify(data, null, 2), "utf8");
    console.log(`Successfully wrote to database.json: ${databasePath}`);
    return true;
  } catch (error) {
    console.error("Error writing database:", error);
    return false;
  }
};

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

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "build")));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
