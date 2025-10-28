import React from 'react';
import { Link } from 'react-router-dom';
import { ROLE_HOME_PATH, useAuth } from '../contexts/AuthContext';
import './AppHeader.css';

export default function AppHeader({ children }) {
  const { loggedIn, role, logout } = useAuth();
  const resolvedRole = role ? role : 'guest';
  const homePath = loggedIn ? ROLE_HOME_PATH[role] ?? '/' : '/';

  return (
    <header className="fd-app-header">
      <Link to={homePath} className="fd-app-header__brand">
        <img src="/assets/frontdash-logo.png" alt="FrontDash" />
      </Link>
      <div className="fd-app-header__right">
        <span className="fd-app-header__role">{resolvedRole}</span>
        <nav className="fd-app-header__nav">
          <Link to={homePath}>Home</Link>
          {loggedIn ? (
            <button type="button" onClick={logout} className="link-button">
              Logout
            </button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
        {children ? <div className="fd-app-header__extra">{children}</div> : null}
      </div>
    </header>
  );
}
