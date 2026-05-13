const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');
const JWT_SECRET = 'mercury-super-secret-key-in-production-change-this';

app.use(cors());
app.use(express.json());

// Path to static frontend files
let STATIC_FRONTEND = path.join(__dirname, '../frontend');

// Diagnostic: Log environment and paths
console.log('--- STATIC DEPLOYMENT DIAGNOSTICS ---');
console.log('Current Directory (cwd):', process.cwd());
console.log('Server Directory (__dirname):', __dirname);

try {
  const parentFiles = require('fs').readdirSync(path.join(__dirname, '..'));
  console.log('Parent Directory Contents:', parentFiles);
  
  // Try to find the frontend folder case-insensitively
  const frontendFolder = parentFiles.find(f => f.toLowerCase() === 'frontend');
  if (frontendFolder) {
    STATIC_FRONTEND = path.join(__dirname, '..', frontendFolder);
    console.log('Found frontend folder at:', STATIC_FRONTEND);
  }
} catch (e) {
  console.log('Error reading parent directory:', e.message);
}

console.log('Serving static frontend from:', STATIC_FRONTEND);

// Serve static files from the frontend directory
app.use(express.static(STATIC_FRONTEND));

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
        // Pneumatic Valves
        {"name":"Directional Control Valve","model":"VUVS-L20-M52-AD-G18-F7","category":"Pneumatic Valves","brand":"Festo","price":4850,"stock":12},
        {"name":"Compact Solenoid Valve","model":"SY3120-5LZD-M5","category":"Pneumatic Valves","brand":"SMC","price":3200,"stock":25},
        {"name":"5/2 Pilot Valve","model":"4V210-08","category":"Pneumatic Valves","brand":"Airtac","price":1850,"stock":40},
        {"name":"Mechanical Push Button Valve","model":"VME220-02-01","category":"Pneumatic Valves","brand":"SMC","price":2100,"stock":15},
        
        // Cylinders
        {"name":"ISO Standard Cylinder","model":"DSBC-32-100-PPVA-N3","category":"Cylinders","brand":"Festo","price":7500,"stock":8},
        {"name":"Compact Cylinder","model":"CQ2B32-50DMZ","category":"Cylinders","brand":"SMC","price":4200,"stock":20},
        {"name":"Mini Cylinder Stainless Steel","model":"MA-20-50-S-CM","category":"Cylinders","brand":"Airtac","price":2450,"stock":30},
        {"name":"Rotary Actuator","model":"CRB2BW30-90SZ","category":"Cylinders","brand":"SMC","price":12800,"stock":4},
        
        // Sensors
        {"name":"Inductive Proximity Sensor","model":"LJ12A3-4-Z/BX","category":"Sensors","brand":"Omron","price":850,"stock":100},
        {"name":"Photoelectric Sensor","model":"E3Z-R61","category":"Sensors","brand":"Omron","price":3800,"stock":15},
        {"name":"Pressure Transmitter","model":"S-11","category":"Sensors","brand":"Schneider Electric","price":9200,"stock":6},
        {"name":"Laser Distance Sensor","model":"HG-C1100","category":"Sensors","brand":"Panasonic","price":18500,"stock":3},
        
        // PLC Components
        {"name":"SIMATIC S7-1200 CPU","model":"CPU 1214C DC/DC/DC","category":"PLC Components","brand":"Siemens","price":24500,"stock":5},
        {"name":"Digital Input Module","model":"SM 1221","category":"PLC Components","brand":"Siemens","price":8200,"stock":12},
        {"name":"PLC Logic Relay","model":"Zelio Logic SR2","category":"PLC Components","brand":"Schneider Electric","price":11500,"stock":8},
        {"name":"Analog Output Module","model":"NX-DA3603","category":"PLC Components","brand":"Omron","price":14200,"stock":4},
        
        // Motors & Drives
        {"name":"VFD Variable Frequency Drive","model":"ATV312HU15N4","category":"Motors","brand":"Schneider Electric","price":18500,"stock":7},
        {"name":"Stepper Motor NEMA 23","model":"57HS22-A","category":"Motors","brand":"Bosch","price":3400,"stock":25},
        {"name":"Servo Drive","model":"Lexium 32","category":"Motors","brand":"Schneider Electric","price":42000,"stock":2},
        {"name":"Three-Phase Induction Motor","model":"1LA7070","category":"Motors","brand":"Siemens","price":15800,"stock":6},
        
        // Compressors & Air Prep
        {"name":"FRL Unit (Filter-Regulator-Lubricator)","model":"MS6-LFR-1/2-D7-CRM","category":"Compressors","brand":"Festo","price":9500,"stock":10},
        {"name":"Auto Drain Valve","model":"AD402-04","category":"Compressors","brand":"SMC","price":2800,"stock":18},
        {"name":"Air Dryer Refrigerated","model":"IDFA3E-23","category":"Compressors","brand":"SMC","price":85000,"stock":1},
        {"name":"Pressure Switch Digital","model":"ISE30A-01-N-L","category":"Compressors","brand":"SMC","price":4500,"stock":22},
        
        // Solenoid Valves (Specific)
        {"name":"Steam Solenoid Valve","model":"2W21-20","category":"Solenoid Valves","brand":"Janatics","price":3800,"stock":14},
        {"name":"Chemical Resistant Valve","model":"LVM10R1-5G-1","category":"Solenoid Valves","brand":"SMC","price":5200,"stock":9},
        {"name":"Pulse Jet Valve","model":"SCG353A044","category":"Solenoid Valves","brand":"ASCO","price":6800,"stock":11},
        
        // Pneumatic Fittings
        {"name":"Push-In Fitting Elbow","model":"QS-1/4-8","category":"Pneumatic Fittings","brand":"Festo","price":120,"stock":500},
        {"name":"Y-Connector","model":"KQ2Y08-02AS","category":"Pneumatic Fittings","brand":"SMC","price":180,"stock":300},
        {"name":"Flow Control Silencer","model":"ASN2-M5","category":"Pneumatic Fittings","brand":"SMC","price":450,"stock":150}
      ];

      const products = rawProducts.map((p, idx) => ({
         ...p,
         id: (idx + 1).toString(),
         inStock: p.stock > 0,
         specs: `Premium ${(p.category || 'industrial').toLowerCase()} component. High-performance industrial grade asset.`,
         images: [],
         image: '',
         tags: idx % 2 === 0 ? ['Premium', 'New'] : ['Fast Moving'],
         supplier: 'Mercury Direct',
         updatedAt: new Date().toISOString()
      }));

      db.categories = categories;
      db.subcategories = subcategories;
      db.brands = brands;
      db.products = products;
      db.logs = [
        {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          action: 'SYSTEM',
          details: { name: 'Database Initialized' },
          user: 'System'
        }
      ];
      
      await writeDB(db);
      console.log('Auto-seed completed.');
    }
  } catch (error) {
    console.error('Failed to auto-seed database:', error);
  }
}

