// src/App.js
import React, { useCallback } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLE_HOME_PATH, useAuth } from './contexts/AuthContext';

import Login from './pages/Login';
import Landing from './pages/Landing';
import RestaurantList from './pages/customer/RestaurantList';
import RestaurantMenu from './pages/customer/RestaurantMenu';
import Checkout from './pages/customer/Checkout';
import OrderConfirmation from './pages/customer/OrderConfirmation';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import AdminStaffDashboard from './pages/AdminStaffDashboard';
import UpdateMenu from './pages/owner/UpdateMenu';
import AccountSettings from './pages/owner/AccountSettings';
import Withdraw from './pages/owner/Withdraw';

import OwnerRegistration from './pages/OwnerRegistration';
import AddMenuItem from './components/AddMenuItem';


export default function App() {
  const { loggedIn, role } = useAuth();
  const navigate = useNavigate();

  const handleSearch = useCallback((address) => {
      navigate('/restaurants', { state: { address } });
    }, [navigate]);

  const handleRestaurantLogin = useCallback(() => navigate('/login?role=owner'), [navigate]);
  const handleStaffLogin = useCallback(() => navigate('/login?role=staff'), [navigate]);
  const handleOwnerRegister = useCallback(() => navigate('/owner/setup'), [navigate]);

  const landingProps = {
    onSearch: handleSearch,
    onRestaurantLogin: handleRestaurantLogin,
    onStaffLogin: handleStaffLogin,
    onOwnerRegister: handleOwnerRegister,
  };

  // If logged in, go to the path defined in AuthContext
  const authedLanding = ROLE_HOME_PATH[role] ?? '/';

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          loggedIn ? <Navigate to={authedLanding} replace /> : <Landing {...landingProps} />
        }
      />

      {/* Customer Routes */}
      <Route path="/restaurants" element={<RestaurantList />} />
      <Route path="/restaurant/:restaurantId" element={<RestaurantMenu />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order/confirm" element={<OrderConfirmation />} />
      <Route path="/order/track" element={<CustomerDashboard />} />
      <Route path="/test-menu" element={<AddMenuItem />} />


      {/* Staff/Admin portal */}
      <Route
        path="/admin-portal"
        element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <AdminStaffDashboard />
          </ProtectedRoute>
        }
      />

      {/* Owner routes */}
      <Route path="/owner/setup" element={<OwnerRegistration />} />

      <Route
        path="/update-menu"
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <UpdateMenu />
          </ProtectedRoute>
        }
      />

      <Route
        path="/account-settings"
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

      {/* Fallback */}
      <Route
        path="*"
        element={
          loggedIn ? <Navigate to={authedLanding} replace /> : <Navigate to="/" replace />
        }
      />
    </Routes>
  );
}
