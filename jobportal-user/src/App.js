import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthAPI } from './services/api';

import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import UserPanel from './components/user/UserPanel';
import HomePage from './components/user/HomePage';
import BrowseJobs from './components/user/BrowseJobs';
import JobDetail from './components/user/JobDetail';
import MyApplications from './components/user/MyApplications';
import SavedJobs from './components/user/SavedJobs';
import Profile from './components/user/Profile';
import MyPortfolio from './components/user/MyPortfolio';

function ProtectedRoute({ children, loading }) {
  if (loading) return <LoadingScreen />;
  return AuthAPI.isLoggedIn ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children, loading }) {
  if (loading) return <LoadingScreen />;
  return AuthAPI.isLoggedIn ? <Navigate to="/dashboard" replace /> : children;
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-deeper">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (AuthAPI.isLoggedIn) {
      AuthAPI.getProfile()
        .then(u => setUser(u))
        .catch(() => {
          AuthAPI.logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (u) => setUser(u);

  const handleLogout = () => {
    AuthAPI.logout();
    setUser(null);
    navigate('/login');
  };

  const handleUpdate = (u) => setUser(u);

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute loading={loading}><Login onLogin={handleLogin} /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute loading={loading}><Signup onLogin={handleLogin} /></PublicRoute>} />

      <Route path="/dashboard" element={<ProtectedRoute loading={loading}><UserPanel user={user} onLogout={handleLogout} /></ProtectedRoute>}>
        <Route index element={<HomePage user={user} />} />
        <Route path="browse" element={<BrowseJobs user={user} />} />
        <Route path="job/:jobId" element={<JobDetail user={user} />} />
        <Route path="applications" element={<MyApplications user={user} />} />
        <Route path="saved" element={<SavedJobs user={user} />} />
        <Route path="portfolio" element={<MyPortfolio user={user} onUpdate={handleUpdate} />} />
        <Route path="profile" element={<Profile user={user} onUpdate={handleUpdate} />} />
      </Route>

      <Route path="*" element={<Navigate to={AuthAPI.isLoggedIn ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}
