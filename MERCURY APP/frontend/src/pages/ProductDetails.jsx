import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Tag, ShieldCheck, Box, MessageCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_BASE}/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading product details...</div>;
  if (!product) return <div style={{ padding: '2rem', textAlign: 'center' }}>Product not found.</div>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <button 
        className="btn btn-secondary" 
        style={{ width: 'auto', padding: '0.5rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }} 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-color)', display: 'flex', justifyContent: 'center' }}>
          <Box size={80} color="var(--primary)" opacity={0.2} />
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{product.name}</h2>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <span className="badge badge-category"><Tag size={12} style={{marginRight: 4}}/>{product.category}</span>
            {product.subcategory && <span className="badge badge-category">{product.subcategory}</span>}
            {product.brand && <span className="badge" style={{ background: '#e0e7ff', color: '#4338ca' }}>{product.brand}</span>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'block' }}>Price</span>
              <span style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--primary)' }}>₹{Number(product.price).toFixed(2)}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'block' }}>Availability</span>
              <span className={`badge ${product.inStock ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="var(--text-muted)" /> Specifications
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)', width: '35%' }}>Model Number</td>
                  <td style={{ padding: '0.75rem 0', fontWeight: '500' }}>{product.model}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Brand</td>
                  <td style={{ padding: '0.75rem 0', fontWeight: '500' }}>{product.brand || 'Generic'}</td>
                </tr>
                {product.specs && (
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Details</td>
                    <td style={{ padding: '0.75rem 0', fontWeight: '500' }}>{product.specs}</td>
                  </tr>
                )}
                <tr>
                  <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Stock Qty</td>
                  <td style={{ padding: '0.75rem 0', fontWeight: '500' }}>{product.stock} units</td>
                </tr>
              </tbody>
            </table>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
            onClick={() => window.open(`https://wa.me/1234567890?text=${encodeURIComponent(`Hi, I am interested in ${product.name} (Model: ${product.model}). Is it available?`)}`, '_blank')}
          >
            <MessageCircle size={20} /> Inquire via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
