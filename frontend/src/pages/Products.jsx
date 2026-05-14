import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Filter, LayoutGrid, List, SlidersHorizontal, X, ArrowUpDown, Tag as TagIcon, Box } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import ContactModal from '../components/ContactModal';
import { supabase } from '../lib/supabase';

const ITEMS_PER_PAGE = 8;

const Products = () => {
  const [data, setData] = useState({ products: [], categories: [], brands: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [stockStatus, setStockStatus] = useState('all'); // all, in, out
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [sortOption, setSortOption] = useState('newest');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [contactProduct, setContactProduct] = useState(null);
  const [compareList, setCompareList] = useState([]);
  
  const toggleCompare = (product) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.filter(p => p.id !== product.id);
      if (prev.length >= 4) {
        window.dispatchEvent(new CustomEvent('show_toast', { detail: { type: 'error', message: 'Maximum 4 products for comparison' } }));
        return prev;
      }
      return [...prev, product];
    });
  };
  
  const location = useLocation();
  const navigate = useNavigate();

  const loadSupabaseData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: parsedProducts, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const productsList = parsedProducts || [];
      const cats = [...new Set(productsList.map(p => p.category).filter(Boolean))];
      const brands = [...new Set(productsList.map(p => p.brand).filter(Boolean))];
      
      setData({
        products: productsList,
        categories: cats,
        brands: brands
      });
      
      if (productsList.length > 0) {
        const maxPrice = Math.max(...productsList.map(p => Number(p.price) || 0), 0);
        setPriceRange(prev => ({ ...prev, max: maxPrice }));
      }
    } catch (error) {
      console.error("Failed to load products from Supabase:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSupabaseData();

    // Global Search Listener
    const handleGlobalSearch = (e) => {
      setSearchQuery(e.detail);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('search_inventory', handleGlobalSearch);
    
    return () => window.removeEventListener('search_inventory', handleGlobalSearch);
  }, [loadSupabaseData]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('category')) setSelectedCategory(params.get('category'));
    if (params.get('brand')) setSelectedBrand(params.get('brand'));
    if (params.get('search')) setSearchQuery(params.get('search'));
  }, [location.search]);

  // Filtering Logic
  let filteredProducts = data.products.filter(product => {
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesBrand = selectedBrand ? product.brand === selectedBrand : true;
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStock = 
      stockStatus === 'all' ? true : 
      stockStatus === 'in' ? product.stock > 0 : 
      product.stock === 0;
    
    const matchesPrice = Number(product.price) >= priceRange.min && Number(product.price) <= priceRange.max;
    
    return matchesCategory && matchesBrand && matchesSearch && matchesStock && matchesPrice;
  });

  // Sorting Logic
  filteredProducts.sort((a, b) => {
    switch (sortOption) {
      case 'newest': return b.id - a.id;
      case 'oldest': return a.id - b.id;
      case 'price_asc': return Number(a.price) - Number(b.price);
      case 'price_desc': return Number(b.price) - Number(a.price);
      case 'stock_low': return a.stock - b.stock;
      case 'stock_high': return b.stock - a.stock;
      case 'alpha': return a.name.localeCompare(b.name);
      default: return 0;
    }
  });

  const paginatedProducts = filteredProducts.slice(0, visibleCount);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="fade-in">
      <div style={{ 
        marginBottom: window.innerWidth < 480 ? '1.5rem' : '3rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '1rem' 
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h2 className="font-poppins" style={{ 
            background: 'linear-gradient(90deg, #fff, #64748b)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            marginBottom: '0.2rem',
            fontSize: 'var(--fs-xl)'
          }}>Inventory Explorer</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Hardware assets across {data.categories.length} categories.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="glass-card" style={{ padding: '0.4rem 0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Box size={18} color="var(--accent-blue)" />
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '800' }}>{filteredProducts.length}</div>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Results</div>
            </div>
          </div>
          <button 
            className="btn btn-outline" 
            style={{ 
              display: window.innerWidth < 1024 ? 'flex' : 'none', 
              padding: '0', 
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              minHeight: 'auto',
              justifyContent: 'center'
            }}
            onClick={() => setShowMobileFilters(true)}
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      <div className="products-layout">
        {/* Sidebar Filters */}
        <aside className={`filter-sidebar ${showMobileFilters ? 'active' : ''}`}>
          <div className="glass-card" style={{ 
            padding: window.innerWidth < 480 ? '1.25rem' : '1.5rem', 
            position: 'relative',
            height: window.innerWidth < 1024 ? '100%' : 'auto',
            borderRadius: window.innerWidth < 1024 ? '0' : 'var(--radius-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h4 className="font-poppins" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={18} color="var(--accent-blue)" /> Filter Controls
              </h4>
              <button 
                className="btn-outline mobile-only" 
                style={{ border: 'none', background: 'transparent', padding: '0.25rem' }}
                onClick={() => setShowMobileFilters(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block', letterSpacing: '0.5px' }}>Sort Inventory</label>
              <select className="input-field" value={sortOption} onChange={(e) => setSortOption(e.target.value)} style={{ fontSize: '0.85rem', height: '42px' }}>
                <option value="newest">Newest Arrival</option>
                <option value="oldest">Oldest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="stock_low">Stock: Low to High</option>
                <option value="stock_high">Stock: High to Low</option>
                <option value="alpha">Alphabetical</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'block', letterSpacing: '0.5px' }}>Stock Availability</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {['all', 'in', 'out'].map(status => (
                  <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input 
                      type="radio" 
                      name="stock" 
                      checked={stockStatus === status} 
                      onChange={() => setStockStatus(status)} 
                      style={{ accentColor: 'var(--accent-blue)', width: '16px', height: '16px' }}
                    />
                    {status === 'all' ? 'All Items' : status === 'in' ? 'In Stock' : 'Out of Stock'}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'block', letterSpacing: '0.5px' }}>Price Window (₹)</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="Min" 
                  style={{ padding: '0.5rem', height: '38px', fontSize: '0.8rem' }}
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                />
                <span style={{ color: 'var(--text-muted)' }}>-</span>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="Max" 
                  style={{ padding: '0.5rem', height: '38px', fontSize: '0.8rem' }}
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block', letterSpacing: '0.5px' }}>Manufacturer</label>
              <select className="input-field" value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} style={{ fontSize: '0.85rem', height: '42px' }}>
                <option value="">All Brands</option>
                {data.brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1rem', display: window.innerWidth < 1024 ? 'flex' : 'none' }}
              onClick={() => setShowMobileFilters(false)}
            >
              Update View
            </button>
            
            {(selectedCategory || selectedBrand || stockStatus !== 'all' || searchQuery) && (
              <button 
                className="btn btn-outline" 
                style={{ width: '100%', marginTop: '0.75rem', border: 'none', color: 'var(--error)', fontSize: '0.75rem' }} 
                onClick={() => {
                  setSelectedCategory(''); setSelectedBrand(''); setStockStatus('all'); setSearchQuery('');
                  if (window.innerWidth < 1024) setShowMobileFilters(false);
                }}
              >
                Reset All Filters
              </button>
            )}
          </div>
        </aside>

        {/* Product List Area */}
        <main style={{ minWidth: 0 }}>
          <div className="chips-container" style={{ 
            marginBottom: '1.5rem', 
            paddingBottom: '0.5rem',
            marginHorizontal: window.innerWidth < 480 ? '-1rem' : '0',
            paddingHorizontal: window.innerWidth < 480 ? '1rem' : '0'
          }}>
            <span className={`chip ${!selectedCategory ? 'active' : ''}`} onClick={() => setSelectedCategory('')}>All Systems</span>
            {data.categories.map(cat => (
              <span 
                key={cat} 
                className={`chip ${selectedCategory === cat ? 'active' : ''}`} 
                onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
              >
                {cat}
              </span>
            ))}
          </div>

          {loading ? (
            <div className="product-grid">
              {[1,2,3,4].map(i => (
                <div key={i} className="glass-card skeleton" style={{ height: '240px' }} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state glass-card" style={{ padding: '3rem 1.5rem' }}>
              <div className="empty-icon" style={{ marginBottom: '1rem' }}><Search size={48} color="var(--text-muted)" /></div>
              <h3 className="font-poppins" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Zero results found</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>We couldn't find any hardware matching your current parameters.</p>
              <button className="btn btn-primary" onClick={() => { setSearchQuery(''); setSelectedCategory(''); setSelectedBrand(''); }}>
                Reset Explorer
              </button>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {paginatedProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onClick={setSelectedProduct} 
                    onInquire={setContactProduct}
                  />
                ))}
              </div>
              
              {visibleCount < filteredProducts.length && (
                <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
                  <button className="btn btn-outline" onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)} style={{ minWidth: '180px' }}>
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {selectedProduct && (
        <ProductDetailsModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onInquire={(p) => { setSelectedProduct(null); setContactProduct(p); }}
          onCompare={(p) => { toggleCompare(p); setSelectedProduct(null); }}
        />
      )}

      {/* Comparison Floating Bar */}
      {compareList.length > 0 && (
        <div className="glass-card fade-in" style={{
          position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          width: window.innerWidth < 768 ? 'calc(100% - 2rem)' : '600px',
          padding: '1rem', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: '1px solid var(--accent-blue)', boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
          background: 'rgba(10, 10, 12, 0.95)'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--accent-blue)' }}>{compareList.length} ASSETS SELECTED</div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {compareList.map(p => (
                <div key={p.id} style={{ width: '32px', height: '32px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                  <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
             <button className="btn btn-primary" style={{ height: '36px', fontSize: '0.8rem' }} onClick={() => navigate('/compare', { state: { products: compareList } })}>Compare Now</button>
             <button className="btn-outline" style={{ border: 'none' }} onClick={() => setCompareList([])}><X size={18} /></button>
          </div>
        </div>
      )}

      {contactProduct && (
        <ContactModal 
          product={contactProduct} 
          onClose={() => setContactProduct(null)} 
        />
      )}
    </div>
  );
};

export default Products;


