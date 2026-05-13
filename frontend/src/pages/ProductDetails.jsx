import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Tag, ShieldCheck, Box, MessageCircle, Info, HardDrive, Cpu } from 'lucide-react';

import { safeGet, STORAGE_KEYS } from '../utils/storage';

const API_BASE = '/api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Try API first
        try {
          const response = await axios.get(`${API_BASE}/products/${id}`);
          if (response.data) {
            setProduct(response.data);
            setLoading(false);
            return;
          }
        } catch (apiErr) {
          console.warn("API fetch failed, trying local fallback...");
        }

        // Local Fallback
        const products = safeGet(STORAGE_KEYS.PRODUCTS);
        const found = products.find(p => p.id === id);
        setProduct(found || null);
      } catch (error) {
        console.error('Error fetching product', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading asset specifications...</div>;
  if (!product) return <div className="empty-state">Product not found.</div>;

  return (
    <div className="fade-in">
      <button 
        className="btn btn-outline" 
        style={{ width: 'auto', marginBottom: '2rem' }} 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} /> Back to Catalog
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
        {/* Left Side: Visual & Basic Info */}
        <div className="glass-card" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
          <div style={{ 
            background: 'rgba(0, 242, 255, 0.05)', 
            padding: '4rem', 
            borderRadius: '24px',
            border: '1px solid var(--border-light)',
            boxShadow: '0 0 50px rgba(0, 242, 255, 0.1)'
          }}>
            <Box size={120} color="var(--accent-blue)" />
          </div>
          
          <div style={{ width: '100%', textAlign: 'center' }}>
            <h2 className="font-poppins" style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              {product.name}
            </h2>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <span className="chip active" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--accent-blue)' }}>
                {product.brand}
              </span>
              <span className="chip">{product.category}</span>
              <span className={`stock-badge ${product.stock > 5 ? 'stock-high' : 'stock-low'}`} style={{ padding: '0.6rem 1.25rem', borderRadius: '24px' }}>
                {product.inStock ? `${product.stock} Units Available` : 'Out of Stock'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Specs & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
              <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px' }}>Standard Pricing</span>
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: '800', 
                color: 'var(--accent-green)',
                textShadow: '0 0 20px var(--accent-green-glow)'
              }}>
                ₹{Number(product.price).toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HardDrive size={14} /> MODEL
                </div>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{product.model}</div>
              </div>
              <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Cpu size={14} /> BRAND
                </div>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{product.brand || 'Industrial Std.'}</div>
              </div>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <h3 className="font-poppins" style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Info size={20} color="var(--accent-blue)" /> Technical Description
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1rem' }}>
                {product.specs || "Standard industrial hardware component designed for high-precision applications. Built with premium materials to ensure durability and reliability in demanding environments."}
              </p>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', height: '60px', fontSize: '1.1rem' }}
              onClick={() => window.open(`https://wa.me/1234567890?text=${encodeURIComponent(`Hi, I am interested in ${product.name} (Model: ${product.model}). Is it available?`)}`, '_blank')}
            >
              <MessageCircle size={22} fill="black" /> Inquire for Industrial Supply
            </button>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-green)' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <ShieldCheck size={32} color="var(--accent-green)" />
              <div>
                <div style={{ fontWeight: '700' }}>Verified Hardware</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Certified for industrial deployment. 1-year limited warranty included.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

