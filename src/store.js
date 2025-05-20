// Tạo một store đơn giản không sử dụng Redux
const store = {
  // Lấy thông tin user từ localStorage
  getUserInfo: () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      return null;
    }
  },

  // Lấy giỏ hàng từ localStorage
  getCart: () => {
    try {
      const cart = localStorage.getItem('cart');
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error('Lỗi khi lấy giỏ hàng:', error);
      return [];
    }
  },

  // Lưu giỏ hàng vào localStorage
  saveCart: (cartItems) => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Lỗi khi lưu giỏ hàng:', error);
    }
  },

  // Xóa thông tin đăng nhập
  logout: () => {
    try {
      localStorage.removeItem('userInfo');
      return true;
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      return false;
    }
  }
};

export default store;
