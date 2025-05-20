import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "../services/axiosConfig";

// Tạo context
const AppContext = createContext();

// Custom hook để sử dụng context
export const useAppContext = () => useContext(AppContext);

// Provider component
export const AppProvider = ({ children }) => {
  // User state
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Products state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);
  const [productUpdated, setProductUpdated] = useState(false);

  // Cart state
  const [cartItems, setCartItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("");

  // Load user info from localStorage and products from database.json on mount
  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }

    const storedCartItems = localStorage.getItem("cartItems");
    if (storedCartItems) {
      setCartItems(JSON.parse(storedCartItems));
    }

    const storedShippingAddress = localStorage.getItem("shippingAddress");
    if (storedShippingAddress) {
      setShippingAddress(JSON.parse(storedShippingAddress));
    }

    const storedPaymentMethod = localStorage.getItem("paymentMethod");
    if (storedPaymentMethod) {
      setPaymentMethod(JSON.parse(storedPaymentMethod));
    }

    // Luôn lấy dữ liệu sản phẩm từ database.json
    setProducts(axios.database.products || []);
  }, []);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Save shipping address to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("shippingAddress", JSON.stringify(shippingAddress));
  }, [shippingAddress]);

  // Save payment method to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("paymentMethod", JSON.stringify(paymentMethod));
  }, [paymentMethod]);

  // User actions
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.post("users/login", { email, password });
      setUserInfo(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "An error occurred");
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    setUserInfo(null);
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.post("users", { name, email, password });
      setUserInfo(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "An error occurred");
      throw err;
    }
  };

  // Product actions
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError(null);

      // Luôn lấy dữ liệu từ database.json
      setProducts(axios.database.products || []);

      setProductsLoading(false);
      return axios.database.products || [];
    } catch (err) {
      setProductsLoading(false);
      setProductsError(err.message || "An error occurred");
      throw err;
    }
  };

  const fetchProductById = async (id) => {
    try {
      setProductsLoading(true);
      setProductsError(null);

      // Luôn lấy dữ liệu từ database.json
      const allProducts = axios.database.products || [];

      // Tìm sản phẩm theo id
      const product = allProducts.find((p) => p.id === parseInt(id));

      setProductsLoading(false);

      if (product) {
        return product;
      } else {
        throw new Error("Product not found");
      }
    } catch (err) {
      setProductsLoading(false);
      setProductsError(err.message || "An error occurred");
      throw err;
    }
  };

  // Thêm sản phẩm mới
  const createProduct = async (productData) => {
    try {
      setProductsLoading(true);
      setProductsError(null);

      // Luôn lấy dữ liệu từ database.json
      const allProducts = axios.database.products || [];

      // Tạo sản phẩm mới
      const newProduct = {
        id:
          allProducts.length > 0
            ? Math.max(...allProducts.map((p) => p.id)) + 1
            : 1,
        ...productData,
        rating: 0,
        numReviews: 0,
        createdAt: new Date().toISOString(),
      };

      // Thêm sản phẩm mới vào danh sách
      const updatedProducts = [...allProducts, newProduct];

      // Cập nhật database trong axios
      axios.database.products = updatedProducts;

      // Lưu dữ liệu vào localStorage
      localStorage.setItem("databaseData", JSON.stringify(axios.database));

      // Cập nhật state
      setProducts(updatedProducts);

      setProductsLoading(false);
      setProductUpdated(true);

      return newProduct;
    } catch (err) {
      setProductsLoading(false);
      setProductsError(err.message || "An error occurred");
      throw err;
    }
  };

  // Cập nhật sản phẩm
  const updateProduct = async (id, productData) => {
    try {
      setProductsLoading(true);
      setProductsError(null);

      // Luôn lấy dữ liệu từ database.json
      const allProducts = axios.database.products || [];

      // Tìm sản phẩm theo id
      const productIndex = allProducts.findIndex((p) => p.id === parseInt(id));

      if (productIndex === -1) {
        throw new Error("Product not found");
      }

      // Cập nhật sản phẩm
      const updatedProduct = {
        ...allProducts[productIndex],
        ...productData,
      };

      // Cập nhật danh sách sản phẩm
      const updatedProducts = [...allProducts];
      updatedProducts[productIndex] = updatedProduct;

      // Cập nhật database trong axios
      axios.database.products = updatedProducts;

      // Lưu dữ liệu vào localStorage
      localStorage.setItem("databaseData", JSON.stringify(axios.database));

      // Cập nhật state
      setProducts(updatedProducts);

      setProductsLoading(false);
      setProductUpdated(true);

      return updatedProduct;
    } catch (err) {
      setProductsLoading(false);
      setProductsError(err.message || "An error occurred");
      throw err;
    }
  };

  // Xóa sản phẩm
  const deleteProduct = async (id) => {
    try {
      setProductsLoading(true);
      setProductsError(null);

      // Luôn lấy dữ liệu từ database.json
      const allProducts = axios.database.products || [];

      // Lọc ra sản phẩm cần xóa
      const updatedProducts = allProducts.filter((p) => p.id !== parseInt(id));

      // Cập nhật database trong axios
      axios.database.products = updatedProducts;

      // Lưu dữ liệu vào localStorage
      localStorage.setItem("databaseData", JSON.stringify(axios.database));

      // Cập nhật state
      setProducts(updatedProducts);

      setProductsLoading(false);
      setProductUpdated(true);

      return { success: true };
    } catch (err) {
      setProductsLoading(false);
      setProductsError(err.message || "An error occurred");
      throw err;
    }
  };

  // Cart actions
  const addToCart = (product, qty) => {
    // Sử dụng id hoặc _id của sản phẩm
    const productId = product.id || product._id;

    // Đảm bảo sản phẩm có id
    const productWithId = {
      ...product,
      id: productId,
      product: productId, // Thêm trường product để tương thích với API
    };

    const existItem = cartItems.find(
      (x) => x.id === productId || x.product === productId
    );

    if (existItem) {
      setCartItems(
        cartItems.map((x) =>
          x.id === productId || x.product === productId
            ? { ...x, qty: Number(qty) }
            : x
        )
      );
    } else {
      setCartItems([...cartItems, { ...productWithId, qty: Number(qty) }]);
    }
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((x) => x.id !== id && x.product !== id));
  };

  const saveShippingAddress = (data) => {
    setShippingAddress(data);
    localStorage.setItem("shippingAddress", JSON.stringify(data));
  };

  const savePaymentMethod = (data) => {
    setPaymentMethod(data);
    localStorage.setItem("paymentMethod", JSON.stringify(data));
  };

  // Value object to be provided to consumers
  const contextValue = {
    // User state and actions
    userInfo,
    loading,
    error,
    login,
    logout,
    register,

    // Products state and actions
    products,
    productsLoading,
    productsError,
    productUpdated,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,

    // Cart state and actions
    cartItems,
    addToCart,
    removeFromCart,
    shippingAddress,
    saveShippingAddress,
    paymentMethod,
    savePaymentMethod,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppContext;
