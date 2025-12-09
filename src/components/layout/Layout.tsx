import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isGameMode = location.pathname.startsWith('/test/');

  useEffect(() => {
    if (isGameMode) {
      document.body.classList.add('game-mode');
    } else {
      document.body.classList.remove('game-mode');
    }
    return () => {
        document.body.classList.remove('game-mode');
    }
  }, [isGameMode]);

  return (
    <div className="app-container" id="app-main">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;

