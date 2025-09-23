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

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
const PASSWORD_RULE_MESSAGE =
  'Password must be at least 6 characters and include uppercase, lowercase, and a number.';

function validateAuthCredentials(credentials = {}) {
  const errors = {};
  const username = typeof credentials.username === 'string' ? credentials.username.trim() : '';
  const password = typeof credentials.password === 'string' ? credentials.password : '';

  if (!username) {
    errors.username = 'Username is required.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (!PASSWORD_REGEX.test(password)) {
    errors.password = PASSWORD_RULE_MESSAGE;
  }

  if (Object.prototype.hasOwnProperty.call(credentials, 'role')) {
    const roleValue = typeof credentials.role === 'string' ? credentials.role.trim() : '';
    if (!roleValue) {
      errors.role = 'Please select a role to continue.';
    }
  }

  return errors;
}

export function AuthProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authErrors, setAuthErrors] = useState({});
  const navigate = useNavigate();

  function login(credentials = {}) {
    const validationErrors = validateAuthCredentials(credentials);

    if (Object.keys(validationErrors).length > 0) {
      setAuthErrors(validationErrors);
      setLoggedIn(false);
      return { success: false, errors: validationErrors };
    }

    setAuthErrors({});
    setLoggedIn(true);
    navigate('/', { replace: true });
    return { success: true };
  }

  function logout() {
    setLoggedIn(false);
    setAuthErrors({});
    navigate('/login', { replace: true });
  }

  return (
    <AuthContext.Provider value={{ loggedIn, login, logout, authErrors }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
