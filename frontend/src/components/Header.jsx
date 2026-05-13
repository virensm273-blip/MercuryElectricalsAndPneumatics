import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Zap, Bell, User, Search, Home, LayoutGrid, X, Sun, Moon } from 'lucide-react';

import { safeGet, STORAGE_KEYS } from '../utils/storage';

const Header = () => {
  const [theme, setTheme] = useState(localStorage.getItem('mercury_theme') || 'dark');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const suggestionRef = useRef(null);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('mercury_theme', newTheme);
    if (newTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  };

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    }
  }, []);
  
  const isActive = (path) => location.pathname === path;

  const updateCounts = () => {
    const products = safeGet(STORAGE_KEYS.PRODUCTS);
    const lowStock = products.filter(p => p.stock <= 5).length;
    setLowStockCount(lowStock);
  };

  useEffect(() => {
    updateCounts();

    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('storage_updated', updateCounts);
    window.addEventListener('activity_updated', updateCounts);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('storage_updated', updateCounts);
      window.removeEventListener('activity_updated', updateCounts);
    };
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (val) => {
    setSearchTerm(val);
    if (val.trim()) {
      const products = safeGet(STORAGE_KEYS.PRODUCTS);
      const filtered = products.filter(p => 
        (p.name || '').toLowerCase().includes(val.toLowerCase()) ||
        (p.model || '').toLowerCase().includes(val.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(val.toLowerCase()) ||
        (p.brand || '').toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    
    window.dispatchEvent(new CustomEvent('search_inventory', { detail: val }));
  };

  return (
    <header className="app-header">
      <div className="header-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '1rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-green))',
            padding: window.innerWidth < 480 ? '0.35rem' : '0.4rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px var(--accent-blue-glow)'
          }}>
            <Zap size={window.innerWidth < 480 ? 16 : 18} color="black" fill="black" />
          </div>
          <span className="header-logo" style={{ fontSize: '1.25rem', letterSpacing: '1px' }}>
            {window.innerWidth < 400 ? 'M' : 'Mercury'}
          </span>
        </Link>

        <div className="search-container" ref={suggestionRef} style={{ flex: 1, maxWidth: window.innerWidth < 768 ? 'none' : '400px' }}>
          <div className="input-container">
            <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 5 }} />
            <input 
              id="global-search"
              type="text" 
              placeholder={window.innerWidth < 480 ? "Search..." : "Search assets..."}
              className="input-field" 
              style={{ 
                paddingLeft: '2.25rem', 
                paddingRight: searchTerm ? '2.5rem' : '1rem', 
                height: window.innerWidth < 768 ? '36px' : '44px', 
                fontSize: '0.875rem' 
              }}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchTerm && setShowSuggestions(true)}
            />
            {searchTerm && (
              <X 
                size={14} 
                style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)', zIndex: 5 }} 
                onClick={() => handleSearch('')} 
              />
            )}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="glass-card" style={{ 
              position: 'absolute', 
              top: '120%', 
              left: 0, 
              right: 0, 
              zIndex: 1000, 
              padding: '0.5rem',
              maxHeight: '300px',
              overflowY: 'auto',
              border: '1px solid var(--border-light)'
            }}>
              {suggestions.map(p => (
                <div 
                  key={p.id} 
                  className="activity-item" 
                  style={{ cursor: 'pointer', borderRadius: '8px', padding: '0.75rem' }}
                  onClick={() => {
                    navigate(`/products?search=${p.name}`);
                    setShowSuggestions(false);
                  }}
                >
                  <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.model} • {p.brand}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="header-actions" style={{ gap: window.innerWidth < 480 ? '0.5rem' : '1rem', display: 'flex', alignItems: 'center' }}>
          <button 
            className="btn-outline" 
            onClick={toggleTheme}
            style={{ padding: '0', borderRadius: '50%', width: '40px', height: '40px', border: 'none', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {theme === 'dark' ? <Sun size={20} color="var(--accent-blue)" /> : <Moon size={20} color="var(--accent-blue)" />}
          </button>

          <button className="btn-outline desktop-only" style={{ padding: '0', borderRadius: '50%', width: '40px', height: '40px', position: 'relative', border: 'none' }}>
            <Bell size={20} color="var(--text-secondary)" />
            {lowStockCount > 0 && (
              <span style={{ 
                position: 'absolute', 
                top: '0px', 
                right: '0px', 
                background: 'var(--error)', 
                color: 'white', 
                fontSize: '0.6rem', 
                width: '15px', 
                height: '15px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: '800'
              }}>{lowStockCount}</span>
            )}
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/admin')}>
            <div style={{ 
              width: window.innerWidth < 480 ? '34px' : '38px', 
              height: window.innerWidth < 480 ? '34px' : '38px', 
              borderRadius: '50%', 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              transition: 'var(--transition-smooth)'
            }} className="avatar-hover">
              <User size={window.innerWidth < 480 ? 18 : 20} color="var(--text-secondary)" />
            </div>
          </div>

          <button 
            className="mobile-only" 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-primary)', 
              display: window.innerWidth < 768 ? 'flex' : 'none',
              padding: '0.25rem'
            }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <LayoutGrid size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div style={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          right: 0, 
          background: 'rgba(10, 10, 12, 0.98)', 
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-light)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          zIndex: 999,
          animation: 'slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <Link to="/" style={{ textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>
            <div className={`chip ${isActive('/') ? 'active' : ''}`} style={{ width: '100%', justifyContent: 'flex-start', padding: '1rem' }}>
              <Home size={18} /> <span style={{ marginLeft: '0.75rem' }}>Inventory Explorer</span>
            </div>
          </Link>
          <Link to="/admin" style={{ textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>
            <div className={`chip ${location.pathname.startsWith('/admin') ? 'active' : ''}`} style={{ width: '100%', justifyContent: 'flex-start', padding: '1rem' }}>
              <LayoutGrid size={18} /> <span style={{ marginLeft: '0.75rem' }}>Management Console</span>
            </div>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;


