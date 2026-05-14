import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, IndianRupee, Layers, Activity, TrendingUp, BarChart3, PieChart, Clock, ShieldAlert, ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import { supabase } from '../lib/supabase';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    value: 0,
    categories: 0
  });

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        // Load Activity Logs (Still local for now as it's dashboard specific, or we can leave empty)
        // We will fetch real products from Supabase
        const { data: parsedProducts, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (parsedProducts) {
          setProducts(parsedProducts);
          
          const total = parsedProducts.length;
          const lowStock = parsedProducts.filter(p => p.stock <= 5).length;
          const value = parsedProducts.reduce((acc, p) => acc + (Number(p.price) * Number(p.stock)), 0);
          const categories = new Set(parsedProducts.map(p => p.category)).size;
          
          setStats({ total, lowStock, value, categories });
        }
      } catch (err) {
        console.error("Home data load failed:", err);
      }
    };

    loadHomeData();
  }, []);

  const categoryData = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="fade-in">
      <section style={{ marginBottom: window.innerWidth < 480 ? '2rem' : '3rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: window.innerWidth < 480 ? '1.5rem' : '2rem', 
          flexWrap: 'wrap', 
          gap: '1rem' 
        }}>
          <div>
            <h2 className="font-poppins" style={{ 
              background: 'linear-gradient(90deg, #fff, #64748b)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent', 
              marginBottom: '0.2rem',
              fontSize: window.innerWidth < 480 ? '1.5rem' : '2.25rem'
            }}>
              Command Center
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Inventory intelligence and monitoring</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem' }}>
              <div className="stock-critical" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 8px var(--accent-green-glow)' }}></div>
              <span style={{ letterSpacing: '0.5px' }}>SYSTEM NOMINAL</span>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="glass-card stat-card" style={{ padding: window.innerWidth < 480 ? '1.25rem' : '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="stat-label" style={{ fontSize: '0.65rem' }}>Asset Population</span>
              <Package size={18} color="var(--accent-blue)" />
            </div>
            <div className="stat-value" style={{ fontSize: '1.75rem' }}>{stats.total}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <TrendingUp size={10} /> Active SKU count
            </div>
          </div>

          <div className="glass-card stat-card" style={{ 
            padding: window.innerWidth < 480 ? '1.25rem' : '1.5rem',
            borderLeft: stats.lowStock > 0 ? '3px solid var(--error)' : '' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="stat-label" style={{ fontSize: '0.65rem' }}>Critical Shortage</span>
              <ShieldAlert size={18} color="var(--error)" />
            </div>
            <div className="stat-value" style={{ color: stats.lowStock > 0 ? 'var(--error)' : '', fontSize: '1.75rem' }}>
              {stats.lowStock}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Items requiring replenishment</div>
          </div>

          <div className="glass-card stat-card" style={{ padding: window.innerWidth < 480 ? '1.25rem' : '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="stat-label" style={{ fontSize: '0.65rem' }}>Liquidity Value</span>
              <IndianRupee size={18} color="var(--accent-green)" />
            </div>
            <div className="stat-value" style={{ color: 'var(--accent-green)', fontSize: '1.75rem' }}>
              ₹{(stats.value / 100000).toFixed(2)}L
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Total capitalized worth</div>
          </div>

          <div className="glass-card stat-card" style={{ padding: window.innerWidth < 480 ? '1.25rem' : '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="stat-label" style={{ fontSize: '0.65rem' }}>Departments</span>
              <Layers size={18} color="var(--accent-blue)" />
            </div>
            <div className="stat-value" style={{ fontSize: '1.75rem' }}>{stats.categories}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Categorized groups</div>
          </div>
        </div>
      </section>

      <div className="responsive-grid" style={{ gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 380px', gap: '2rem', marginBottom: window.innerWidth < 480 ? '2rem' : '3rem' }}>
        <section className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="font-poppins" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <BarChart3 size={18} color="var(--accent-blue)" /> Distribution Analysis
            </h3>
            <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>REALTIME</div>
          </div>
          
          <div className="chart-container" style={{ height: '200px', alignItems: 'flex-end' }}>
            {Object.entries(categoryData).map(([cat, count]) => (
              <div key={cat} className="chart-bar" data-value={count} style={{ height: `${(count / Math.max(...Object.values(categoryData), 1)) * 100}%` }}>
                <span style={{ 
                  position: 'absolute', 
                  bottom: '-22px', 
                  left: '50%', 
                  transform: 'translateX(-50%)', 
                  fontSize: '0.55rem', 
                  whiteSpace: 'nowrap', 
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>{cat.slice(0, 6)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 className="font-poppins" style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Clock size={18} color="var(--accent-blue)" /> System Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {activityLogs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem', fontSize: '0.8rem' }}>No recent logs found.</p>
            ) : (
              activityLogs.map(log => (
                <div key={log.id} className="activity-item" style={{ borderRadius: '10px', border: '1px solid var(--border-light)', padding: '0.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: '800', color: log.action === 'DELETE' ? 'var(--error)' : 'var(--accent-blue)' }}>{log.action}</span>
                    <span style={{ fontSize: '0.6rem', opacity: 0.4 }}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '500' }}>{log.details.name}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <h3 className="font-poppins" style={{ fontSize: '1.75rem' }}>Asset Catalog</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <button className="btn btn-outline" style={{ height: '40px' }} onClick={() => window.location.href='/products'}>
                View Explorer <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
             </button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="empty-state glass-card">
            <Package size={64} className="empty-icon" />
            <h3 className="font-poppins" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Database Empty</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Initialize your inventory by adding assets in the management console.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} onClick={setSelectedProduct} />
            ))}
          </div>
        )}
      </section>

      {selectedProduct && (
        <ProductDetailsModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
};

export default Home;


