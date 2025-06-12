import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

// Protect admin routes: if not logged in or not admin, redirect appropriately
const AdminRoute = () => {
  const location = useLocation();
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

  if (!userInfo) {
    // Not logged in -> go to login and remember intended path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!userInfo.isAdmin) {
    // Logged in but not admin -> return to home
    return <Navigate to="/" replace />;
  }

  // Authorized admin -> render nested route
  return <Outlet />;
};

export default AdminRoute;
