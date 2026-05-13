import React from 'react';
import { X, Phone, MessageCircle, Mail, Copy, Share2, MapPin, CheckCircle2, MessageSquareQuote, ChevronRight } from 'lucide-react';
import { safeGet, STORAGE_KEYS } from '../utils/storage';

const ContactModal = ({ product, onClose }) => {
  const settings = safeGet(STORAGE_KEYS.SETTINGS, {
    phone: '+91 98765 43210',
    whatsapp: '919876543210',
    email: 'sales@mercuryshop.com',
    address: 'Industrial Sector 5, Engineering Hub, India'
  });

  const [copied, setCopied] = React.useState(false);

  if (!product) return null;

  const waMessage = encodeURIComponent(`Hello, I'm interested in the ${product.name} (Model: ${product.model}). Please share more details and availability.`);
  const emailSubject = encodeURIComponent(`Inquiry: ${product.name} [${product.model}]`);
  const emailBody = encodeURIComponent(`Hello Mercury Team,\n\nI am interested in the following asset:\n\nAsset: ${product.name}\nModel: ${product.model}\nBrand: ${product.brand}\n\nPlease provide pricing and availability details.\n\nThank you.`);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${settings.phone} | ${settings.email}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this ${product.name} at Mercury Inventory`,
        url: window.location.href
      });
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 6000, padding: window.innerWidth < 480 ? '0' : '1rem' }} onClick={onClose}>
      <div className="modal-content glass-card fade-in" style={{ 
        maxWidth: '500px', 
        width: '100%',
        height: window.innerWidth < 480 ? '100%' : 'auto',
        borderRadius: window.innerWidth < 480 ? '0' : 'var(--radius-lg)',
        borderTop: '6px solid var(--accent-green)',
        padding: window.innerWidth < 480 ? '1.5rem' : '2rem'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 className="font-poppins" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <MessageCircle size={22} color="var(--accent-green)" /> Acquisition
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Direct connection with Mercury Logistics</p>
          </div>
          <button className="btn-outline" onClick={onClose} style={{ borderRadius: '50%', padding: '0', width: '36px', height: '36px', border: 'none', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
        </div>

        <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(0, 242, 255, 0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)', flexShrink: 0 }}>
               <CheckCircle2 size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Selected Asset</div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>MODEL: {product.model}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <a href={`https://wa.me/${settings.whatsapp}?text=${waMessage}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ background: '#25D366', color: 'white', border: 'none', height: '50px', boxShadow: '0 0 15px rgba(37, 211, 102, 0.15)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <MessageCircle size={18} /> WhatsApp Inquiry
          </a>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <a href={`tel:${settings.phone}`} className="btn btn-outline" style={{ height: '48px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <Phone size={16} color="var(--accent-blue)" /> Call Office
            </a>
            <a href={`mailto:${settings.email}?subject=${emailSubject}&body=${emailBody}`} className="btn btn-outline" style={{ height: '48px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <Mail size={16} color="var(--accent-blue)" /> Email
            </a>
          </div>

          <button className="btn btn-outline" style={{ height: '48px', justifyContent: 'space-between', padding: '0 1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}><MessageSquareQuote size={16} color="var(--accent-orange)" /> Custom Quote</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <MapPin size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{settings.address}</div>
           </div>
           
           <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-outline" style={{ flex: 1, fontSize: '0.7rem', height: '40px', minHeight: 'auto' }} onClick={handleCopy}>
                {copied ? <CheckCircle2 size={14} color="var(--accent-green)" /> : <Copy size={14} />}
                {copied ? 'Details Copied' : 'Copy Contact'}
              </button>
              <button className="btn btn-outline" style={{ flex: 1, fontSize: '0.7rem', height: '40px', minHeight: 'auto' }} onClick={handleShare}>
                <Share2 size={14} /> Share Asset
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
