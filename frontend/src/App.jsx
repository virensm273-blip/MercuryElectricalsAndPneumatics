import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import Header from './components/Header';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import ProductDetails from './pages/ProductDetails';
import Products from './pages/Products';
import CompareProducts from './pages/CompareProducts';
import MercuryAI from './components/MercuryAI';
import { syncWithBackend, syncLogsWithBackend } from './utils/storage';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('mercury_admin_token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Initial Database Sync
    syncWithBackend();
    syncLogsWithBackend();

    const handleToast = (e) => {
      try {
        if (!e.detail) return;
        const { type, message } = e.detail;
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
      } catch (err) {
        console.error("Toast error:", err);
      }
    };

    window.addEventListener('show_toast', handleToast);
    
    // Keyboard Shortcuts
    const handleKeyDown = (e) => {
      try {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          const searchInput = document.getElementById('global-search');
          if (searchInput) searchInput.focus();
        }
        if (e.key === 'n' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
          if (window.location.pathname.startsWith('/admin')) {
            window.dispatchEvent(new Event('open_add_product'));
          }
        }
      } catch (err) {
        console.warn("Keyboard shortcut error:", err);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('show_toast', handleToast);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="page-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/compare" element={<CompareProducts />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/admin/*" 
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <MercuryAI />
        </main>

        {/* Global Toasts */}
        <div className="toast-container">
          {toasts.map(toast => (
            <div key={toast.id} className={`toast ${toast.type}`}>
              {toast.type === 'success' && <CheckCircle size={20} color="var(--success)" />}
              {toast.type === 'error' && <AlertCircle size={20} color="var(--error)" />}
              {toast.type === 'warning' && <Info size={20} color="var(--accent-orange)" />}
              <span>{toast.message}</span>
              <X 
                size={16} 
                className="close-toast" 
                onClick={() => removeToast(toast.id)} 
                style={{ cursor: 'pointer', marginLeft: 'auto', opacity: 0.5 }} 
              />
            </div>
          ))}
        </div>
      </div>
    </Router>
  );
}

export default App;


