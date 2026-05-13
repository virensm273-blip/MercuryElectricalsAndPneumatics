import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, Zap, ArrowLeft } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="app-header">
      {!isHome && (
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft size={24} />
        </button>
      )}
      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Zap size={24} color="#facc15" />
        <h1 className="header-title" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>Mercury App</h1>
      </div>
      <div>
        <button className="back-btn" onClick={() => navigate('/admin')} aria-label="Admin settings">
          <Settings size={22} />
        </button>
      </div>
    </header>
  );
};

export default Header;
