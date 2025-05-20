// Import dữ liệu từ database.json
import databaseData from "../data/database.json";

// Hàm để lưu dữ liệu vào localStorage và database.json
const saveData = async (data) => {
  // Lưu vào localStorage
  localStorage.setItem("databaseData", JSON.stringify(data));

  // Lưu vào database.json thông qua API server
  try {
    // Lưu products
    await fetch("http://localhost:5678/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ products: data.products }),
    });

    // Lưu categories
    await fetch("http://localhost:5678/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ categories: data.categories }),
    });

    // Lưu brands
    await fetch("http://localhost:5678/api/brands", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ brands: data.brands }),
    });

    console.log("Đã lưu dữ liệu vào database.json:", data);
  } catch (error) {
    console.error("Lỗi khi lưu dữ liệu vào database.json:", error);
  }
};

// Hàm để lấy dữ liệu từ localStorage
const getFromLocalStorage = () => {
  const savedData = localStorage.getItem("databaseData");
  return savedData ? JSON.parse(savedData) : null;
};

// Tạo một mock API client để thay thế axios
const mockApiClient = {
  // Lưu trữ dữ liệu cục bộ - ưu tiên dữ liệu từ localStorage nếu có
  database: getFromLocalStorage() || { ...databaseData },

  // Hàm login
  async login(email, password) {
    return new Promise((resolve, reject) => {
      // Tìm user trong database
      const user = this.database.users.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        // Tạo bản sao của user và loại bỏ password
        const { password, ...userWithoutPassword } = { ...user };

        // Trả về dữ liệu user
        setTimeout(() => {
          resolve({ data: { ...userWithoutPassword, isLoggedIn: true } });
        }, 500); // Giả lập độ trễ mạng
      } else {
        // Trả về lỗi
        setTimeout(() => {
          reject({
            response: {
              status: 400,
              data: { message: "Email hoặc mật khẩu không đúng" },
            },
          });
        }, 500);
      }
    });
  },

  // Hàm đăng ký
  async register(name, email, password) {
    return new Promise((resolve, reject) => {
      // Kiểm tra xem email đã tồn tại chưa
      const userExists = this.database.users.some((u) => u.email === email);

      if (userExists) {
        setTimeout(() => {
          reject({
            response: {
              status: 400,
              data: { message: "Email đã được sử dụng" },
            },
          });
        }, 500);
        return;
      }

      // Tạo user mới
      const newUser = {
        id: this.database.users.length + 1,
        name,
        email,
        password,
        isAdmin: false,
        createdAt: new Date().toISOString(),
      };

      // Thêm user vào database
      this.database.users.push(newUser);

      // Lưu dữ liệu vào localStorage và database.json
      saveData(this.database);

      // Trả về dữ liệu user (không có password)
      const { password: _, ...userWithoutPassword } = newUser;
      setTimeout(() => {
        resolve({ data: { ...userWithoutPassword, isLoggedIn: true } });
      }, 500);
    });
  },

  // Hàm lấy danh sách sản phẩm
  async getProducts() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: this.database.products });
      }, 500);
    });
  },

  // Hàm lấy chi tiết sản phẩm
  async getProductById(id) {
    return new Promise((resolve, reject) => {
      const product = this.database.products.find((p) => p.id === parseInt(id));

      if (product) {
        setTimeout(() => {
          resolve({ data: product });
        }, 500);
      } else {
        setTimeout(() => {
          reject({
            response: {
              status: 404,
              data: { message: "Không tìm thấy sản phẩm" },
            },
          });
        }, 500);
      }
    });
  },

  // Hàm lấy thông tin user
  async getUserDetails(id) {
    return new Promise((resolve, reject) => {
      // Nếu id là 'profile', trả về thông tin user đang đăng nhập
      if (id === "profile") {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo) {
          setTimeout(() => {
            reject({
              response: {
                status: 401,
                data: { message: "Không được phép truy cập" },
              },
            });
          }, 500);
          return;
        }

        const user = this.database.users.find((u) => u.id === userInfo.id);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          setTimeout(() => {
            resolve({ data: userWithoutPassword });
          }, 500);
        } else {
          setTimeout(() => {
            reject({
              response: {
                status: 404,
                data: { message: "Không tìm thấy người dùng" },
              },
            });
          }, 500);
        }
      } else {
        // Tìm user theo id
        const user = this.database.users.find((u) => u.id === parseInt(id));

        if (user) {
          const { password, ...userWithoutPassword } = user;
          setTimeout(() => {
            resolve({ data: userWithoutPassword });
          }, 500);
        } else {
          setTimeout(() => {
            reject({
              response: {
                status: 404,
                data: { message: "Không tìm thấy người dùng" },
              },
            });
          }, 500);
        }
      }
    });
  },

  // Hàm lưu categories
  async saveCategories(categories) {
    return new Promise((resolve) => {
      // Cập nhật database
      this.database.categories = categories;

      // Lưu vào localStorage và database.json
      saveData(this.database);

      setTimeout(() => {
        resolve({ data: { success: true, categories } });
      }, 500);
    });
  },

  // Hàm lưu brands
  async saveBrands(brands) {
    return new Promise((resolve) => {
      // Cập nhật database
      this.database.brands = brands;

      // Lưu vào localStorage và database.json
      saveData(this.database);

      setTimeout(() => {
        resolve({ data: { success: true, brands } });
      }, 500);
    });
  },

  // Các phương thức khác có thể được thêm vào khi cần
  async post(url, data, config) {
    if (url === "users/login") {
      return this.login(data.email, data.password);
    } else if (url === "users") {
      return this.register(data.name, data.email, data.password);
    } else if (url === "categories") {
      return this.saveCategories(data.categories);
    } else if (url === "brands") {
      return this.saveBrands(data.brands);
    }
    // Xử lý các endpoint khác nếu cần
    return Promise.reject({
      response: {
        status: 404,
        data: { message: "API không tồn tại" },
      },
    });
  },

  async get(url, config) {
    if (url.startsWith("products")) {
      const id = url.split("/")[1];
      if (id) {
        return this.getProductById(id);
      } else {
        return this.getProducts();
      }
    } else if (url.startsWith("users")) {
      const id = url.split("/")[1];
      return this.getUserDetails(id);
    }
    // Xử lý các endpoint khác nếu cần
    return Promise.reject({
      response: {
        status: 404,
        data: { message: "API không tồn tại" },
      },
    });
  },

  async put(url, data, config) {
    // Xử lý các endpoint PUT nếu cần
    return Promise.reject({
      response: {
        status: 404,
        data: { message: "API không tồn tại" },
      },
    });
  },

  async delete(url, config) {
    // Xử lý các endpoint DELETE nếu cần
    return Promise.reject({
      response: {
        status: 404,
        data: { message: "API không tồn tại" },
      },
    });
  },
};

export default mockApiClient;
