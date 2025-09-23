// src/App.js
import React, { useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

import HomeLanding from './pages/HomeLanding';
import UpdateMenu from './pages/UpdateMenu';
import AccountSettings from './pages/AccountSettings';
import Withdraw from './pages/Withdraw';
import Login from './pages/Login';
import Landing from './pages/Landing';
import SelectRestaurant from './pages/customer/SelectRestaurant';
import Menu from './pages/customer/Menu';
import Checkout from './pages/customer/Checkout';

export default function App() {
  const { loggedIn } = useAuth();
  const navigate = useNavigate();

  const handleSearch = useCallback(
    (address) => {
      navigate('/customer/select', { state: { address } });
    },
    [navigate]
  );

  const handleRestaurantLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleStaffLogin = useCallback(() => {
    navigate('/login?mode=staff');
  }, [navigate]);

  const handleOwnerRegister = useCallback(() => {
    navigate('/login?mode=register');
  }, [navigate]);

  const landingProps = {
    onSearch: handleSearch,
    onRestaurantLogin: handleRestaurantLogin,
    onStaffLogin: handleStaffLogin,
    onOwnerRegister: handleOwnerRegister,
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/customer" element={<Navigate to="/customer/select" replace />} />
      <Route path="/customer/select" element={<SelectRestaurant />} />
      <Route path="/customer/menu" element={<Menu />} />
      <Route path="/customer/checkout" element={<Checkout />} />

      <Route
        path="/"
        element={
          loggedIn ? (
            <ProtectedRoute>
              <HomeLanding />
            </ProtectedRoute>
          ) : (
            <Landing {...landingProps} />
          )
        }
      />

      <Route
        path="/update-menu"
        element={
          <ProtectedRoute>
            <UpdateMenu />
          </ProtectedRoute>
        }
      />

      <Route
        path="/account-settings"
        element={
          <ProtectedRoute>
            <AccountSettings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/withdraw"
        element={
          <ProtectedRoute>
            <Withdraw />
          </ProtectedRoute>
        }
      />

      {/* fallback: when logged in -> home; otherwise -> landing */}
      <Route
        path="*"
        element={
          loggedIn ? (
            <ProtectedRoute>
              <HomeLanding />
            </ProtectedRoute>
          ) : (
            <Landing {...landingProps} />
          )
        }
      />
    </Routes>
  );
}
