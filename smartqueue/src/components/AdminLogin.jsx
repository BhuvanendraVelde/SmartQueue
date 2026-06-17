import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin, isAdminLoggedIn } from '../utils/auth';
import '../styles/admin-login.css';

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const API_BASE =
        process.env.REACT_APP_API_BASE ||
        `${window.location.protocol}//${window.location.hostname}:4000`;

      const resp = await fetch(`${API_BASE}/api/queue/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!resp.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await resp.json();

      loginAdmin();
      localStorage.setItem('adminUser', JSON.stringify(data));

      navigate('/admin/dashboard');
    } catch (err) {
      setError('Invalid username or password');
    }
  }

  function handleBack() {
    navigate('/');
  }

  useEffect(() => {
    if (isAdminLoggedIn()) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  return (
    <div className="admin-login-page">
      <div className="login-card">
        <div className="login-top">
          <button type="button" className="back-btn" onClick={handleBack}>← Back</button>
          <h2>Admin Login</h2>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
          </label>
          <label className="password-label">
            Password
            <div className="password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </label>
          {error && <div className="error">{error}</div>}
          <div className="actions">
            <button type="submit" className="btn btn-primary">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
}
