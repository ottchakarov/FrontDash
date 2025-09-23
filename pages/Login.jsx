import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const FIELD_NAMES = ['username', 'password'];
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
const PASSWORD_RULE_MESSAGE =
  'Password must be at least 6 characters and include uppercase, lowercase, and a number.';

function validateCredentials(values) {
  const errors = {};
  const username = typeof values.username === 'string' ? values.username.trim() : '';
  const password = typeof values.password === 'string' ? values.password : '';

  if (!username) {
    errors.username = 'Username is required.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (!PASSWORD_REGEX.test(password)) {
    errors.password = PASSWORD_RULE_MESSAGE;
  }

  return errors;
}

function mergeFieldErrors(current, updates) {
  const next = { ...current };
  FIELD_NAMES.forEach((field) => {
    if (updates[field]) {
      next[field] = updates[field];
    } else {
      delete next[field];
    }
  });
  return next;
}

function splitErrors(allErrors = {}) {
  const fieldErrors = {};
  const formMessages = [];

  Object.entries(allErrors).forEach(([key, message]) => {
    if (!message) return;

    if (FIELD_NAMES.includes(key)) {
      fieldErrors[key] = message;
      return;
    }

    if (typeof message === 'string') {
      formMessages.push(message);
    }
  });

  const formMessage = formMessages.join(' ').trim();
  return { fieldErrors, formMessage };
}

const pageStyle = {
  width: '100%',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px 16px',
};

const cardStyle = {
  width: '100%',
  maxWidth: 480,
  background: 'var(--panel)',
  borderRadius: 18,
  border: '4px solid var(--black)',
  boxShadow: '0 10px 0 rgba(0,0,0,0.08)',
  padding: '32px 36px',
};

const headingStyle = {
  margin: 0,
  fontSize: 26,
  fontWeight: 700,
};

const descriptionStyle = {
  margin: '12px 0 24px 0',
  color: 'var(--muted)',
  lineHeight: 1.5,
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
};

const labelStyle = {
  fontWeight: 600,
  fontSize: 14,
  marginBottom: 8,
  display: 'block',
};

const inputBaseStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '2px solid var(--black)',
  background: '#fff',
  fontSize: 15,
  fontFamily: 'inherit',
  fontWeight: 500,
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  outline: 'none',
};

const helperStyle = {
  fontSize: 12,
  marginTop: 6,
  color: 'var(--muted)',
};

const errorStyle = {
  fontSize: 12,
  marginTop: 6,
  color: '#b4232c',
  fontWeight: 600,
};

const formErrorStyle = {
  borderRadius: 12,
  border: '1px solid #f5c2c7',
  background: '#ffe6e8',
  color: '#991b1b',
  padding: '12px 14px',
  fontWeight: 600,
  marginBottom: 18,
};

const buttonStyle = {
  background: 'var(--accent)',
  color: 'var(--black)',
  borderRadius: 16,
  border: '2px solid var(--black)',
  padding: '12px 24px',
  fontWeight: 700,
  fontSize: 16,
  cursor: 'pointer',
  boxShadow: '0 6px 0 rgba(0,0,0,0.08)',
  alignSelf: 'flex-start',
};

const disabledButtonStyle = {
  ...buttonStyle,
  opacity: 0.6,
  cursor: 'not-allowed',
  boxShadow: 'none',
};

export default function Login() {
  const { login, authErrors } = useAuth();
  const [values, setValues] = useState({ username: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const isSubmitDisabled = values.username.trim() === '' || values.password === '';

  useEffect(() => {
    if (!authErrors || Object.keys(authErrors).length === 0) {
      return;
    }

    const { fieldErrors: contextFieldErrors, formMessage } = splitErrors(authErrors);

    if (Object.keys(contextFieldErrors).length > 0) {
      setFieldErrors((prev) => mergeFieldErrors(prev, contextFieldErrors));
      setTouched((prev) => ({
        ...prev,
        ...Object.keys(contextFieldErrors).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {}),
      }));
    }

    setFormError((prev) => {
      if (formMessage) return formMessage;
      if (Object.keys(contextFieldErrors).length > 0) {
        return 'Please resolve the highlighted issues.';
      }
      return prev;
    });
    setSubmitted(true);
  }, [authErrors]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFormError('');

    const validationResults = validateCredentials(nextValues);
    setFieldErrors((prev) => mergeFieldErrors(prev, validationResults));
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const validationResults = validateCredentials(values);
    setFieldErrors((prev) => mergeFieldErrors(prev, validationResults));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    setTouched({ username: true, password: true });

    const validationResults = validateCredentials(values);
    setFieldErrors((prev) => mergeFieldErrors(prev, validationResults));

    if (Object.keys(validationResults).length > 0) {
      setFormError('Please resolve the highlighted issues.');
      return;
    }

    const result = login(values);
    if (!result || !result.success) {
      const { fieldErrors: returnedFieldErrors, formMessage } = splitErrors(result?.errors || authErrors || {});

      if (Object.keys(returnedFieldErrors).length > 0) {
        setFieldErrors((prev) => mergeFieldErrors(prev, returnedFieldErrors));
        setTouched((prev) => ({
          ...prev,
          ...Object.keys(returnedFieldErrors).reduce((acc, key) => {
            acc[key] = true;
            return acc;
          }, {}),
        }));
      }

      if (formMessage) {
        setFormError(formMessage);
      } else if (Object.keys(returnedFieldErrors).length > 0) {
        setFormError('Please resolve the highlighted issues.');
      } else {
        setFormError('Unable to log in. Please try again.');
      }
      return;
    }

    setFormError('');
  };

  const usernameHasError = Boolean(fieldErrors.username) && (touched.username || submitted);
  const passwordHasError = Boolean(fieldErrors.password) && (touched.password || submitted);

  const usernameInputStyle = {
    ...inputBaseStyle,
    borderColor: usernameHasError ? '#b4232c' : 'var(--black)',
    boxShadow: usernameHasError ? '0 0 0 2px rgba(180,35,44,0.16)' : '0 4px 0 rgba(0,0,0,0.05)',
  };

  const passwordInputStyle = {
    ...inputBaseStyle,
    borderColor: passwordHasError ? '#b4232c' : 'var(--black)',
    boxShadow: passwordHasError ? '0 0 0 2px rgba(180,35,44,0.16)' : '0 4px 0 rgba(0,0,0,0.05)',
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={headingStyle}>FrontDash — Restaurant Employee Login</h2>
        <p style={descriptionStyle}>
          Sign in with your FrontDash credentials to access the dashboard and manage daily operations.
        </p>

        {formError && (
          <div style={formErrorStyle} role="alert">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={formStyle}>
          <div>
            <label htmlFor="username" style={labelStyle}>
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={usernameHasError}
              aria-describedby={usernameHasError ? 'username-error' : undefined}
              style={usernameInputStyle}
              placeholder="e.g., alex.manager"
              autoComplete="username"
              autoFocus
            />
            {usernameHasError && (
              <p id="username-error" style={errorStyle} role="alert">
                {fieldErrors.username}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" style={labelStyle}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={passwordHasError}
              aria-describedby={`password-hint${passwordHasError ? ' password-error' : ''}`}
              style={passwordInputStyle}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <p id="password-hint" style={helperStyle}>
              Use at least 6 characters with upper and lower case letters and a number.
            </p>
            {passwordHasError && (
              <p id="password-error" style={errorStyle} role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            style={isSubmitDisabled ? disabledButtonStyle : buttonStyle}
            disabled={isSubmitDisabled}
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}
