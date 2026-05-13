import React, { useState } from 'react';
import { X, Box, Tag as TagIcon, HardDrive, ShoppingCart, Calendar, Share2, Truck, MessageCircle } from 'lucide-react';

const ProductDetailsModal = ({ product, onClose, onInquire }) => {
  const [activeImage, setActiveImage] = useState(product?.image || '');
  
  if (!product) return null;

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <div className="modal-overlay" style={{ zIndex: 5000, padding: window.innerWidth < 480 ? '0' : '1rem' }} onClick={onClose}>
      <div className="modal-content glass-card fade-in" style={{ 
        maxWidth: '1000px', 
        width: '100%', 
        height: window.innerWidth < 768 ? '100%' : 'auto',
        maxHeight: window.innerWidth < 768 ? '100vh' : '90vh',
        padding: 0, 
        overflowY: 'auto',
        borderRadius: window.innerWidth < 768 ? '0' : 'var(--radius-lg)'
      }} onClick={e => e.stopPropagation()}>
        <div className="modal-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1.2fr',
          height: '100%'
        }}>
          {/* Image & Gallery Section */}
          <div className="modal-image-section" style={{ 
            padding: window.innerWidth < 480 ? '1rem' : '1.5rem',
            background: 'rgba(255,255,255,0.01)',
            borderRight: window.innerWidth < 768 ? 'none' : '1px solid var(--border-light)',
            borderBottom: window.innerWidth < 768 ? '1px solid var(--border-light)' : 'none'
          }}>
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              height: window.innerWidth < 480 ? '220px' : '350px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              overflow: 'hidden', 
              borderRadius: '12px', 
              background: 'rgba(255,255,255,0.02)',
              marginBottom: '1rem'
            }}>
              {activeImage ? (
                <img 
                  src={activeImage} 
                  alt={product.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              ) : (
                <Box size={64} color="var(--accent-blue)" style={{ opacity: 0.2 }} />
              )}
              
              <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {product.tags && product.tags.map(tag => (
                  <span key={tag} className="tag tag-premium" style={{ textTransform: 'uppercase', fontSize: '0.6rem', padding: '2px 6px' }}>{tag}</span>
                ))}
              </div>
            </div>

            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.4rem', scrollbarWidth: 'none' }}>
                {images.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setActiveImage(img)}
                    style={{ 
                      width: '54px', 
                      height: '54px', 
                      borderRadius: '8px', 
                      border: activeImage === img ? '2px solid var(--accent-blue)' : '1px solid var(--border-light)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      flexShrink: 0,
                      opacity: activeImage === img ? 1 : 0.6,
                      transition: '0.2s'
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="modal-details-section" style={{ 
            padding: window.innerWidth < 480 ? '1.5rem' : '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <h2 className="font-poppins" style={{ fontSize: '1.5rem', marginBottom: '0.4rem', color: 'var(--text-primary)', fontWeight: '800', lineHeight: 1.2 }}>{product.name}</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><HardDrive size={14} color="var(--accent-blue)" /> {product.model}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><TagIcon size={14} color="var(--accent-blue)" /> {product.brand}</span>
                </div>
              </div>
              <button className="btn-outline" onClick={onClose} style={{ borderRadius: '50%', padding: '0', width: '36px', height: '36px', minWidth: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'rgba(255,255,255,0.05)' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--accent-green)' }}>₹{Number(product.price).toLocaleString()}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Asset Valuation</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`stock-badge ${product.stock > 5 ? 'stock-high' : 'stock-low'}`} style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}>
                    {product.stock} Units
                  </span>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>WAREHOUSE COUNT</div>
                </div>
              </div>
              <div className="progress-bar" style={{ height: '4px' }}>
                <div className="progress-fill blue" style={{ width: `${Math.min((product.stock / 20) * 100, 100)}%` }}></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 480 ? '1fr' : '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <h4 className="font-poppins" style={{ marginBottom: '0.35rem', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Manufacturer</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{product.brand} Industrial</div>
              </div>
              <div>
                <h4 className="font-poppins" style={{ marginBottom: '0.35rem', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Supply Chain</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500' }}>
                  <Truck size={14} color="var(--accent-blue)" /> {product.supplier || 'Mercury Direct'}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-poppins" style={{ marginBottom: '1rem', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Technical Profile</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dimensions</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{product.dimensions || 'N/A'}</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Voltage</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{product.voltage || 'Standard'}</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Material</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{product.material || 'Alloy Steel'}</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Weight</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{product.weight || '2.4 kg'}</div>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.8rem', opacity: 0.9 }}>
                {product.description || "Standard industrial asset configuration with high-precision components designed for mission-critical operations."}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(0, 242, 255, 0.03)', borderRadius: '12px', border: '1px dashed var(--accent-blue)' }}>
               <div style={{ width: '60px', height: '60px', background: 'white', padding: '4px', borderRadius: '4px', flexShrink: 0 }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MERCURY-${product.id}`} alt="QR Code" style={{ width: '100%', height: '100%' }} />
               </div>
               <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>Asset QR Lookup</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Scan for instant inventory synchronization and stock updates.</div>
               </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem', paddingBottom: window.innerWidth < 768 ? '2rem' : '0' }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, height: '48px', minHeight: 'auto' }}
                onClick={() => onInquire && onInquire(product)}
              >
                <MessageCircle size={18} /> Send Inquiry
              </button>
              <button className="btn btn-outline" style={{ height: '48px', minHeight: 'auto', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Share2 size={18} /> <span className="desktop-only">Share</span>
              </button>
              <button className="btn btn-outline" style={{ height: '48px', minHeight: 'auto', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <LayoutGrid size={18} /> <span className="desktop-only">Compare</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .product-zoom-view:hover {
          transform: scale(1.15);
        }
      `}</style>
    </div>
  );
};

export default ProductDetailsModal;
