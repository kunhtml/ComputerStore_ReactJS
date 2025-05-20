import { createSlice } from '@reduxjs/toolkit';

// Lấy giỏ hàng từ localStorage nếu có
const cartItemsFromStorage = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems'))
  : [];

const shippingAddressFromStorage = localStorage.getItem('shippingAddress')
  ? JSON.parse(localStorage.getItem('shippingAddress'))
  : {};

const paymentMethodFromStorage = localStorage.getItem('paymentMethod')
  ? localStorage.getItem('paymentMethod')
  : '';

const initialState = {
  cartItems: cartItemsFromStorage,
  shippingAddress: shippingAddressFromStorage,
  paymentMethod: paymentMethodFromStorage,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x.product === item.product);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x.product === existItem.product ? item : x
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }
      
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x.product !== action.payload);
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem('paymentMethod', action.payload);
    },
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cartItems');
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
