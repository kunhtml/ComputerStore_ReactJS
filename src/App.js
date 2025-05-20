import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";
import { useAppContext } from "./context/AppContext";

// Components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Shipping from "./pages/Shipping";
import PaymentMethod from "./pages/PaymentMethod";
import PlaceOrder from "./pages/PlaceOrder";
import Order from "./pages/Order";
import OrderList from "./pages/OrderList";
import MyReviews from "./pages/MyReviews";

// Admin Pages
import UserList from "./pages/admin/UserList";
import UserEdit from "./pages/admin/UserEdit";
import ProductList from "./pages/admin/ProductList";
import ProductEdit from "./pages/admin/ProductEdit";
import OrderListAdmin from "./pages/admin/OrderList";

// Private Route Components
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  const { userInfo } = useAppContext();

  return (
    <div className="app d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 py-4">
        <Container>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/search/:keyword" element={<Products />} />
            <Route path="/page/:pageNumber" element={<Products />} />
            <Route
              path="/search/:keyword/page/:pageNumber"
              element={<Products />}
            />
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
              path="/myreviews"
              element={
                <PrivateRoute>
                  <MyReviews />
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
    </div>
  );
}

export default App;
