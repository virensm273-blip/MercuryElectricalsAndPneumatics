import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Filter, ArrowDownAz, ArrowUp10 } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const API_BASE = 'http://localhost:5000/api';

const Products = () => {
  const [data, setData] = useState({ products: [], categories: [], subcategories: [], brands: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortOption, setSortOption] = useState(''); // 'name', 'price_asc', 'price_desc'
  
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let dbData;
        const localProds = localStorage.getItem('products');
        
        if (localProds) {
          // Read products from localStorage key "products" and parse JSON data
          const parsedProducts = JSON.parse(localProds);
          const cats = [...new Set(parsedProducts.map(p => p.category).filter(Boolean))];
          const brands = [...new Set(parsedProducts.map(p => p.brand).filter(Boolean))];
          const subs = [...new Set(parsedProducts.map(p => JSON.stringify({ name: p.subcategory, category: p.category })))].map(s => JSON.parse(s)).filter(s => s.name);
          
          dbData = {
            products: parsedProducts,
            categories: cats.length ? cats : ['Pneumatic', 'Electrical', 'Tools', 'Accessories'],
            brands: brands.length ? brands : ['Festo', 'SMC', 'Airtac'],
            subcategories: subs
          };
        } else {
          // Fallback to API if no localStorage available
          const response = await axios.get(`${API_BASE}/data`);
          dbData = response.data;
        }
        setData(dbData);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Parse URL params initially
    const params = new URLSearchParams(location.search);
    if (params.get('category')) setSelectedCategory(params.get('category'));
    if (params.get('brand')) setSelectedBrand(params.get('brand'));
    if (params.get('search')) setSearchQuery(params.get('search'));
  }, [location.search]);

  // Handle Category Change
  const handleCategoryChange = (cat) => {
    if (selectedCategory === cat) {
      setSelectedCategory('');
      setSelectedSub(''); // Clear sub when category is cleared
    } else {
      setSelectedCategory(cat);
      setSelectedSub(''); // Reset sub when new category
    }
  };

  // Derive available subcategories based on selected category
  const availableSubs = data.subcategories.filter(sub => sub.category === selectedCategory);

  // Filter logic
  let filteredProducts = data.products.filter(product => {
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesSub = selectedSub ? product.subcategory === selectedSub : true;
    const matchesBrand = selectedBrand ? product.brand === selectedBrand : true;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSub && matchesBrand && matchesSearch;
  });

  // Sort logic
  if (sortOption === 'name') {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOption === 'price_asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price_desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem', position: 'sticky', top: '72px', zIndex: 10, background: 'var(--bg-color)', paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div className="search-container" style={{ marginBottom: '1rem' }}>
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search by name or model..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories Chips */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none', paddingBottom: '0.5rem' }}>
          {data.categories.map((cat, idx) => (
            <button 
              key={idx}
              onClick={() => handleCategoryChange(cat)}
              style={{
                padding: '0.5rem 1rem', borderRadius: '9999px', whiteSpace: 'nowrap',
                background: selectedCategory === cat ? 'var(--primary)' : 'var(--surface)',
                color: selectedCategory === cat ? 'white' : 'var(--text-main)',
                border: `1px solid ${selectedCategory === cat ? 'var(--primary)' : 'var(--border)'}`,
                cursor: 'pointer', transition: 'all 0.2s', fontWeight: '500'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Subcategories Chips (Shows if Category is selected) */}
        {selectedCategory && availableSubs.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none', marginTop: '0.5rem' }}>
            {availableSubs.map(sub => (
              <button 
                key={sub.id}
                onClick={() => setSelectedSub(selectedSub === sub.name ? '' : sub.name)}
                style={{
                  padding: '0.35rem 0.85rem', borderRadius: '4px', fontSize: '0.875rem', whiteSpace: 'nowrap',
                  background: selectedSub === sub.name ? 'var(--secondary)' : 'var(--surface)',
                  color: selectedSub === sub.name ? 'white' : 'var(--text-main)',
                  border: `1px solid ${selectedSub === sub.name ? 'var(--secondary)' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* Filter & Sort Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <select 
            value={selectedBrand} 
            onChange={(e) => setSelectedBrand(e.target.value)}
            style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', outline: 'none' }}
          >
            <option value="">All Brands</option>
            {data.brands.map((b, i) => <option key={i} value={b}>{b}</option>)}
          </select>

          <select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
            style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', outline: 'none' }}
          >
            <option value="">Sort By</option>
            <option value="name">Name (A-Z)</option>
            <option value="price_asc">Price (Low to High)</option>
            <option value="price_desc">Price (High to Low)</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Results</h2>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{filteredProducts.length} items</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <p>No products available</p>
          <button className="btn btn-secondary" style={{ marginTop: '1rem', width: 'auto' }} onClick={() => {
            setSelectedCategory(''); setSelectedSub(''); setSelectedBrand(''); setSearchQuery('');
          }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="product-list">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
