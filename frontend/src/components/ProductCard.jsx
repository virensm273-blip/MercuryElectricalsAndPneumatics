import React from 'react';
import { Package, ChevronRight, HardDrive, Tag as TagIcon, Box, ShoppingCart, MessageCircle } from 'lucide-react';

const ProductCard = ({ product, onClick, onInquire }) => {
  const stockPercentage = Math.min((product.stock / 20) * 100, 100);
  const isLowStock = product.stock <= 5;
  const isCritical = product.stock <= 2;
  
  return (
    <div 
      className={`product-card glass-card fade-in ${isCritical ? 'stock-critical' : isLowStock ? 'stock-warning' : ''}`}
      onClick={() => onClick && onClick(product)}
      style={{ cursor: 'pointer', padding: window.innerWidth < 480 ? '1.25rem' : '1.5rem' }}
    >
      <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.4rem', zIndex: 2, flexWrap: 'wrap' }}>
        {product.tags && product.tags.length > 0 ? (
          product.tags.slice(0, 2).map(tag => (
            <span key={tag} className="tag tag-premium" style={{ fontSize: '0.55rem', padding: '2px 6px' }}>{tag}</span>
          ))
        ) : (
          <>
            {product.stock > 15 && <span className="tag tag-premium" style={{ fontSize: '0.55rem', padding: '2px 6px' }}>Premium</span>}
            {isLowStock && <span className="tag tag-fast" style={{ fontSize: '0.55rem', padding: '2px 6px' }}>Fast Moving</span>}
          </>
        )}
      </div>

      <div className="product-card-content" style={{ display: 'flex', flexDirection: window.innerWidth < 480 ? 'column' : 'row', gap: '1.25rem' }}>
        <div className="product-icon-container" style={{ 
          overflow: 'hidden', 
          width: window.innerWidth < 480 ? '100%' : '80px',
          height: window.innerWidth < 480 ? '160px' : '80px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          {product.image ? (
            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="zoom-hover" loading="lazy" />
          ) : (
            <Package size={window.innerWidth < 480 ? 48 : 32} color="var(--accent-blue)" />
          )}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="product-title font-poppins" style={{ 
            fontSize: 'var(--fs-base)', 
            fontWeight: '700', 
            marginBottom: '0.4rem',
            lineHeight: 1.3
          }}>{product.name}</h3>
          <div className="product-meta" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="meta-item" style={{ fontSize: '0.75rem' }}><HardDrive size={12} /> {product.model}</span>
            <span className="meta-item" style={{ fontSize: '0.75rem' }}><TagIcon size={12} /> {product.brand}</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
        <div>
          <div className="price-tag" style={{ fontSize: 'var(--fs-lg)', marginBottom: '0.2rem' }}>₹{Number(product.price).toLocaleString()}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Market Value</div>
        </div>

        <div style={{ textAlign: 'right', minWidth: '90px' }}>
          <div className={`stock-badge ${!isLowStock ? 'stock-high' : 'stock-low'}`} style={{ marginBottom: '0.5rem', fontSize: '0.65rem' }}>
            {product.stock > 0 ? `${product.stock} Units` : 'Out of Stock'}
          </div>
          <div className="progress-bar" style={{ height: '4px' }}>
            <div 
              className={`progress-fill ${!isLowStock ? 'blue' : 'green'}`}
              style={{ width: `${stockPercentage}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="card-footer" style={{ 
        marginTop: '1.25rem', 
        paddingTop: '1rem', 
        borderTop: '1px solid var(--border-light)',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.7 }}>
          <Box size={14} /> 
          <span style={{ fontSize: '0.7rem', fontWeight: '500' }}>Full Specifications</span>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); onInquire && onInquire(product); }}
            className="btn-outline" 
            style={{ 
              padding: '0', 
              borderRadius: '8px', 
              border: '1px solid var(--border-light)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              minHeight: 'auto'
            }}
          >
            <MessageCircle size={16} color="var(--accent-green)" />
          </button>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;


