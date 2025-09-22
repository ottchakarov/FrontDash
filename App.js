// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

import HomeLanding from './pages/HomeLanding';
import UpdateMenu from './pages/UpdateMenu';
import AccountSettings from './pages/AccountSettings';
import Withdraw from './pages/Withdraw';
import Login from './pages/Login';

export default function App() {
  const { loggedIn } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomeLanding />
          </ProtectedRoute>
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

      {/* fallback: when logged in -> home; otherwise -> login */}
      <Route
        path="*"
        element={
          loggedIn ? (
            <ProtectedRoute>
              <HomeLanding />
            </ProtectedRoute>
          ) : (
            <Login />
          )
        }
      />
    </Routes>
  );
}
