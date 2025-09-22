import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();

  return (
    <div style={{ padding: 28 }}>
      <h2>FrontDash — Restaurant Employee Login (Demo)</h2>
      <p>This is a placeholder login page. Click the button to "log in" and return to the dashboard.</p>
      <button onClick={login} style={{ padding: '10px 18px', borderRadius: 8, fontWeight: 700 }}>
        Log in
      </button>
    </div>
  );
}
