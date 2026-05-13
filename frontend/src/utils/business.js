import { safeGet, safeSet, STORAGE_KEYS } from './storage';

// --- INQUIRY MANAGEMENT ---

export const getInquiries = () => safeGet(STORAGE_KEYS.INQUIRIES, []);

export const addInquiry = (inquiry) => {
  const inquiries = getInquiries();
  const newInquiry = {
    id: `INQ-${Date.now()}`,
    date: new Date().toISOString(),
    status: 'New Inquiry',
    notes: '',
    history: [{ date: new Date().toISOString(), action: 'Inquiry Created', note: 'Customer reached out' }],
    ...inquiry
  };
  const updated = [newInquiry, ...inquiries];
  safeSet(STORAGE_KEYS.INQUIRIES, updated);
  
  // Trigger notification
  window.dispatchEvent(new CustomEvent('show_toast', { 
    detail: { type: 'success', message: `New inquiry from ${inquiry.name}` } 
  }));
  
  return newInquiry;
};

export const updateInquiryStatus = (id, status, note = '') => {
  const inquiries = getInquiries();
  const updated = inquiries.map(inq => {
    if (inq.id === id) {
      return {
        ...inq,
        status,
        lastContactDate: new Date().toISOString(),
        history: [...inq.history, { date: new Date().toISOString(), action: `Status changed to ${status}`, note }]
      };
    }
    return inq;
  });
  safeSet(STORAGE_KEYS.INQUIRIES, updated);
};

// --- QUOTATION GENERATOR ---

export const getQuotations = () => safeGet(STORAGE_KEYS.QUOTATIONS, []);

export const generateQuotation = (quoteData) => {
  const quotations = getQuotations();
  const newQuote = {
    id: `QT-${Date.now()}`,
    date: new Date().toISOString(),
    status: 'Draft',
    ...quoteData
  };
  const updated = [newQuote, ...quotations];
  safeSet(STORAGE_KEYS.QUOTATIONS, updated);
  return newQuote;
};

// --- SUPPLIER DIRECTORY ---

export const getSuppliers = () => safeGet(STORAGE_KEYS.SUPPLIERS, []);

export const addSupplier = (supplier) => {
  const suppliers = getSuppliers();
  const newSupplier = {
    id: `SUP-${Date.now()}`,
    ...supplier
  };
  const updated = [newSupplier, ...suppliers];
  safeSet(STORAGE_KEYS.SUPPLIERS, updated);
  return newSupplier;
};

// --- SMART STOCK INTELLIGENCE ---

export const getStockIntelligence = () => {
  const products = safeGet(STORAGE_KEYS.PRODUCTS, []);
  
  const criticalStock = products.filter(p => p.stock <= 3);
  const reorderSuggestions = products.filter(p => p.stock <= 10).map(p => ({
    ...p,
    suggestedQuantity: 20 - p.stock,
    priority: p.stock <= 3 ? 'CRITICAL' : 'HIGH'
  }));

  const fastSelling = products.filter(p => p.tags?.includes('FAST SELLING') || p.stock < 5).slice(0, 5);
  const slowMoving = products.filter(p => p.stock > 15).slice(0, 5);

  return {
    criticalStock,
    reorderSuggestions,
    fastSelling,
    slowMoving,
    inventoryHealth: (products.filter(p => p.stock > 10).length / products.length) * 100
  };
};

export const getBusinessStats = () => {
  const products = safeGet(STORAGE_KEYS.PRODUCTS, []);
  const inquiries = getInquiries();
  const quotations = getQuotations();
  const intelligence = getStockIntelligence();
  
  const totalValue = products.reduce((acc, p) => acc + (Number(p.price) * Number(p.stock)), 0);
  const lowStock = products.filter(p => p.stock <= 5).length;
  
  const inquiryStats = {
    total: inquiries.length,
    converted: inquiries.filter(i => i.status === 'Converted').length,
    new: inquiries.filter(i => i.status === 'New Inquiry').length
  };

  return {
    totalValue,
    lowStock,
    criticalCount: intelligence.criticalStock.length,
    inquiryStats,
    productCount: products.length,
    quoteCount: quotations.length,
    health: intelligence.inventoryHealth
  };
};

// --- COMMUNICATION INTEGRATION ---

export const getWhatsAppLink = (type, data) => {
  const phone = "919876543210"; // Shop Phone
  let message = "";

  if (type === 'INQUIRY') {
    message = `Hi Mercury Industrial, I am interested in knowing more about: *${data.name}* [Model: ${data.model}]. Could you please provide the latest pricing and availability?`;
  } else if (type === 'QUOTATION') {
    message = `Greetings! Attached is the Quotation #${data.id} for your requirement. Total Amount: ₹${data.total.toLocaleString()}. Please review.`;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export const shareProductOnWA = (product) => {
  const link = getWhatsAppLink('INQUIRY', product);
  window.open(link, '_blank');
};
