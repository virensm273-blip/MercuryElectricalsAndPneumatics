import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Plus, LogOut, X, Package } from 'lucide-react';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const navigate = useNavigate();

  // Load from LocalStorage
  const loadData = () => {
    const stored = localStorage.getItem('products');
    if (stored) {
      setProducts(JSON.parse(stored));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mercury_admin_token');
    navigate('/login');
  };

  const saveProductsToStorage = (updatedProducts) => {
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const updated = products.filter(p => p.id !== id);
      saveProductsToStorage(updated);
    }
  };

  const openModal = (product = null) => {
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
        specs: '' 
      });
    }
    setShowModal(true);
  };

  const saveProduct = (e) => {
    e.preventDefault();
    let updatedProducts = [...products];
    const newProdPayload = { 
      ...currentProduct, 
      price: Number(currentProduct.price), 
      stock: Number(currentProduct.stock),
      inStock: Number(currentProduct.stock) > 0 
    };

    if (currentProduct.id) {
      // Update
      const index = updatedProducts.findIndex(p => p.id === currentProduct.id);
      if (index !== -1) {
        updatedProducts[index] = newProdPayload;
      }
    } else {
      // Create completely new
      newProdPayload.id = Date.now().toString();
      updatedProducts.push(newProdPayload);
    }

    saveProductsToStorage(updatedProducts);
    setShowModal(false);
  };

  // Hardcoded for LocalStorage simplicty as requested
  const SUB_CATEGORIES = ["Valves", "Cylinders", "Fittings", "Tubes", "Air Preparation Units", "Switches"];
  const BRANDS = ["Festo", "SMC", "Airtac"];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div className="admin-header">
        <h2>Dashboard</h2>
        <button className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      <button className="btn btn-primary" style={{ marginBottom: '1.5rem' }} onClick={() => openModal()}>
        <Plus size={20} /> Add New Product
      </button>

      {products.length === 0 ? (
        <p>No products found in LocalStorage. Go Home to auto-seed.</p>
      ) : (
        <div className="product-list">
          {products.map(product => (
            <div key={product.id} className="product-card" style={{ flexDirection: 'row', alignItems: 'center' }}>
              <div style={{ flexGrow: 1 }}>
                <h3 className="product-title" style={{ fontSize: '1rem' }}>{product.name}</h3>
                <p className="product-model">{product.brand} &bull; {product.model} &bull; ₹{Number(product.price).toFixed(2)}</p>
                <span style={{ fontSize: '0.75rem', color: product.inStock ? 'var(--success)' : 'var(--danger)' }}>Stock: {product.stock}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem' }} onClick={() => openModal(product)}><Edit2 size={18} /></button>
                <button className="btn btn-danger" style={{ width: 'auto', padding: '0.5rem' }} onClick={() => handleDeleteProduct(product.id)}><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Product Add/Edit */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>{currentProduct.id ? 'Edit Product' : 'Add Product'}</h3>
              <button 
                className="btn btn-secondary" 
                style={{ width: 'auto', padding: '0.25rem', border: 'none', background: 'transparent' }} 
                onClick={() => setShowModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={saveProduct} style={{ paddingBottom: '2rem' }}>
              <div className="input-group">
                <label className="input-label">Name</label>
                <input type="text" className="input-field" value={currentProduct.name} onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})} required />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Model Number</label>
                  <input type="text" className="input-field" value={currentProduct.model} onChange={(e) => setCurrentProduct({...currentProduct, model: e.target.value})} required />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Brand</label>
                  <select className="input-field" value={currentProduct.brand} onChange={(e) => setCurrentProduct({...currentProduct, brand: e.target.value})}>
                    {BRANDS.map((b, i) => <option key={i} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Category</label>
                  <select className="input-field" value={currentProduct.category} onChange={(e) => setCurrentProduct({...currentProduct, category: e.target.value})}>
                    <option value="Pneumatic">Pneumatic</option>
                    <option value="Electrical">Electrical</option>
                  </select>
                </div>
                
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Subcategory</label>
                  <select className="input-field" value={currentProduct.subcategory} onChange={(e) => setCurrentProduct({...currentProduct, subcategory: e.target.value})}>
                    {SUB_CATEGORIES.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Specifications</label>
                <textarea className="input-field" rows="2" value={currentProduct.specs} onChange={(e) => setCurrentProduct({...currentProduct, specs: e.target.value})} style={{ resize: 'vertical' }}></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Price (₹)</label>
                  <input type="number" step="0.01" className="input-field" value={currentProduct.price} onChange={(e) => setCurrentProduct({...currentProduct, price: e.target.value})} required />
                </div>
                
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Stock</label>
                  <input type="number" className="input-field" value={currentProduct.stock} onChange={(e) => setCurrentProduct({...currentProduct, stock: e.target.value})} required />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Save Local Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
