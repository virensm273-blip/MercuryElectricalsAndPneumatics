import React from 'react';
import { Phone, Mail, MessageCircle, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Contact Us</h2>
      
      <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Get in Touch</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <li>
            <a href="tel:1234567890" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)', textDecoration: 'none' }}>
              <div style={{ padding: '0.5rem', background: 'var(--primary)', color: 'white', borderRadius: '50%' }}><Phone size={20} /></div>
              <span style={{ fontSize: '1.125rem', fontWeight: '500' }}>Call: 123-456-7890</span>
            </a>
          </li>
          <li>
            <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)', textDecoration: 'none' }}>
              <div style={{ padding: '0.5rem', background: '#25D366', color: 'white', borderRadius: '50%' }}><MessageCircle size={20} /></div>
              <span style={{ fontSize: '1.125rem', fontWeight: '500' }}>WhatsApp Us</span>
            </a>
          </li>
          <li>
            <a href="mailto:shop@mercury.com" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)', textDecoration: 'none' }}>
              <div style={{ padding: '0.5rem', background: 'var(--danger)', color: 'white', borderRadius: '50%' }}><Mail size={20} /></div>
              <span style={{ fontSize: '1.125rem', fontWeight: '500' }}>Email: shop@mercury.com</span>
            </a>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--text-main)', marginTop: '0.5rem' }}>
            <div style={{ padding: '0.5rem', background: 'var(--text-muted)', color: 'white', borderRadius: '50%' }}><MapPin size={20} /></div>
            <div>
              <span style={{ fontSize: '1rem', fontWeight: '500', display: 'block' }}>Visit our store:</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>123 Industrial Park Rd,<br/>Tech City, 100101</span>
            </div>
          </li>
        </ul>
      </div>

      <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Send a Message</h3>
        <form action="mailto:shop@mercury.com" method="GET">
          <div className="input-group">
            <label className="input-label">Subject</label>
            <input type="text" name="subject" className="input-field" placeholder="Inquiry about product..." required />
          </div>
          <div className="input-group">
            <label className="input-label">Message</label>
            <textarea name="body" className="input-field" placeholder="How can we help you?" rows="4" required style={{ resize: 'vertical' }}></textarea>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send via Email</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
