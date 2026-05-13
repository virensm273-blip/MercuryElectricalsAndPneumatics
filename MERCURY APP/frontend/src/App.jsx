import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Settings, Zap, Home as HomeIcon } from 'lucide-react';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('mercury_admin_token');
  return token ? children : <Navigate to="/login" />;
};

const Header = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path || (path === '/admin' && location.pathname.includes('/admin')) ? 'var(--primary)' : 'var(--text-muted)';

  return (
    <header className="app-header" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
      <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
        <Zap size={24} color="#facc15" />
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 className="header-title" style={{ fontWeight: '800', letterSpacing: '1px' }}>MERCURY</h1>
        </Link>
      </div>
      
      <nav style={{ display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', gap: '4px', color: isActive('/') }}>
          <HomeIcon size={22} />
          <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Home (Products)</span>
        </Link>
        
        <Link to="/admin" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', gap: '4px', color: isActive('/admin') }}>
          <Settings size={22} />
          <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Admin</span>
        </Link>
      </nav>
    </header>
  );
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="page-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/admin" 
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
