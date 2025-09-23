import React, { createContext, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Simple AuthContext for demo:
 * - In production this would call backend /auth endpoints, persist tokens, etc.
 * - For now we model a loggedIn boolean and provide login/logout functions.
 *
 * Default to logged out so the marketing landing page renders first.
 */
const AuthContext = createContext();

export const ROLE_HOME_PATH = {
  customer: '/customer',
  staff: '/staff',
  admin: '/admin',
  owner: '/owner',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  function login(role = 'owner', options = {}) {
    const nextRole = role ?? 'owner';
    const nextUser = { role: nextRole };
    setUser(nextUser);
    const destination = options.redirectTo ?? ROLE_HOME_PATH[nextRole] ?? '/';
    navigate(destination, { replace: true });
  }

  function logout() {
    setUser(null);
    navigate('/login', { replace: true });
  }

  function setRole(role) {
    setUser((prev) => {
      if (!role) return null;
      return { ...(prev ?? {}), role };
    });
  }

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      loggedIn: Boolean(user),
      login,
      logout,
      setRole,
      defaultRouteForRole: (roleKey) => ROLE_HOME_PATH[roleKey] ?? '/',
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
