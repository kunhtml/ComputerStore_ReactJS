import database from "../data/database.json";

// Hàm trễ để mô phỏng gọi API
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Lưu dữ liệu vào localStorage
const saveToLocalStorage = () => {
  localStorage.setItem("pc_store_db", JSON.stringify(database));
};

// Lấy dữ liệu từ localStorage hoặc sử dụng dữ liệu mặc định
const getDatabase = () => {
  const savedDb = localStorage.getItem("pc_store_db");
  return savedDb ? JSON.parse(savedDb) : database;
};

// API cho sản phẩm
export const fetchProducts = async () => {
  await delay(500); // Giả lập độ trễ mạng
  const db = getDatabase();
  return db.products;
};

export const fetchProductById = async (id) => {
  await delay(500);
  const db = getDatabase();
  const product = db.products.find((p) => p.id === parseInt(id));
  if (!product) {
    throw new Error("Product not found");
  }
  return product;
};

// API cho người dùng
export const login = async (email, password) => {
  await delay(500);
  const db = getDatabase();
  const user = db.users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Tạo một bản sao của user và loại bỏ password
  const { password: _, ...userWithoutPassword } = user;

  // Thêm thông tin đăng nhập
  const userInfo = {
    ...userWithoutPassword,
    isLoggedIn: true,
  };

  // Lưu thông tin đăng nhập
  localStorage.setItem("userInfo", JSON.stringify(userInfo));

  console.log("Login successful:", userInfo);

  return userInfo;
};

export const register = async (name, email, password) => {
  await delay(500);
  const db = getDatabase();

  // Kiểm tra email đã tồn tại chưa
  if (db.users.some((u) => u.email === email)) {
    throw new Error("Email already exists");
  }

  // Tạo user mới
  const newUser = {
    id: db.users.length + 1,
    name,
    email,
    password,
    isAdmin: false,
    createdAt: new Date().toISOString(),
  };

  // Thêm user mới vào database
  db.users.push(newUser);
  saveToLocalStorage();

  // Tự động đăng nhập sau khi đăng ký
  return login(email, password);
};

export const getUserProfile = async () => {
  await delay(500);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  if (!userInfo) {
    throw new Error("Not authenticated");
  }

  const db = getDatabase();
  const user = db.users.find((u) => u.id === userInfo.id);

  if (!user) {
    throw new Error("User not found");
  }

  // Không trả về mật khẩu
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// API cho giỏ hàng
export const addToCart = async (productId, qty) => {
  try {
    const db = getDatabase();
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingItemIndex = cart.findIndex(
      (item) => item.product === productId
    );

    if (existingItemIndex >= 0) {
      // Cập nhật số lượng nếu sản phẩm đã có trong giỏ hàng
      cart[existingItemIndex].qty = qty;
    } else {
      // Thêm sản phẩm mới vào giỏ hàng
      const product = await fetchProductById(productId);
      cart.push({
        product: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        countInStock: product.countInStock,
        qty: qty,
      });
    }

    // Lưu giỏ hàng vào localStorage
    localStorage.setItem("cart", JSON.stringify(cart));
    return cart;
  } catch (error) {
    console.error("Lỗi khi thêm vào giỏ hàng:", error);
    throw error;
  }
};

export const getCart = async () => {
  try {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    return cart;
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
    return [];
  }
};

export const removeFromCart = async (productId) => {
  try {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const updatedCart = cart.filter((item) => item.product !== productId);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    return updatedCart;
  } catch (error) {
    console.error("Lỗi khi xóa khỏi giỏ hàng:", error);
    throw error;
  }
};

// Xuất tất cả các hàm API
export default {
  fetchProducts,
  fetchProductById,
  login,
  register,
  getUserProfile,
  addToCart,
  getCart,
  removeFromCart,
};
