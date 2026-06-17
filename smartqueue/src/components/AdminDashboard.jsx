import React, { useEffect, useState } from 'react';
import { logoutAdmin, isAdminLoggedIn } from '../utils/auth';
import { Navigate } from 'react-router-dom';
import AdminTable from './AdminTable';
import '../styles/admin-dashboard.css';

export default function AdminDashboard() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const API_BASE = process.env.REACT_APP_API_BASE || `${window.location.protocol}//${window.location.hostname}:4000`;
        const resp = await fetch(`${API_BASE}/api/queue/records`);
        if (!resp.ok) throw new Error('Failed to load records');
        const data = await resp.json();
        setRecords(data || []);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Redirect to login if not authenticated (do this after hooks)
  if (!isAdminLoggedIn()) return <Navigate to="/admin/login" replace />;

  function handleLogout() {
    logoutAdmin();
    window.location.href = '/';
  }

  return (
    <div className="admin-page">
      <div className="admin-dashboard">
        <div className="dash-header">
          <h2 className="admin-title">College Examination Admin Dashboard</h2>
        </div>

        <div className="dash-content">
          {loading && <div>Loading...</div>}
          {error && <div className="error">{error}</div>}
          {!loading && !error && <AdminTable records={records} />}
        </div>
      </div>
    </div>
  );
}
