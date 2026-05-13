const fs = require('fs');
const path = require('path');

const categories = ["Pneumatic", "Electrical", "Tools", "Accessories"];
const subcategories = [
  // Pneumatic specific
  { id: "s1", name: "Valves", category: "Pneumatic" },
  { id: "s2", name: "Cylinders", category: "Pneumatic" },
  { id: "s3", name: "Fittings", category: "Pneumatic" },
  { id: "s4", name: "Tubes", category: "Pneumatic" },
  { id: "s5", name: "Air Preparation Units", category: "Pneumatic" },
  // Keep some electrical so app still has them
  { id: "e1", name: "Switches", category: "Electrical" }
];
const brands = ["Brand A", "Brand B", "Brand C"];

const products = [];

// Helper
const randomEl = arr => arr[Math.floor(Math.random() * arr.length)];
const randomPrice = (min, max) => Math.floor(Math.random() * (max - min) + min);

const pneuSubs = ["Valves", "Cylinders", "Fittings", "Tubes", "Air Preparation Units"];
const features = ["High Flow", "Miniature", "Heavy Duty", "Standard", "Precision"];

for(let i=1; i<=30; i++) {
  let sub = randomEl(pneuSubs);
  let brand = randomEl(brands);
  let isStock = Math.random() > 0.15; // 85% chance in stock
  let stockQ = isStock ? Math.floor(Math.random() * 50) + 1 : 0;
  let price = randomPrice(200, 4500);

  products.push({
    id: i.toString(),
    name: `${randomEl(features)} Pneumatic ${sub.slice(0, -1)}`,
    model: `PNM-${brand.charAt(6)}-${Math.floor(Math.random()*9000)+1000}`,
    category: "Pneumatic",
    subcategory: sub,
    brand: brand,
    price: price,
    stock: stockQ,
    inStock: isStock,
    specs: `High quality ${sub.toLowerCase()} by ${brand}. Suitable for industrial air systems.`
  });
}

// Add a few non-pneumatic to keep other categories functioning
products.push({ id: '31', name: 'Electrical Toggle Switch', model: 'ET-100', category: 'Electrical', subcategory: 'Switches', brand: 'Brand A', price: 150, stock: 20, inStock: true, specs: '10A 220V' });

const db = {
  categories,
  subcategories,
  brands,
  products
};

fs.writeFileSync(path.join(__dirname, 'data', 'db.json'), JSON.stringify(db, null, 2));
console.log('Generated 30+ products successfully.');
