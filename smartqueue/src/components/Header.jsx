import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAdminLoggedIn, logoutAdmin } from '../utils/auth';

const BRAND_LOGO = `${process.env.PUBLIC_URL}/smartlogo.jpeg`;

export default function Header() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(() => isAdminLoggedIn());
  const location = useLocation();

  useEffect(() => {
    function onStorage(e) {
      if (e.key === 'isAdminLoggedIn' || e.key === 'smartqueue_isAdmin') {
        setIsAdmin(isAdminLoggedIn());
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function handleLogout() {
    logoutAdmin();
    setIsAdmin(false);
    navigate('/');
  }

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <img className="brand-logo" src={BRAND_LOGO} alt="" width={48} height={48} />
          <div className="header-brand-text">
            <h1 className="title">SmartQueue</h1>
            <p className="subtitle">QR-based online queue management for examination branch</p>
          </div>
        </div>
        <div className="header-actions">
          {location.pathname.startsWith('/admin/dashboard') && isAdmin ? (
            <button className="admin-logout-btn" type="button" onClick={handleLogout}>Logout</button>
          ) : location.pathname.startsWith('/admin/login') ? (
            null
          ) : (
            <Link className="admin-login-btn" to="/admin/login">Admin Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}
