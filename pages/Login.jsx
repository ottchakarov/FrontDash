import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROLE_HOME_PATH, useAuth } from '../contexts/AuthContext';
import './Login.css';

const PERSONA_OPTIONS = [
  {
    role: 'customer',
    title: 'Customer',
    description: 'Preview the takeout customer experience, including active order status and delivery ETA updates.',
    actionLabel: 'Preview customer view',
  },
  {
    role: 'staff',
    title: 'Staff',
    description: 'Manage incoming orders, review fulfillment details, and coordinate couriers in the kitchen command center.',
    actionLabel: 'Open staff tools',
  },
  {
    role: 'admin',
    title: 'Administrator',
    description: 'Review new restaurant applications, handle withdrawal requests, and maintain staffing assignments.',
    actionLabel: 'Review admin console',
  },
  {
    role: 'owner',
    title: 'Owner',
    description: 'Access the restaurant operations dashboard to manage menus, account details, and payout preferences.',
    actionLabel: 'Enter owner dashboard',
  },
];

export default function Login() {
  const { login, loggedIn, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const queryRole = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('role');
  }, [location.search]);

  useEffect(() => {
    if (!loggedIn) return;
    const destination = ROLE_HOME_PATH[role] ?? '/';
    navigate(destination, { replace: true });
  }, [loggedIn, role, navigate]);

  return (
    <div className="login-page">
      <header className="login-header">
        <h1>FrontDash Persona Login</h1>
        <p>Select a persona to explore the tailored dashboard experiences available in the prototype.</p>
      </header>

      <div className="persona-grid">
        {PERSONA_OPTIONS.map((option) => {
          const isSuggested = option.role === (queryRole ?? 'owner');
          return (
            <article
              key={option.role}
              className={`persona-card ${isSuggested ? 'suggested' : ''}`}
              aria-label={`${option.title} persona`}
            >
              <header className="persona-card__header">
                <span className="persona-card__role">{option.role}</span>
                <h2>{option.title}</h2>
              </header>
              <p className="persona-card__description">{option.description}</p>
              <button type="button" className="persona-card__cta" onClick={() => login(option.role)}>
                {option.actionLabel}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
