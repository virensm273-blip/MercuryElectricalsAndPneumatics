import React, { useState } from 'react';
import { X, Check, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const CompareProducts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState(location.state?.products || []);

  const onRemove = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const onInquire = (p) => {
    navigate('/products', { state: { contactProduct: p } });
  };

  if (!products || products.length === 0) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <h2 className="font-poppins">No products selected for comparison</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Add items from the explorer to compare their technical specifications.</p>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>Return to Explorer</button>
      </div>
    );
  }

  const specs = [
    { label: 'Price', key: 'price', format: (v) => `₹${Number(v).toLocaleString()}` },
    { label: 'Model', key: 'model' },
    { label: 'Brand', key: 'brand' },
    { label: 'Stock Status', key: 'stock', format: (v) => v > 5 ? 'Available' : 'Limited' },
    { label: 'Material', key: 'material', default: 'Alloy Steel' },
    { label: 'Voltage', key: 'voltage', default: '220V' },
    { label: 'Dimensions', key: 'dimensions', default: 'Standard' },
    { label: 'Weight', key: 'weight', default: '2.5kg' }
  ];

  return (
    <div className="fade-in" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
        <button className="btn-outline" onClick={() => navigate(-1)} style={{ width: '40px', height: '40px', padding: '0', borderRadius: '50%' }}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-poppins" style={{ fontSize: '2rem', margin: 0 }}>Technical Comparison</h1>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
          <thead>
            <tr>
              <th style={{ padding: '1.5rem', textAlign: 'left', borderBottom: '1px solid var(--border-light)', width: '200px' }}>Specification</th>
              {products.map(p => (
                <th key={p.id} style={{ padding: '1.5rem', textAlign: 'center', borderBottom: '1px solid var(--border-light)', minWidth: '250px' }}>
                  <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <button 
                      onClick={() => onRemove(p.id)}
                      style={{ position: 'absolute', top: '-10px', right: '0', background: 'rgba(255,77,77,0.1)', color: 'var(--error)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                    <img src={p.image} alt="" style={{ width: '120px', height: '120px', objectFit: 'contain', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', padding: '0.5rem' }} />
                  </div>
                  <div style={{ fontWeight: '800', fontSize: '1rem' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.model}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {specs.map(spec => (
              <tr key={spec.key}>
                <td style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-light)', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {spec.label}
                </td>
                {products.map(p => (
                  <td key={p.id} style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-light)', textAlign: 'center', fontSize: '0.9rem' }}>
                    {spec.format ? spec.format(p[spec.key]) : (p[spec.key] || spec.default)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td style={{ padding: '2rem 1.5rem', borderBottom: 'none' }}></td>
              {products.map(p => (
                <td key={p.id} style={{ padding: '2rem 1.5rem', textAlign: 'center', borderBottom: 'none' }}>
                  <button className="btn btn-primary" style={{ width: '100%', height: '48px' }} onClick={() => onInquire(p)}>
                    <ShoppingCart size={18} /> Inquire Now
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompareProducts;
