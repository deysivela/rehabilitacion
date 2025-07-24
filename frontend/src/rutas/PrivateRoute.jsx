import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const token = sessionStorage.getItem('token');
  const userData = JSON.parse(sessionStorage.getItem('usuario')); 
  const userRole = userData?.rol?.toLowerCase() || '';

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Si el rol no está permitido, redirige a inicio 
    return <Navigate to="/" replace />;
  }
  return children;
};

export default PrivateRoute;

