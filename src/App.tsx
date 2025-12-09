import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import GameRunner from './pages/GameRunner';
import Results from './pages/Results';
import Leaderboard from './pages/Leaderboard';
import ChangePassword from './pages/ChangePassword';
import Settings from './pages/Settings';

const RequireAuth = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/" element={
        <RequireAuth>
          <Layout>
            <Dashboard />
          </Layout>
        </RequireAuth>
      } />

      <Route path="/profile" element={
        <RequireAuth>
          <Layout>
            <Profile />
          </Layout>
        </RequireAuth>
      } />

      <Route path="/test/:testId" element={
        <RequireAuth>
          <Layout>
            <GameRunner />
          </Layout>
        </RequireAuth>
      } />

      <Route path="/results" element={
        <RequireAuth>
          <Layout>
            <Results />
          </Layout>
        </RequireAuth>
      } />

      <Route path="/results/:testId" element={
        <RequireAuth>
          <Layout>
            <Results />
          </Layout>
        </RequireAuth>
      } />

      <Route path="/leaderboard" element={
        <RequireAuth>
          <Layout>
            <Leaderboard />
          </Layout>
        </RequireAuth>
      } />

      <Route path="/settings" element={
        <RequireAuth>
          <Layout>
            <Settings />
          </Layout>
        </RequireAuth>
      } />

      <Route path="/change-password" element={
        <RequireAuth>
          <Layout>
            <ChangePassword />
          </Layout>
        </RequireAuth>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
