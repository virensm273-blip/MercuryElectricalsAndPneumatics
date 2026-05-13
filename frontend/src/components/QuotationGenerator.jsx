import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Download, Printer, Share2, Send, CheckCircle2 } from 'lucide-react';
import { safeGet, STORAGE_KEYS } from '../utils/storage';

const QuotationGenerator = ({ onClose, onSave }) => {
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', address: '' });
  const [discount, setDiscount] = useState(0);
  const [gstRate, setGstRate] = useState(18);

  useEffect(() => {
    setProducts(safeGet(STORAGE_KEYS.PRODUCTS, []));
  }, []);

  const addItem = (product) => {
    if (selectedItems.find(item => item.id === product.id)) return;
    setSelectedItems([...selectedItems, { ...product, quantity: 1 }]);
  };

  const removeItem = (id) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id, q) => {
    setSelectedItems(selectedItems.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, q) } : item
    ));
  };

  const subtotal = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const gstAmount = (taxableAmount * gstRate) / 100;
  const grandTotal = taxableAmount + gstAmount;

  return (
    <div className="modal-overlay" style={{ zIndex: 6000, padding: window.innerWidth < 480 ? '0' : '2rem' }}>
      <div className="glass-card fade-in" style={{ 
        maxWidth: '1000px', width: '100%', height: '100%', maxHeight: '90vh', 
        display: 'flex', flexDirection: window.innerWidth < 1024 ? 'column' : 'row',
        overflow: 'hidden', padding: 0
      }}>
        {/* Selection Sidebar */}
        <div style={{ 
          width: window.innerWidth < 1024 ? '100%' : '350px', 
          background: 'rgba(255,255,255,0.02)', 
          borderRight: '1px solid var(--border-light)',
          display: 'flex', flexDirection: 'column', padding: '1.5rem'
        }}>
          <h3 className="font-poppins" style={{ marginBottom: '1.5rem' }}>Select Products</h3>
          <div className="input-container" style={{ marginBottom: '1rem' }}>
             <input type="text" className="input-field" placeholder="Filter inventory..." style={{ height: '38px' }} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {products.map(p => (
              <div 
                key={p.id} 
                onClick={() => addItem(p)}
                style={{ 
                  padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid var(--border-light)', cursor: 'pointer', transition: '0.2s'
                }}
              >
                <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{p.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.model} • ₹{p.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Builder Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)', padding: '2rem', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
             <h2 className="font-poppins" style={{ fontSize: '1.5rem' }}>New Quotation</h2>
             <button onClick={onClose} className="btn-outline" style={{ borderRadius: '50%', padding: '0.25rem', border: 'none' }}><X size={24} /></button>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--border-light)' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input className="input-field" placeholder="Customer Name" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
              <input className="input-field" placeholder="Email Address" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} />
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-light)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem 0.5rem' }}>Product</th>
                <th style={{ padding: '1rem 0.5rem' }}>Price</th>
                <th style={{ padding: '1rem 0.5rem' }}>Qty</th>
                <th style={{ padding: '1rem 0.5rem' }}>Total</th>
                <th style={{ padding: '1rem 0.5rem' }}></th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.model}</div>
                  </td>
                  <td style={{ padding: '1rem 0.5rem', fontSize: '0.85rem' }}>₹{item.price}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <input 
                      type="number" 
                      className="input-field" 
                      style={{ width: '60px', height: '32px', textAlign: 'center' }} 
                      value={item.quantity}
                      onChange={e => updateQuantity(item.id, e.target.value)}
                    />
                  </td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: '700' }}>₹{item.price * item.quantity}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <button onClick={() => removeItem(item.id)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginLeft: 'auto', width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span>Discount (%)</span>
              <input type="number" style={{ width: '50px', background: 'transparent', border: 'none', color: 'var(--accent-blue)', textAlign: 'right' }} value={discount} onChange={e => setDiscount(e.target.value)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
              <span>GST ({gstRate}%)</span>
              <span>₹{gstAmount.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '2px solid var(--accent-blue)', fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-green)' }}>
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem' }}>
            <button className="btn btn-primary" style={{ flex: 1, height: '50px' }} onClick={() => onSave({ customer, items: selectedItems, total: grandTotal })}>
              <Download size={18} /> Generate PDF
            </button>
            <button className="btn btn-outline" style={{ height: '50px', padding: '0 1.5rem' }}>
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationGenerator;
