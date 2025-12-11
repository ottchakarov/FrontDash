import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROLE_HOME_PATH, useAuth } from '../contexts/AuthContext';

/**
 * Wrap protected routes with <ProtectedRoute><YourPage/></ProtectedRoute>
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { loggedIn, role } = useAuth();

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    const redirectPath = ROLE_HOME_PATH[role] ?? '/';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
