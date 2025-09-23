import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Simple AuthContext for demo:
 * - In production this would call backend /auth endpoints, persist tokens, etc.
 * - For now we model a loggedIn boolean and provide login/logout functions.
 *
 * Default to logged out so the marketing landing page renders first.
 */
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  function login() {
    setLoggedIn(true);
    navigate('/', { replace: true });
  }

  function logout() {
    setLoggedIn(false);
    navigate('/login', { replace: true });
  }

  return (
    <AuthContext.Provider value={{ loggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
