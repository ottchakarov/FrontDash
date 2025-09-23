// src/App.js
import React, { useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

import HomeLanding from './pages/HomeLanding';
import UpdateMenu from './pages/UpdateMenu';
import AccountSettings from './pages/AccountSettings';
import Withdraw from './pages/Withdraw';
import Login from './pages/Login';
import Landing from './pages/Landing';
import OwnerRegistration from './pages/OwnerRegistration';

export default function App() {
  const { loggedIn } = useAuth();
  const navigate = useNavigate();

  const handleSearch = useCallback(
    (address) => {
      navigate('/login', { state: { address } });
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
    navigate('/register');
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
      <Route path="/register" element={<OwnerRegistration />} />

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
