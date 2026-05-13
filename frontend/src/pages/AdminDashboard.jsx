import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit2, Trash2, Plus, LogOut, X, Package, Search, Save, AlertCircle, 
  Upload, ImageIcon, CheckCircle2, Loader2, MessageSquare, FileText, 
  Users, BarChart3, ChevronRight, Filter, Calendar
} from 'lucide-react';
import { safeGet, safeSet, STORAGE_KEYS } from '../utils/storage';
import { logActivity } from '../utils/logger';
import { getInquiries, updateInquiryStatus, getQuotations, getSuppliers, getBusinessStats } from '../utils/business';

import QuotationGenerator from '../components/QuotationGenerator';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [showQuoteGen, setShowQuoteGen] = useState(false);
  const [products, setProducts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [businessStats, setBusinessStats] = useState({});
  
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const loadData = () => {
    setProducts(safeGet(STORAGE_KEYS.PRODUCTS));
    setInquiries(getInquiries());
    setQuotations(getQuotations());
    setSuppliers(getSuppliers());
    setBusinessStats(getBusinessStats());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('activity_updated', loadLogs);
    window.addEventListener('storage_updated', loadData);
    return () => {
      window.removeEventListener('activity_updated', loadLogs);
      window.removeEventListener('storage_updated', loadData);
    };
  }, []);

  const [logs, setLogs] = useState([]);
  const loadLogs = () => {
    setLogs(safeGet(STORAGE_KEYS.LOGS));
  };

  useEffect(() => {
    loadLogs();
    
    const handleOpenAdd = () => openModal();
    window.addEventListener('open_add_product', handleOpenAdd);
    return () => window.removeEventListener('open_add_product', handleOpenAdd);
  }, []);

  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('mercury_admin_token');
    navigate('/login');
  };

  const saveProductsToStorage = async (updatedProducts, item = null, isDelete = false) => {
    // 1. Update Local State & Storage immediately for snappy UI
    safeSet(STORAGE_KEYS.PRODUCTS, updatedProducts);
    setProducts(updatedProducts);

    // 2. Sync to Backend API if token exists
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token && item) {
      try {
        const isEdit = !!item.id && !isDelete;
        const url = isDelete 
          ? `http://localhost:5000/api/products/${item.id}` 
          : isEdit 
            ? `http://localhost:5000/api/products/${item.id}` 
            : `http://localhost:5000/api/products`;
        
        const method = isDelete ? 'DELETE' : isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: isDelete ? null : JSON.stringify(item)
        });

        if (!response.ok) throw new Error('API Sync failed');
        
        // If it was a POST, the backend generated an ID (or we can use ours)
        // But for consistency with local storage, we trust the local state first.
      } catch (err) {
        console.warn("Backend sync failed. Data persisted locally only.", err);
      }
    }
  };

  const handleRefreshFromServer = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (response.ok) {
        const data = await response.json();
        safeSet(STORAGE_KEYS.PRODUCTS, data);
        setProducts(data);
        showFeedback('Database synchronized with server');
      }
    } catch (err) {
      showFeedback('Sync failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteProduct = (e, id) => {
    e.stopPropagation();
    try {
      const productToDelete = products.find(p => p.id === id);
      if (!productToDelete) return;

      if (window.confirm(`Permanent removal requested for "${productToDelete?.name}". Confirm deletion?`)) {
        setIsProcessing(true);
        setTimeout(async () => {
          const updated = products.filter(p => p.id !== id);
          await saveProductsToStorage(updated, { id }, true);
          
          logActivity('DELETE', { name: productToDelete.name, id });
          
          setIsProcessing(false);
          showFeedback('Asset deleted successfully');
        }, 500);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      showFeedback('Deletion failed', 'error');
      setIsProcessing(false);
    }
  };

  const openModal = (product = null) => {
    setFeedback({ message: '', type: '' });
    if (product) {
      setCurrentProduct({ ...product });
    } else {
      setCurrentProduct({ 
        name: '', 
        model: '', 
        category: 'Pneumatic', 
        subcategory: 'Valves', 
        brand: 'Festo', 
        price: 0, 
        stock: 0, 
        specs: '',
        image: '',
        images: [],
        tags: [],
        supplier: ''
      });
    }
    setShowModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      alert('Please select an image file (JPG, PNG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Simple Canvas Compression
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to optimized WEBP or JPEG
        const dataUrl = canvas.toDataURL('image/webp', 0.7);
        setCurrentProduct(prev => ({ 
          ...prev, 
          image: prev.images.length === 0 ? dataUrl : prev.image,
          images: [...(prev.images || []), dataUrl] 
        }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const saveProduct = (e) => {
    e.preventDefault();
    
    if (currentProduct.price < 0 || currentProduct.stock < 0) {
      showFeedback('Price and stock cannot be negative', 'error');
      return;
    }

    setIsProcessing(true);
    
    try {
      setTimeout(async () => {
        let updatedProducts = [...products];
        const isEdit = !!currentProduct.id;
        
        const payload = { 
          ...currentProduct, 
          id: isEdit ? currentProduct.id : Date.now().toString(),
          price: Math.max(0, Number(currentProduct.price)), 
          stock: Math.max(0, Number(currentProduct.stock)),
          inStock: Number(currentProduct.stock) > 0,
          updatedAt: new Date().toISOString()
        };

        if (isEdit) {
          const index = updatedProducts.findIndex(p => p.id === currentProduct.id);
          if (index !== -1) updatedProducts[index] = payload;
        } else {
          updatedProducts.push(payload);
        }

        await saveProductsToStorage(updatedProducts, payload);
        logActivity(isEdit ? 'EDIT' : 'ADD', { name: payload.name, id: payload.id });
        
        setIsProcessing(false);
        setShowModal(false);
        showFeedback(isEdit ? 'Asset updated' : 'Asset created');
      }, 800);
    } catch (err) {
      console.error("Save failed:", err);
      showFeedback('Failed to save asset', 'error');
      setIsProcessing(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Model', 'Category', 'Subcategory', 'Brand', 'Price', 'Stock'];
    const rows = products.map(p => [
      p.name, p.model, p.category, p.subcategory, p.brand, p.price, p.stock
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `mercury_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback('Inventory exported to CSV');
  };

  const handleExportPDF = () => {
    // Simulating PDF export with a styled text blob
    const content = `MERCURY INDUSTRIAL INVENTORY REPORT\nGenerated: ${new Date().toLocaleString()}\n\n` +
      products.map(p => `${p.name} [${p.model}] - ${p.brand}\nPrice: ₹${p.price} | Stock: ${p.stock}\n-------------------`).join('\n\n');
    const blob = new Blob([content], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventory_report_${Date.now()}.pdf`;
    link.click();
    showFeedback('PDF Report Generated');
  };

  const handleBackup = () => {
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      products: products,
      logs: logs
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mercury_backup_${Date.now()}.json`;
    link.click();
    showFeedback('Full Backup Exported');
  };

  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.products && Array.isArray(data.products)) {
          saveProductsToStorage(data.products);
          if (data.logs) safeSet(STORAGE_KEYS.LOGS, data.logs);
          showFeedback('System Restored Successfully');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          throw new Error("Invalid format");
        }
      } catch (err) {
        showFeedback('Invalid Backup File', 'error');
      }
    };
    reader.readAsText(file);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const SUB_CATEGORIES = ["Valves", "Cylinders", "Fittings", "Tubes", "Air Preparation Units", "Switches"];
  const BRANDS = ["Festo", "SMC", "Airtac"];

  return (
    <div className="fade-in">
      {/* Feedback Toast */}
      {feedback.message && (
        <div style={{
          position: 'fixed', top: '90px', right: window.innerWidth < 768 ? '1rem' : '2rem',
          left: window.innerWidth < 768 ? '1rem' : 'auto',
          background: feedback.type === 'error' ? 'var(--error)' : 'var(--accent-green)',
          color: 'black', padding: '1rem 1.5rem', borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 4000,
          display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '700',
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <CheckCircle2 size={20} />
          {feedback.message}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="font-poppins" style={{ fontSize: '1.75rem', fontWeight: '800', background: 'linear-gradient(90deg, #fff, #64748b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Mercury Business OS
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Full-scale industrial operations console.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={handleLogout} style={{ height: '40px', padding: '0 1rem' }}>
             <LogOut size={18} /> <span className="desktop-only">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="glass-card" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[
          { id: 'inventory', icon: Package, label: 'Inventory' },
          { id: 'inquiries', icon: MessageSquare, label: 'Inquiries' },
          { id: 'quotations', icon: FileText, label: 'Quotations' },
          { id: 'suppliers', icon: Users, label: 'Suppliers' },
          { id: 'analytics', icon: BarChart3, label: 'Analytics' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, minWidth: '120px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              background: activeTab === tab.id ? 'var(--accent-blue)' : 'transparent',
              color: activeTab === tab.id ? 'black' : 'var(--text-secondary)',
              border: 'none', borderRadius: '8px', cursor: 'pointer', transition: '0.3s', fontWeight: '600', fontSize: '0.85rem'
            }}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'inventory' && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
             <div className="input-container" style={{ flex: 1, maxWidth: '400px' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" className="input-field" placeholder="Search inventory..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ paddingLeft: '2.75rem' }} />
             </div>
             <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-outline" onClick={handleExportCSV}>Export CSV</button>
                <button className="btn btn-primary" onClick={() => openModal()}>
                  <Plus size={18} /> New Asset
                </button>
             </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(product => (
              <div key={product.id} className="glass-card admin-asset-item" style={{ borderLeft: `4px solid ${product.stock > 5 ? 'var(--accent-green)' : 'var(--error)'}` }}>
                <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {product.image ? <img src={product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={20} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700' }}>{product.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{product.model} • {product.brand}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <div style={{ fontWeight: '800' }}>₹{Number(product.price).toLocaleString()}</div>
                   <div style={{ fontSize: '0.75rem', color: product.stock > 5 ? 'var(--accent-green)' : 'var(--error)' }}>Stock: {product.stock}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                   <button className="btn-outline" onClick={() => openModal(product)} style={{ padding: '0.4rem' }}><Edit2 size={16} /></button>
                   <button className="btn-outline" onClick={(e) => handleDeleteProduct(e, product.id)} style={{ padding: '0.4rem', color: 'var(--error)' }}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'inquiries' && (
        <div className="fade-in">
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 className="font-poppins">Customer Inquiries</h3>
              <div className="chip active">{inquiries.length} TOTAL</div>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {inquiries.map(inq => (
                <div key={inq.id} className="glass-card" style={{ padding: '1.5rem', borderLeft: `4px solid ${inq.status === 'New Inquiry' ? 'var(--accent-blue)' : 'var(--text-muted)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{inq.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inq.email} • {inq.phone}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="chip" style={{ background: 'rgba(0, 242, 255, 0.1)', color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>{inq.status}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(inq.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Interested Product</div>
                    <div style={{ fontWeight: '600' }}>{inq.productName}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                     <select 
                      className="input-field" 
                      style={{ width: '200px', height: '36px', fontSize: '0.8rem' }}
                      value={inq.status}
                      onChange={(e) => {
                        updateInquiryStatus(inq.id, e.target.value);
                        loadData();
                      }}
                     >
                        <option>New Inquiry</option>
                        <option>Contacted</option>
                        <option>Negotiating</option>
                        <option>Converted</option>
                        <option>Closed</option>
                     </select>
                     <button className="btn btn-outline" style={{ height: '36px', fontSize: '0.8rem' }}>View History</button>
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'quotations' && (
        <div className="fade-in">
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 className="font-poppins">Quotation History</h3>
              <button className="btn btn-primary" onClick={() => setShowQuoteGen(true)}>
                <Plus size={18} /> Create New Quotation
              </button>
           </div>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {quotations.length === 0 ? (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                  <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>No quotation records found.</p>
                </div>
              ) : (
                quotations.map(q => (
                  <div key={q.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700' }}>{q.customer.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{q.id} • {new Date(q.date).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <div style={{ fontWeight: '800', color: 'var(--accent-green)' }}>₹{q.total.toLocaleString()}</div>
                       <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{q.items.length} items</div>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
      )}

      {showQuoteGen && (
        <QuotationGenerator 
          onClose={() => setShowQuoteGen(false)} 
          onSave={(data) => {
            // handle save logic
            setShowQuoteGen(false);
            showFeedback('Quotation saved successfully');
            loadData();
          }}
        />
      )}

      {activeTab === 'suppliers' && (
        <div className="fade-in">
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 className="font-poppins">Supplier Directory</h3>
              <button className="btn btn-primary"><Plus size={18} /> Add Supplier</button>
           </div>
           <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {suppliers.map(sup => (
                <div key={sup.id} className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--accent-blue)', color: 'black', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                      {sup.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700' }}>{sup.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sup.category}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div>Email: {sup.email}</div>
                    <div>Phone: {sup.phone}</div>
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="fade-in">
          <div className="stats-grid">
            <div className="stat-card glass-card">
              <span className="stat-label">Inventory Value</span>
              <span className="stat-value">₹{(businessStats.totalValue / 100000).toFixed(2)}L</span>
            </div>
            <div className="stat-card glass-card">
              <span className="stat-label">Inquiry Conversion</span>
              <span className="stat-value" style={{ color: 'var(--accent-green)' }}>
                {businessStats.inquiryStats?.total ? ((businessStats.inquiryStats.converted / businessStats.inquiryStats.total) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="stat-card glass-card">
               <span className="stat-label">Inventory Health</span>
               <span className="stat-value" style={{ color: businessStats.health > 80 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                {businessStats.health?.toFixed(0)}%
               </span>
            </div>
          </div>
          
          <div className="glass-card" style={{ padding: '2rem', marginTop: '2rem' }}>
             <h3 className="font-poppins" style={{ marginBottom: '1.5rem' }}>Stock Trends</h3>
             <div className="chart-container" style={{ height: '200px', alignItems: 'flex-end' }}>
                {products.slice(0, 8).map((p, i) => (
                  <div key={i} className="chart-bar" style={{ height: `${(p.stock / 20) * 100}%`, background: p.stock < 5 ? 'var(--error)' : 'var(--accent-blue)' }}>
                    <span style={{ position: 'absolute', bottom: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.6rem', opacity: 0.5 }}>{p.model}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* Management Modal */}
      {showModal && (
        <div className="modal-overlay" style={{ zIndex: 4000, padding: window.innerWidth < 480 ? '0' : '1rem' }}>
          <div className="modal-content glass-card" style={{ 
            borderTop: '6px solid var(--accent-blue)', 
            maxWidth: '700px',
            width: '100%',
            height: window.innerWidth < 768 ? '100%' : 'auto',
            maxHeight: window.innerWidth < 768 ? '100vh' : '90vh',
            borderRadius: window.innerWidth < 768 ? '0' : 'var(--radius-lg)',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 className="font-poppins" style={{ fontSize: '1.5rem' }}>{currentProduct.id ? 'Modify Asset' : 'Register New Asset'}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Update hardware specifications</p>
              </div>
              <button 
                className="btn-outline" 
                style={{ borderRadius: '50%', padding: '0.25rem', width: '36px', height: '36px', border: 'none', background: 'transparent' }} 
                onClick={() => setShowModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={saveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-container" style={{ 
                textAlign: 'center', 
                padding: window.innerWidth < 480 ? '1.5rem' : '2rem', 
                border: '2px dashed var(--border-light)', 
                borderRadius: '12px', 
                cursor: 'pointer' 
              }} onClick={() => fileInputRef.current.click()}>
                {/* Image Upload Area */}
                {currentProduct.images && currentProduct.images.length > 0 ? (
                  <div style={{ 
                    width: '100%', 
                    display: 'grid', 
                    gridTemplateColumns: window.innerWidth < 480 ? '1fr 1fr' : '1fr 1fr 1fr', 
                    gap: '10px' 
                  }}>
                    {currentProduct.images.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            const newImages = currentProduct.images.filter((_, i) => i !== idx);
                            setCurrentProduct({ ...currentProduct, images: newImages, image: newImages[0] || '' });
                          }}
                          style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,77,77,0.9)', border: 'none', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <div 
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                      style={{ height: '100px', border: '2px dashed var(--border-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <Plus size={24} />
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload size={32} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Upload hardware <span style={{ color: 'var(--accent-blue)' }}>Images</span></p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.4rem' }}>Max 2MB per file</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} multiple />
              </div>

              {/* Tags Section */}
              <div className="input-container">
                <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block', fontSize: '0.7rem' }}>Asset Tags</label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {['Premium', 'Fast Selling', 'Imported', 'New Arrival'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className={`chip ${currentProduct.tags && currentProduct.tags.includes(tag) ? 'active' : ''}`}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', minHeight: '30px' }}
                      onClick={() => {
                        const tags = currentProduct.tags || [];
                        const newTags = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag];
                        setCurrentProduct({ ...currentProduct, tags: newTags });
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-container">
                <label className="stat-label" style={{ marginBottom: '0.4rem', display: 'block', fontSize: '0.7rem' }}>Product Name</label>
                <input type="text" className="input-field" value={currentProduct.name} onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})} required placeholder="e.g. High-Pressure Valve" style={{ height: '42px' }} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 480 ? '1fr' : '1fr 1fr', gap: '1.25rem' }}>
                <div className="input-container">
                  <label className="stat-label" style={{ marginBottom: '0.4rem', display: 'block', fontSize: '0.7rem' }}>Model</label>
                  <input type="text" className="input-field" value={currentProduct.model} onChange={(e) => setCurrentProduct({...currentProduct, model: e.target.value})} required placeholder="PV-900" style={{ height: '42px' }} />
                </div>
                <div className="input-container">
                  <label className="stat-label" style={{ marginBottom: '0.4rem', display: 'block', fontSize: '0.7rem' }}>Manufacturer</label>
                  <select className="input-field" value={currentProduct.brand} onChange={(e) => setCurrentProduct({...currentProduct, brand: e.target.value})} style={{ height: '42px' }}>
                    {BRANDS.map((b, i) => <option key={i} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 480 ? '1fr' : '1fr 1fr', gap: '1.25rem' }}>
                <div className="input-container">
                  <label className="stat-label" style={{ marginBottom: '0.4rem', display: 'block', fontSize: '0.7rem' }}>Category</label>
                  <select className="input-field" value={currentProduct.category} onChange={(e) => setCurrentProduct({...currentProduct, category: e.target.value})} style={{ height: '42px' }}>
                    <option value="Pneumatic">Pneumatic</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Tools">Tools</option>
                  </select>
                </div>
                <div className="input-container">
                  <label className="stat-label" style={{ marginBottom: '0.4rem', display: 'block', fontSize: '0.7rem' }}>Sub-Department</label>
                  <select className="input-field" value={currentProduct.subcategory} onChange={(e) => setCurrentProduct({...currentProduct, subcategory: e.target.value})} style={{ height: '42px' }}>
                    {SUB_CATEGORIES.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="input-container">
                  <label className="stat-label" style={{ marginBottom: '0.4rem', display: 'block', fontSize: '0.7rem' }}>Unit Price</label>
                  <input type="number" step="0.01" className="input-field" value={currentProduct.price} onChange={(e) => setCurrentProduct({...currentProduct, price: e.target.value})} required style={{ height: '42px' }} />
                </div>
                <div className="input-container">
                  <label className="stat-label" style={{ marginBottom: '0.4rem', display: 'block', fontSize: '0.7rem' }}>Inventory</label>
                  <input type="number" className="input-field" value={currentProduct.stock} onChange={(e) => setCurrentProduct({...currentProduct, stock: e.target.value})} required style={{ height: '42px' }} />
                </div>
              </div>

              <div className="input-container">
                <label className="stat-label" style={{ marginBottom: '0.4rem', display: 'block', fontSize: '0.7rem' }}>Technical Specs</label>
                <textarea 
                  className="input-field" 
                  style={{ minHeight: '80px', resize: 'vertical', padding: '0.75rem' }}
                  value={currentProduct.specs} 
                  onChange={(e) => setCurrentProduct({...currentProduct, specs: e.target.value})} 
                  placeholder="Operating pressure, voltage, etc."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingBottom: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '50px' }} disabled={isProcessing}>
                  {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Save size={18} />}
                  {isProcessing ? 'Saving...' : 'Commit'}
                </button>
                <button type="button" className="btn btn-outline" style={{ flex: 1, height: '50px' }} onClick={() => setShowModal(false)} disabled={isProcessing}>
                  Discard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;


