import React, { createContext, useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);


export const ROLE_HOME_PATH = {
  staff: '/admin-portal',
  admin: '/admin-portal',
  owner: '/update-menu',
};
export function AuthProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const [role, setRole] = useState(() => {
    return localStorage.getItem('userRole') || null;
  });

  const navigate = useNavigate();

  const login = async (username, password, selectedRole) => {
    try {
      console.log("Attempting login for:", username);

      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            username: username, 
            password: password, 
            role: selectedRole
        })
      });

      const data = await response.json();

      if (response.ok) {
        setLoggedIn(true);
        setRole(selectedRole);

        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', selectedRole);
        
        const resolvedRestaurantId = data.restaurant_id || data.restaurantId;
        
        if (resolvedRestaurantId) {
          localStorage.setItem('restaurant_id', resolvedRestaurantId);
          console.log('Saved Restaurant ID:', resolvedRestaurantId);
        }

        const destination = ROLE_HOME_PATH[selectedRole] ?? '/';
        navigate(destination, { replace: true });

      } else {
        alert("Login Failed: " + (data.message || "Check credentials"));
      }
    } catch (error) {
      console.error("Login Error", error);
      alert("Server error. Is the Backend running?");
    }
  };

  const logout = () => {
    setLoggedIn(false);
    setRole(null);
    localStorage.clear();
    navigate('/login');
  };

  const value = useMemo(() => ({
    loggedIn,
    role,
    login,
    logout,
  }), [loggedIn, role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
