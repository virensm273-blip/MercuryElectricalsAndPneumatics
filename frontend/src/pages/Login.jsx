import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, ShieldCheck, Mail, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { STORAGE_KEYS } from '../utils/storage';

const API_BASE = '/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.session.access_token);
        navigate('/admin');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: window.innerWidth < 480 ? '80vh' : '70vh', padding: '1rem' }}>
      <div className="glass-card" style={{ 
        padding: window.innerWidth < 480 ? '2rem 1.5rem' : '3rem', 
        width: '100%', 
        maxWidth: '450px', 
        borderTop: '4px solid var(--accent-blue)',
        borderRadius: '20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: window.innerWidth < 480 ? '2rem' : '2.5rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: window.innerWidth < 480 ? '1rem' : '1.25rem', 
            background: 'rgba(0, 242, 255, 0.1)', 
            borderRadius: '50%', 
            marginBottom: '1rem', 
            color: 'var(--accent-blue)',
            boxShadow: '0 0 20px var(--accent-blue-glow)',
            border: '1px solid var(--accent-blue)'
          }}>
            <ShieldCheck size={window.innerWidth < 480 ? 32 : 40} />
          </div>
          <h2 className="font-poppins" style={{ fontSize: window.innerWidth < 480 ? '1.5rem' : '2rem', marginBottom: '0.4rem' }}>Admin Portal</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Secure inventory management access</p>
          
          <div style={{ 
            marginTop: '1.25rem', 
            padding: '0.75rem 1rem', 
            background: 'rgba(255, 255, 255, 0.02)', 
            borderRadius: '10px', 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)',
            border: '1px solid var(--border-light)',
            display: 'inline-block'
          }}>
             ADMIN ACCESS &rarr; Supabase Authentication Enabled
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-container">
            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="email" 
              className="input-field" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ paddingLeft: '2.75rem', height: '48px' }}
              required
            />
          </div>
          
          <div className="input-container">
            <KeyRound size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="password" 
              className="input-field" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: '2.75rem', height: '48px' }}
              required
            />
          </div>
          
          {error && (
            <div style={{ 
              color: 'var(--error)', 
              fontSize: '0.8rem', 
              padding: '0.75rem', 
              background: 'rgba(255, 77, 77, 0.08)', 
              borderRadius: '8px', 
              border: '1px solid rgba(255, 77, 77, 0.15)',
              textAlign: 'center' 
            }}>
              {error}
            </div>
          )}
          
          <button type="submit" className="btn btn-primary" style={{ height: '52px', fontSize: '1rem', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

