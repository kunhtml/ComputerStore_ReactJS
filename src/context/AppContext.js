import React, { createContext, useState, useContext, useEffect } from "react";

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

  // Cart state
  const [cartItems, setCartItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("");

  // Load user info from localStorage and cart on mount
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
      const response = await fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      setUserInfo(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message || "An error occurred");
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
      const response = await fetch('http://localhost:5678/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      setUserInfo(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message || "An error occurred");
      throw err;
    }
  };

  // Product actions
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError(null);
      const response = await fetch('http://localhost:5678/api/products');
      const data = await response.json();
      setProducts(data.products || []);
      setProductsLoading(false);
      return data.products || [];
    } catch (err) {
      setProductsLoading(false);
      setProductsError('Failed to load products');
      throw err;
    }
  };

  // Cart actions
  const addToCart = async (product, qty) => {
    // Ensure we have the product id
    const productId = product.id || product._id;

    // Create a product object with proper ID
    const productWithId = {
      ...product,
      id: productId,
      product: productId, // Add product field for compatibility
    };

    const existItem = cartItems.find(
      (x) => x.id === productId || x.product === productId
    );

    let updatedCartItems;
    
    if (existItem) {
      updatedCartItems = cartItems.map((x) =>
        x.id === productId || x.product === productId
          ? { ...x, qty: Number(qty) }
          : x
      );
    } else {
      updatedCartItems = [...cartItems, { ...productWithId, qty: Number(qty) }];
    }
    
    // Update local state first for better UX
    setCartItems(updatedCartItems);
    
    // Then sync with backend if user is logged in
    if (userInfo && userInfo.id) {
      try {
        await fetch(`http://localhost:5678/api/cart/${userInfo.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ items: updatedCartItems })
        });
      } catch (error) {
        console.error('Error syncing cart with server:', error);
      }
    }
  };

  const removeFromCart = async (id) => {
    const updatedCartItems = cartItems.filter((x) => x.id !== id && x.product !== id);
    
    // Update local state first
    setCartItems(updatedCartItems);
    
    // Then sync with backend if user is logged in
    if (userInfo && userInfo.id) {
      try {
        if (updatedCartItems.length === 0) {
          // If cart is empty, clear the cart completely
          await fetch(`http://localhost:5678/api/cart/${userInfo.id}`, {
            method: 'DELETE'
          });
        } else {
          // Otherwise, update the cart
          await fetch(`http://localhost:5678/api/cart/${userInfo.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items: updatedCartItems })
          });
        }
      } catch (error) {
        console.error('Error syncing cart with server:', error);
      }
    }
  };

  const clearCart = async () => {
    // Clear cart locally
    setCartItems([]);
    localStorage.removeItem('cartItems');
    
    // Clear cart on the server if user is logged in
    if (userInfo && userInfo.id) {
      try {
        await fetch(`http://localhost:5678/api/cart/${userInfo.id}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Error clearing cart on server:', error);
      }
    }
  };

  // Fetch user's cart from the server when logged in
  const fetchUserCart = async () => {
    if (!userInfo || !userInfo.id) return;
    
    try {
      const response = await fetch(`http://localhost:5678/api/cart/${userInfo.id}`);
      const data = await response.json();
      
      if (data.cart && data.cart.items) {
        setCartItems(data.cart.items);
        localStorage.setItem('cartItems', JSON.stringify(data.cart.items));
      }
    } catch (error) {
      console.error('Error fetching user cart:', error);
    }
  };

  // Fetch cart when user logs in
  useEffect(() => {
    if (userInfo && userInfo.id) {
      fetchUserCart();
    }
  }, [userInfo]);

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
    fetchProducts,

    // Cart state and actions
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    clearCart,
    fetchUserCart,
    shippingAddress,
    setShippingAddress,
    paymentMethod,
    setPaymentMethod,
    saveShippingAddress,
    savePaymentMethod,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppContext;
