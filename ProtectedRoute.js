import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Wrap protected routes with <ProtectedRoute><YourPage/></ProtectedRoute>
 */
export default function ProtectedRoute({ children }) {
  const { loggedIn } = useAuth();
  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
