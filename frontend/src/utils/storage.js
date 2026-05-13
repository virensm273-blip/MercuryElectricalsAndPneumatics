export const STORAGE_KEYS = {
  PRODUCTS: 'mercury_products',
  LOGS: 'mercury_activity_logs',
  TOKEN: 'mercury_admin_token',
  SETTINGS: 'mercury_store_settings',
  INQUIRIES: 'mercury_inquiries',
  QUOTATIONS: 'mercury_quotations',
  SUPPLIERS: 'mercury_suppliers',
  CUSTOMERS: 'mercury_customers',
  NOTIFICATIONS: 'mercury_notifications'
};

export const safeGet = (key, fallback = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return fallback;
  }
};

export const safeSet = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Dispatch a custom event to notify other components of the change
    window.dispatchEvent(new CustomEvent('storage_updated', { detail: { key } }));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
};

export const seedBusinessData = () => {
  const inquiries = safeGet(STORAGE_KEYS.INQUIRIES);
  if (inquiries.length === 0) {
    const sampleInquiries = [
      {
        id: 'INQ-101',
        name: 'Industrial Solutions Ltd',
        phone: '+91 98765 43210',
        email: 'procurement@indsols.com',
        productName: 'High-Pressure Valve PV-900',
        date: new Date(Date.now() - 86400000).toISOString(),
        status: 'Negotiating',
        notes: 'Requested bulk pricing for 50 units.',
        history: [{ date: new Date(Date.now() - 86400000).toISOString(), action: 'Inquiry Created', note: 'Web portal entry' }]
      },
      {
        id: 'INQ-102',
        name: 'Apex Engineering',
        phone: '+91 91234 56789',
        email: 'rajesh@apexeng.in',
        productName: 'Pneumatic Actuator X-1',
        date: new Date(Date.now() - 172800000).toISOString(),
        status: 'New Inquiry',
        notes: 'Interested in technical specifications.',
        history: [{ date: new Date(Date.now() - 172800000).toISOString(), action: 'Inquiry Created', note: 'WhatsApp contact' }]
      }
    ];
    safeSet(STORAGE_KEYS.INQUIRIES, sampleInquiries);
  }

  const suppliers = safeGet(STORAGE_KEYS.SUPPLIERS);
  if (suppliers.length === 0) {
    const sampleSuppliers = [
      { id: 'SUP-001', name: 'SMC Pneumatics', email: 'support@smc.com', phone: '1800-SMC-IND', category: 'Pneumatic' },
      { id: 'SUP-002', name: 'Festo Industrial', email: 'sales@festo.in', phone: '011-2345-6789', category: 'Automation' }
    ];
    safeSet(STORAGE_KEYS.SUPPLIERS, sampleSuppliers);
  }
};

export const syncWithBackend = async (force = false) => {
  seedBusinessData(); // Seed on every sync check
  const localProducts = safeGet(STORAGE_KEYS.PRODUCTS);
  if (localProducts.length > 0 && !force) return localProducts;

  try {
    const response = await fetch(`${API_BASE}/products`);
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data)) {
        safeSet(STORAGE_KEYS.PRODUCTS, data);
        return data;
      }
    }
  } catch (error) {
    console.warn("Backend sync failed, using local data only.");
  }
  return localProducts;
};

export const syncLogsWithBackend = async (force = false) => {
  const localLogs = safeGet(STORAGE_KEYS.LOGS);
  if (localLogs.length > 0 && !force) return localLogs;

  try {
    const response = await fetch(`${API_BASE}/activity`);
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data)) {
        safeSet(STORAGE_KEYS.LOGS, data);
        return data;
      }
    }
  } catch (error) {
    console.warn("Backend logs sync failed.");
  }
  return localLogs;
};
