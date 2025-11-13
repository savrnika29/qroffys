// PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ element, ...rest }) => {
  // Get token from Redux store instead of localStorage
  // Replace 'auth.token' with your actual Redux state path
  const token = useSelector((state) => state.auth.token);

  // Check if user is authenticated
  const isAuthenticated = !!token;

  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default PrivateRoute;