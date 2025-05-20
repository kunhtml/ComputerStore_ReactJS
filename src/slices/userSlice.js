import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Lấy thông tin người dùng từ localStorage nếu có
const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

const initialState = {
  userInfo: userInfoFromStorage,
  status: 'idle',
  error: null,
};

// Async thunks
// Đăng nhập
const login = createAsyncThunk(
  'user/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post(
        '/api/users/login',
        { email, password },
        config
      );

      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Đăng ký
const register = createAsyncThunk(
  'user/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post(
        '/api/users',
        { name, email, password },
        config
      );

      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Đăng xuất
const logout = createAsyncThunk('user/logout', async () => {
  localStorage.removeItem('userInfo');
  return true;
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userInfo = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userInfo = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.userInfo = null;
      });
  },
});

export { login, register, logout };
export const selectUserInfo = (state) => state.user.userInfo;

export default userSlice.reducer;
