import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrderManagement from './pages/admin/OrderManagement';
import ProductManagement from './pages/admin/ProductManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import BrandManagement from './pages/admin/BrandManagement';
import ReviewManagement from './pages/admin/ReviewManagement';

// Lazy load components
const Header = React.lazy(() => import('./components/layout/Header'));
const Footer = React.lazy(() => import('./components/layout/Footer'));

// Lazy load pages - Public
const Home = React.lazy(() => import('./pages/Home'));
const Products = React.lazy(() => import('./pages/Products'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Profile = React.lazy(() => import('./pages/customer/Profile'));
const Shipping = React.lazy(() => import('./pages/Shipping'));
const PaymentMethod = React.lazy(() => import('./pages/PaymentMethod'));
const PlaceOrder = React.lazy(() => import('./pages/customer/PlaceOrder'));
const Order = React.lazy(() => import('./pages/Order'));
const OrderList = React.lazy(() => import('./pages/OrderList'));
const UserDashboard = React.lazy(() => import('./pages/UserDashboard'));
const UserReviews = React.lazy(() => import('./pages/customer/UserReviews'));

// Loading component
const Loading = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </div>
);

// Private route component
const PrivateRoute = ({ element: Element, ...rest }) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const location = useLocation();
  
  return userInfo ? (
    <Element {...rest} />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

// Admin route component
const AdminRoute = ({ children, ...rest }) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const location = useLocation();
  
  if (!userInfo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!userInfo.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load user info from localStorage
    const storedUserInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (storedUserInfo) {
      setUserInfo(storedUserInfo);
    }
    
    // Load cart from localStorage
    const loadCart = async () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(cart);
      } catch (error) {
        console.error('Lỗi khi tải giỏ hàng:', error);
      }
    };
    
    loadCart();
  }, []);

  useEffect(() => {
    // Kiểm tra xem có thông tin đăng nhập trong localStorage không
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if (user) {
      setUserInfo(user);
    }
  }, []);

  // Kiểm tra quyền admin
  const isAdmin = userInfo?.isAdmin;

  return (
    <Router>
      <div className="app d-flex flex-column min-vh-100">
        <Suspense fallback={<Loading />}>
          <Header />
          <main className="flex-grow-1 py-4">
            <Container>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/search/:keyword" element={<Products />} />
                <Route path="/page/:pageNumber" element={<Products />} />
                <Route path="/search/:keyword/page/:pageNumber" element={<Products />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route 
                  path="/login" 
                  element={userInfo ? <Navigate to="/" replace /> : <Login />} 
                />
                <Route 
                  path="/register" 
                  element={userInfo ? <Navigate to="/" replace /> : <Register />} 
                />

                {/* Private Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <UserDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/cart/:id?"
                  element={
                    <PrivateRoute>
                      <Cart />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/shipping"
                  element={
                    <PrivateRoute>
                      <Shipping />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/payment"
                  element={
                    <PrivateRoute>
                      <PaymentMethod />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/placeorder"
                  element={
                    <PrivateRoute>
                      <PlaceOrder />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/order/:id"
                  element={
                    <PrivateRoute>
                      <Order />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/myorders"
                  element={
                    <PrivateRoute>
                      <OrderList />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/user-reviews"
                  element={
                    <PrivateRoute element={UserReviews} />
                  }
                />

                {/* Admin Routes (protected) */}
                <Route
                  path="/admin/*"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="orders" element={<OrderManagement />} />
                  <Route path="products" element={<ProductManagement />} />
                  <Route path="categories" element={<CategoryManagement />} />
                  <Route path="brands" element={<BrandManagement />} />
                  <Route path="reviews" element={<ReviewManagement />} />
                </Route>

                {/* 404 Page */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Container>
          </main>
          <Footer />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
