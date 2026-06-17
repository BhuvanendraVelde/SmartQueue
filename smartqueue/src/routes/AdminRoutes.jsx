import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import AdminLogin from '../components/AdminLogin';
import AdminDashboard from '../components/AdminDashboard';
import { isAdminLoggedIn } from '../utils/auth';

function RequireAuth({ children }) {
  return isAdminLoggedIn() ? children : <Navigate to="/admin/login" replace />;
}

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <RequireAuth>
            <AdminDashboard />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