// Add activity log routes
app.get('/api/activity', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.logs || []);
  } catch (error) {
    res.status(500).json({ message: 'Error reading logs' });
  }
});

app.post('/api/activity', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    if (!db.logs) db.logs = [];
    const newLog = { id: Date.now(), timestamp: new Date().toISOString(), ...req.body };
    db.logs = [newLog, ...db.logs].slice(0, 100);
    await writeDB(db);
    res.status(201).json(newLog);
  } catch (error) {
    res.status(500).json({ message: 'Error saving log' });
  }
});

// SPA Fallback - Serve index.html for any remaining routes
app.use((req, res) => {
  const indexPath = path.join(STATIC_FRONTEND, 'index.html');
  console.log('Attempting to serve index.html from:', indexPath);
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('FAILED to serve index.html:', err.message);
      res.status(404).send(`
        <h1>Mercury Frontend Error</h1>
        <p>Could not find index.html at: ${indexPath}</p>
        <p>Current Directory: ${process.cwd()}</p>
        <p>Please check your file structure on Render.</p>
      `);
    }
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
==================================================
  MERCURY INDUSTRIAL BUSINESS OS - SERVER READY
==================================================
  Status: Production Stable
  Port: ${PORT}
  Host: 0.0.0.0
  Time: ${new Date().toISOString()}
  Endpoint: http://localhost:${PORT}
==================================================
  `);
  
  // Initialize DB after server starts
  initializeDB().catch(err => console.error('Startup DB Init Failed:', err));
});
