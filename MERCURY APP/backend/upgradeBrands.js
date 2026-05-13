const fs = require('fs/promises');
const path = require('path');

async function upgradeBrands() {
  const serverPath = path.join(__dirname, 'server.js');
  const dbPath = path.join(__dirname, 'data', 'db.json');

  // Update server.js
  let serverCode = await fs.readFile(serverPath, 'utf8');
  serverCode = serverCode.replace(/"Brand A"/g, '"Festo"');
  serverCode = serverCode.replace(/"Brand B"/g, '"SMC"');
  serverCode = serverCode.replace(/"Brand C"/g, '"Airtac"');
  await fs.writeFile(serverPath, serverCode, 'utf8');
  console.log('Updated server.js');

  // Update db.json
  try {
    let dbData = await fs.readFile(dbPath, 'utf8');
    let db = JSON.parse(dbData);
    
    // Modify products
    if (db.products) {
      db.products = db.products.map(p => {
        if (p.brand === 'Brand A') p.brand = 'Festo';
        if (p.brand === 'Brand B') p.brand = 'SMC';
        if (p.brand === 'Brand C') p.brand = 'Airtac';
        return p;
      });
    }

    // Modify brands array
    if (db.brands) {
      db.brands = db.brands.map(b => {
        if (b === 'Brand A') return 'Festo';
        if (b === 'Brand B') return 'SMC';
        if (b === 'Brand C') return 'Airtac';
        return b;
      });
      // Deduplicate in case
      db.brands = [...new Set(db.brands)];
    }

    await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8');
    console.log('Updated db.json');
  } catch(e) {
    console.error('No db.json found or invalid JSON. Skipping db update.');
  }
}

upgradeBrands();
