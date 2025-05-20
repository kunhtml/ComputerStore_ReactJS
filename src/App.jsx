import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';

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
const Profile = React.lazy(() => import('./pages/Profile'));
const Shipping = React.lazy(() => import('./pages/Shipping'));
const PaymentMethod = React.lazy(() => import('./pages/PaymentMethod'));
const PlaceOrder = React.lazy(() => import('./pages/PlaceOrder'));
const Order = React.lazy(() => import('./pages/Order'));
const OrderList = React.lazy(() => import('./pages/OrderList'));
const UserDashboard = React.lazy(() => import('./pages/UserDashboard'));

// Lazy load pages - Admin
const UserList = React.lazy(() => import('./pages/admin/UserList'));
const UserEdit = React.lazy(() => import('./pages/admin/UserEdit'));
const ProductList = React.lazy(() => import('./pages/admin/ProductList'));
const ProductEdit = React.lazy(() => import('./pages/admin/ProductEdit'));
const OrderListAdmin = React.lazy(() => import('./pages/admin/OrderList'));

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
const AdminRoute = ({ element: Element, ...rest }) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const location = useLocation();
  
  if (!userInfo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!userInfo.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <Element {...rest} />;
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
                <Route path="/cart/:id?" element={<Cart />} />
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

                {/* Admin Routes */}
                <Route
                  path="/admin/orderlist"
                  element={
                    <AdminRoute>
                      <OrderListAdmin />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/userlist"
                  element={
                    <AdminRoute>
                      <UserList />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/user/:id/edit"
                  element={
                    <AdminRoute>
                      <UserEdit />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/productlist"
                  element={
                    <AdminRoute>
                      <ProductList />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/product/:id/edit"
                  element={
                    <AdminRoute>
                      <ProductEdit />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/orderlist"
                  element={
                    <AdminRoute>
                      <OrderListAdmin />
                    </AdminRoute>
                  }
                />

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
