import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage';
import IndexPage from './pages/IndexPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FitnessLogsPage from './pages/FitnessLogsPage';
import HealthMetricsPage from './pages/HealthMetricsPage';
import RemindersPage from './pages/RemindersPage';
import ResultPage from './pages/ResultPage';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [userSession, setUserSession] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/current_user`, { credentials: 'include' })
 // credentials needed for session cookies
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUserSession(data);
        setLoading(false);
      })
      .catch(() => {
        setUserSession(null);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!userSession) return <Navigate to="/" replace />;

  return React.cloneElement(children, { user: userSession });
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected */}
        <Route path="/homePage" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/index" element={<ProtectedRoute><IndexPage /></ProtectedRoute>} />
        <Route path="/fitnessLogs" element={<ProtectedRoute><FitnessLogsPage /></ProtectedRoute>} />
        <Route path="/health-metrics" element={<ProtectedRoute><HealthMetricsPage /></ProtectedRoute>} />
        <Route path="/reminders" element={<ProtectedRoute><RemindersPage /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
