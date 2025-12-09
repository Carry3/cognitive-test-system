import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sidebar">
      <Link to="/" className="logo">Cognitive Gym</Link>
      <Link to="/" className={`nav-btn ${isActive('/')}`}>
        <span style={{ marginRight: '10px' }}>🏠</span> Dashboard
      </Link>
      <Link to="/profile" className={`nav-btn ${isActive('/profile')}`}>
        <span style={{ marginRight: '10px' }}>👤</span> Profile
      </Link>
      <Link to="/leaderboard" className={`nav-btn ${isActive('/leaderboard')}`}>
        <span style={{ marginRight: '10px' }}>🏆</span> Leaderboard
      </Link>
      <Link to="/settings" className={`nav-btn ${isActive('/settings')}`}>
        <span style={{ marginRight: '10px' }}>⚙️</span> Settings
      </Link>

      <div style={{ marginTop: 'auto' }}>
        <div className="nav-btn" onClick={handleLogout}>
          <span style={{ marginRight: '10px' }}>🚪</span> Logout
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;

