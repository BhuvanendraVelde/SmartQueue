import React from 'react';
import './App.css';
import './styles/main.css';
import './styles/form.css';
import './styles/confirmation.css';
import Header from './components/Header';
import QueueForm from './components/QueueForm';
import Confirmation from './components/Confirmation';
import QRDisplay from './components/QRDisplay';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAdminLoggedIn } from './utils/auth';

function RequireAuth({ children }) {
  return isAdminLoggedIn() ? children : <Navigate to="/admin/login" replace />;
}

function App() {
  return (
    <Router>
      <div className="app-root">
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<QRDisplay />} />
            <Route path="/form" element={<QueueForm />} />
            <Route path="/confirmation" element={<Confirmation />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <RequireAuth>
                  <AdminDashboard />
                </RequireAuth>
              }
            />
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
