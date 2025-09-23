// src/App.js
import React, { useCallback } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLE_HOME_PATH, useAuth } from './contexts/AuthContext';

import Login from './pages/Login';
import Landing from './pages/Landing';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import OwnerHome from './pages/owner/OwnerHome';
import UpdateMenu from './pages/owner/UpdateMenu';
import AccountSettings from './pages/owner/AccountSettings';
import Withdraw from './pages/owner/Withdraw';

export default function App() {
  const { loggedIn, role } = useAuth();
  const navigate = useNavigate();

  const handleSearch = useCallback(
    (address) => {
      navigate('/login?role=customer', { state: { address } });
    },
    [navigate]
  );

  const handleRestaurantLogin = useCallback(() => {
    navigate('/login?role=owner');
  }, [navigate]);

  const handleStaffLogin = useCallback(() => {
    navigate('/login?role=staff');
  }, [navigate]);

  const handleOwnerRegister = useCallback(() => {
    navigate('/login?role=owner');
  }, [navigate]);

  const landingProps = {
    onSearch: handleSearch,
    onRestaurantLogin: handleRestaurantLogin,
    onStaffLogin: handleStaffLogin,
    onOwnerRegister: handleOwnerRegister,
  };

  const authedLanding = ROLE_HOME_PATH[role] ?? '/owner';

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          loggedIn ? <Navigate to={authedLanding} replace /> : <Landing {...landingProps} />
        }
      />

      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['staff']}>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner"
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <OwnerHome />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/update-menu"
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <UpdateMenu />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/account-settings"
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <AccountSettings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/withdraw"
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <Withdraw />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={
          loggedIn ? <Navigate to={authedLanding} replace /> : <Navigate to="/" replace />
        }
      />
    </Routes>
  );
}
