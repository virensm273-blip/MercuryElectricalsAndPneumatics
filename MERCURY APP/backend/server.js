const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');
const JWT_SECRET = 'mercury-super-secret-key-in-production-change-this';

app.use(cors());
app.use(express.json());

// Helper functions
async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { products: [], categories: [], subcategories: [], brands: [] };
    }
    throw error;
  }
}

async function writeDB(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied: No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Access denied: Invalid token' });
    req.user = user;
    next();
  });
}

// --- PUBLIC ROUTES ---
app.get('/api/data', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db);
  } catch (error) {
    res.status(500).json({ message: 'Error reading database' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.products || []);
  } catch (error) {
    res.status(500).json({ message: 'Error reading products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const db = await readDB();
    const product = (db.products || []).find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error finding product' });
  }
});

// --- PROTECTED ADMIN ROUTES ---
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    const newProduct = {
      id: Date.now().toString(),
      ...req.body,
      inStock: req.body.stock > 0
    };
    if (!db.products) db.products = [];
    db.products.push(newProduct);
    await writeDB(db);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error adding product' });
  }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    if (!db.products) db.products = [];
    const index = db.products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Product not found' });
    
    db.products[index] = { ...db.products[index], ...req.body, inStock: req.body.stock > 0 };
    await writeDB(db);
    res.json(db.products[index]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product' });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    if (!db.products) db.products = [];
    const filteredProducts = db.products.filter(p => p.id !== req.params.id);
    if (db.products.length === filteredProducts.length) {
      return res.status(404).json({ message: 'Product not found' });
    }
    db.products = filteredProducts;
    await writeDB(db);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// Update global db fields (categories, subcategories, brands)
app.put('/api/config', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    if (req.body.categories) db.categories = req.body.categories;
    if (req.body.subcategories) db.subcategories = req.body.subcategories;
    if (req.body.brands) db.brands = req.body.brands;
    await writeDB(db);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error updating config' });
  }
});


// Admin Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
});

async function initializeDB() {
  try {
    const db = await readDB();
    if (!db.products || db.products.length === 0) {
      console.log('Database empty! Auto-seeding specific pneumatic products...');
      const categories = ["Pneumatic", "Electrical", "Tools", "Accessories"];
      const subcategories = [
        { id: "s1", name: "Valves", category: "Pneumatic" },
        { id: "s2", name: "Cylinders", category: "Pneumatic" },
        { id: "s3", name: "Fittings", category: "Pneumatic" },
        { id: "s4", name: "Tubes", category: "Pneumatic" },
        { id: "s5", name: "Air Preparation Units", category: "Pneumatic" },
        { id: "e1", name: "Switches", category: "Electrical" }
      ];
      const brands = ["Festo", "SMC", "Airtac"];
      
      const rawProducts = [
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
      ];

      const products = rawProducts.map((p, idx) => ({
         ...p,
         id: (idx + 1).toString(),
         inStock: p.stock > 0,
         specs: `Premium ${p.subcategory.toLowerCase()} component. Designed for heavy industrial applications.`
      }));

      db.categories = categories;
      db.subcategories = subcategories;
      db.brands = brands;
      db.products = products;
      
      await writeDB(db);
      console.log('Auto-seed completed.');
    }
  } catch (error) {
    console.error('Failed to auto-seed database:', error);
  }
}

// Start Server after initializing DB
initializeDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Mercury server running on http://localhost:${PORT}`);
  });
});
