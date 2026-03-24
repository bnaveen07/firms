import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchMe } from './features/auth/authSlice';
import useAuth from './hooks/useAuth';
import PageWrapper from './components/layout/PageWrapper/PageWrapper';
import ErrorBoundary from './components/common/ErrorBoundary';

import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ApplicationList from './features/applications/ApplicationList';
import ApplicationForm from './features/applications/ApplicationForm';
import ApplicationDetail from './features/applications/ApplicationDetail';
import InspectionList from './features/inspections/InspectionList';
import IncidentTable from './features/incidents/IncidentTable';
import IncidentDetail from './features/incidents/IncidentDetail';
import NOCViewer from './features/noc/NOCViewer';
import VerifyNOC from './features/noc/VerifyNOC';
import AnalyticsDashboard from './features/analytics/AnalyticsDashboard';
import Heatmap from './features/analytics/Heatmap';

const LoadingScreen = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '1.2rem', color: '#c0392b' }}>
    🔥 Loading FRIMS...
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initialized } = useAuth();
  if (!initialized) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <PageWrapper>{children}</PageWrapper>;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, initialized } = useAuth();
  if (!initialized) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

const NotFound = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
    <h1 style={{ fontSize: '4rem', color: '#c0392b' }}>404</h1>
    <p style={{ color: '#6c757d', marginBottom: '16px' }}>Page not found</p>
    <a href="/dashboard" style={{ color: '#2980b9', fontWeight: '600' }}>Go to Dashboard</a>
  </div>
);

const App = () => {
  const dispatch = useDispatch();
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      dispatch(fetchMe());
    }
  }, [dispatch, token]);

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/verify-noc/:token" element={<VerifyNOC />} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><ApplicationList /></ProtectedRoute>} />
        <Route path="/applications/new" element={<ProtectedRoute><ApplicationForm /></ProtectedRoute>} />
        <Route path="/applications/:id" element={<ProtectedRoute><ApplicationDetail /></ProtectedRoute>} />
        <Route path="/inspections" element={<ProtectedRoute><InspectionList /></ProtectedRoute>} />
        <Route path="/incidents" element={<ProtectedRoute><IncidentTable /></ProtectedRoute>} />
        <Route path="/incidents/:id" element={<ProtectedRoute><IncidentDetail /></ProtectedRoute>} />
        <Route path="/noc" element={<ProtectedRoute><NOCViewer /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
        <Route path="/analytics/heatmap" element={<ProtectedRoute><Heatmap /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
