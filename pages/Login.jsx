import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { ROLE_HOME_PATH, useAuth } from '../contexts/AuthContext';
import './Login.css';

const ROLE_OPTIONS = [
  {
    role: 'staff',
    title: 'Kitchen & fulfillment staff',
    description: 'Monitor the order queue, mark meals in progress, and confirm when pickups are complete.',
  },
  {
    role: 'admin',
    title: 'Platform administrators',
    description: 'Review onboarding, manage marketplace accounts, and approve withdrawal requests.',
  },
  {
    role: 'owner',
    title: 'Restaurant owners',
    description: 'Update menus, manage payout settings, and request marketplace changes in real time.',
  },
];

const USERNAME_PATTERN = /^[A-Za-z]+[A-Za-z0-9]*\d{2}$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

export default function Login() {
  const { login, loggedIn, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const queryRole = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('role');
  }, [location.search]);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: ROLE_OPTIONS[0].role,
  });
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (!loggedIn) return;
    const destination = ROLE_HOME_PATH[role] ?? '/';
    navigate(destination, { replace: true });
  }, [loggedIn, role, navigate]);

  useEffect(() => {
    if (!queryRole) return;
    if (ROLE_OPTIONS.some((option) => option.role === queryRole)) {
      setFormData((prev) => ({ ...prev, role: queryRole }));
    }
  }, [queryRole]);

  const errors = useMemo(() => {
    const next = { username: '', password: '' };
    const username = formData.username.trim();

    if (!username) {
      next.username = 'Username is required.';
    } else if (!USERNAME_PATTERN.test(username)) {
      next.username = 'Use lastname followed by two digits (example: rivera07). Emails are not accepted.';
    }

    if (!formData.password) {
      next.password = 'Password is required.';
    } else if (!PASSWORD_PATTERN.test(formData.password)) {
      next.password = 'Password must be 6+ characters with uppercase, lowercase, and a number.';
    }

    return next;
  }, [formData.username, formData.password]);

  const isFormValid = useMemo(() => Object.values(errors).every((value) => value === ''), [errors]);

  function handleChange(field) {
    return (event) => {
      const value = event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
    };
  }

  function markTouched(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setTouched({ username: true, password: true });
    if (!isFormValid) return;
    login(formData.role ?? 'owner');
  }

  return (
    <>
      <AppHeader />
      <div className="login-page">
        <section className="login-intro">
          <h1>Role-based access for FrontDash teams</h1>
          <p>
            Customers browse and order from the restaurant listings; only vetted staff, admins, and owners sign in here.
            Choose the role you need to explore and use demo credentials that follow the FrontDash username policy.
          </p>
          <ul>
            {ROLE_OPTIONS.map((option) => (
              <li key={option.role} className={option.role === formData.role ? 'active-role' : ''}>
                <strong>{option.title}</strong>
                <span>{option.description}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="login-panel">
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <h2>Sign in</h2>
            <p className="login-hint">Usernames use lastname + two digits (e.g., <strong>rivera07</strong>).</p>

            <label htmlFor="fd-username">Username</label>
            <input
              id="fd-username"
              name="username"
              type="text"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange('username')}
              onBlur={() => markTouched('username')}
              placeholder="lastname07"
            />
            {touched.username && errors.username ? <p className="login-error">{errors.username}</p> : null}

            <label htmlFor="fd-password">Password</label>
            <input
              id="fd-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange('password')}
              onBlur={() => markTouched('password')}
              placeholder="••••••"
            />
            {touched.password && errors.password ? <p className="login-error">{errors.password}</p> : null}

            <label htmlFor="fd-role">Access role</label>
            <select id="fd-role" name="role" value={formData.role} onChange={handleChange('role')}>
              {ROLE_OPTIONS.map((option) => (
                <option key={option.role} value={option.role}>
                  {option.title}
                </option>
              ))}
            </select>

            <button type="submit" className="login-submit" disabled={!isFormValid}>
              Sign in
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
