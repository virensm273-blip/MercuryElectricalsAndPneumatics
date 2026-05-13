import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';

const INITIAL_PRODUCTS = [
  {"name":"Pneumatic Valve PV-101","model":"PV-101","category":"Pneumatic","subcategory":"Valves","brand":"Festo","price":1200,"stock":15},
  {"name":"Pneumatic Valve PV-102","model":"PV-102","category":"Pneumatic","subcategory":"Valves","brand":"SMC","price":1350,"stock":10},
  {"name":"Pneumatic Valve PV-103","model":"PV-103","category":"Pneumatic","subcategory":"Valves","brand":"Airtac","price":1100,"stock":0},
  {"name":"Air Cylinder CY-201","model":"CY-201","category":"Pneumatic","subcategory":"Cylinders","brand":"Festo","price":2500,"stock":8},
  {"name":"Air Cylinder CY-202","model":"CY-202","category":"Pneumatic","subcategory":"Cylinders","brand":"SMC","price":2700,"stock":5},
  {"name":"Air Cylinder CY-203","model":"CY-203","category":"Pneumatic","subcategory":"Cylinders","brand":"Airtac","price":2600,"stock":0},
  {"name":"Pneumatic Fitting FT-301","model":"FT-301","category":"Pneumatic","subcategory":"Fittings","brand":"Festo","price":300,"stock":50},
  {"name":"Pneumatic Fitting FT-302","model":"FT-302","category":"Pneumatic","subcategory":"Fittings","brand":"SMC","price":350,"stock":40},
  {"name":"Pneumatic Fitting FT-303","model":"FT-303","category":"Pneumatic","subcategory":"Fittings","brand":"Airtac","price":280,"stock":0},
  {"name":"PU Tube TB-401","model":"TB-401","category":"Pneumatic","subcategory":"Tubes","brand":"Festo","price":900,"stock":20},
  {"name":"PU Tube TB-402","model":"TB-402","category":"Pneumatic","subcategory":"Tubes","brand":"SMC","price":950,"stock":18},
  {"name":"PU Tube TB-403","model":"TB-403","category":"Pneumatic","subcategory":"Tubes","brand":"Airtac","price":880,"stock":0},
  {"name":"Air Filter AF-501","model":"AF-501","category":"Pneumatic","subcategory":"Air Preparation Units","brand":"Festo","price":1800,"stock":12},
  {"name":"Air Filter AF-502","model":"AF-502","category":"Pneumatic","subcategory":"Air Preparation Units","brand":"SMC","price":1900,"stock":10},
  {"name":"Air Filter AF-503","model":"AF-503","category":"Pneumatic","subcategory":"Air Preparation Units","brand":"Airtac","price":1750,"stock":0},
  {"name":"Solenoid Valve SV-601","model":"SV-601","category":"Pneumatic","subcategory":"Valves","brand":"Festo","price":2200,"stock":7},
  {"name":"Solenoid Valve SV-602","model":"SV-602","category":"Pneumatic","subcategory":"Valves","brand":"SMC","price":2300,"stock":6},
  {"name":"Solenoid Valve SV-603","model":"SV-603","category":"Pneumatic","subcategory":"Valves","brand":"Airtac","price":2100,"stock":0},
  {"name":"Mini Cylinder MC-701","model":"MC-701","category":"Pneumatic","subcategory":"Cylinders","brand":"Festo","price":1500,"stock":9},
  {"name":"Mini Cylinder MC-702","model":"MC-702","category":"Pneumatic","subcategory":"Cylinders","brand":"SMC","price":1600,"stock":7},
  {"name":"Mini Cylinder MC-703","model":"MC-703","category":"Pneumatic","subcategory":"Cylinders","brand":"Airtac","price":1550,"stock":0},
  {"name":"Quick Coupler QC-801","model":"QC-801","category":"Pneumatic","subcategory":"Fittings","brand":"Festo","price":500,"stock":30},
  {"name":"Quick Coupler QC-802","model":"QC-802","category":"Pneumatic","subcategory":"Fittings","brand":"SMC","price":550,"stock":25},
  {"name":"Quick Coupler QC-803","model":"QC-803","category":"Pneumatic","subcategory":"Fittings","brand":"Airtac","price":520,"stock":0},
  {"name":"FRL Unit FRL-901","model":"FRL-901","category":"Pneumatic","subcategory":"Air Preparation Units","brand":"Festo","price":3200,"stock":6},
  {"name":"FRL Unit FRL-902","model":"FRL-902","category":"Pneumatic","subcategory":"Air Preparation Units","brand":"SMC","price":3400,"stock":5},
  {"name":"FRL Unit FRL-903","model":"FRL-903","category":"Pneumatic","subcategory":"Air Preparation Units","brand":"Airtac","price":3100,"stock":0}
].map((p, idx) => ({ ...p, id: (idx+1).toString(), inStock: p.stock > 0 }));

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // 1. Check local storage
    const stored = localStorage.getItem('products');
    
    // 2. Parse or Auto-seed
    if (stored && JSON.parse(stored).length > 0) {
      console.log('✅ Data loaded from localStorage successfully!');
      const parsed = JSON.parse(stored);
      console.log(`Loaded ${parsed.length} products.`);
      setProducts(parsed);
    } else {
      console.log('⚠️ LocalStorage is empty! Auto-Seeding 27 sample records...');
      localStorage.setItem('products', JSON.stringify(INITIAL_PRODUCTS));
      setProducts(INITIAL_PRODUCTS);
      console.log('✅ Auto-seed completed. Inserted 27 products.');
    }
  }, []);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>All Products</h2>
        <p style={{ color: 'var(--text-muted)' }}>Showing {products.length} items</p>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          No products available.
        </div>
      ) : (
        <div className="product-list">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
