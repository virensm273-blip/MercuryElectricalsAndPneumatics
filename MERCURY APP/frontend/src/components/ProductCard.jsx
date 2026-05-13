import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag } from 'lucide-react';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="product-card animate-fade-in" 
      onClick={() => navigate(`/product/${product.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className="product-header">
        <div>
          <h3 className="product-title">{product.name}</h3>
          <p className="product-model">Model: {product.model}</p>
        </div>
        <div className="product-price">₹{product.price.toFixed(2)}</div>
      </div>
      <div className="product-footer">
        <span className="badge badge-category" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Tag size={12} />
          {product.category}
        </span>
        <span className={`badge ${product.inStock ? 'badge-success' : 'badge-danger'}`}>
          {product.inStock ? `${product.stock} in stock` : 'Out of Stock'}
        </span>
      </div>
    </div>
  );
};

export default ProductCard;
