import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, Box, AlertTriangle, TrendingUp, Search } from 'lucide-react';
import { safeGet, STORAGE_KEYS } from '../utils/storage';
import { getStockIntelligence } from '../utils/business';

const MercuryAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'System Online. I am Mercury AI. How can I assist with your industrial operations today?' }
  ]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!query.trim()) return;
    
    const userMessage = { role: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');

    // Simulate AI Processing
    setTimeout(() => {
      const response = processQuery(query);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    }, 1000);
  };

  const processQuery = (q) => {
    const products = safeGet(STORAGE_KEYS.PRODUCTS, []);
    const intelligence = getStockIntelligence();
    const lowerQ = q.toLowerCase();

    if (lowerQ.includes('low stock') || lowerQ.includes('critical')) {
      const count = intelligence.criticalStock.length;
      return `I've identified ${count} critical stock alerts. Top priority: ${intelligence.criticalStock.map(p => p.name).slice(0, 2).join(', ')}. Shall I prepare a reorder draft?`;
    }

    if (lowerQ.includes('inventory status') || lowerQ.includes('summary')) {
      return `Current Inventory Status: ${products.length} unique assets tracked. Total valuation across departments is significantly optimized. Operational health is at ${intelligence.inventoryHealth.toFixed(1)}%.`;
    }

    if (lowerQ.includes('suggest') || lowerQ.includes('recommend')) {
      return `Based on current movement patterns, I suggest increasing stock for: ${intelligence.fastSelling.map(p => p.name).join(', ')}. These are high-velocity items.`;
    }

    const found = products.find(p => lowerQ.includes(p.name.toLowerCase()) || lowerQ.includes(p.model.toLowerCase()));
    if (found) {
      return `Asset Found: ${found.name} [${found.model}]. Current stock: ${found.stock} units. Status: ${found.stock > 5 ? 'Stable' : 'Requires Attention'}.`;
    }

    return "I've analyzed the request. For specific asset details, please provide the Model Number or Name. I can also provide low-stock summaries or inventory health audits.";
  };

  return (
    <>
      {/* Floating Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'var(--accent-blue)', color: 'black',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px var(--accent-blue-glow)',
          zIndex: 9999, border: 'none', cursor: 'pointer', transition: '0.3s'
        }}
      >
        {isOpen ? <X size={28} /> : <Bot size={28} />}
      </button>

      {/* Assistant Panel */}
      {isOpen && (
        <div className="glass-card fade-in" style={{
          position: 'fixed', bottom: '6.5rem', right: '2rem',
          width: window.innerWidth < 480 ? 'calc(100% - 2rem)' : '380px',
          height: '500px', zIndex: 9998, padding: '1.5rem',
          display: 'flex', flexDirection: 'column',
          border: '1px solid var(--accent-blue)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
             <div style={{ padding: '0.5rem', background: 'rgba(0, 242, 255, 0.1)', borderRadius: '8px', color: 'var(--accent-blue)' }}>
               <Sparkles size={20} />
             </div>
             <div>
               <div style={{ fontWeight: '800', fontSize: '1rem' }}>Mercury AI</div>
               <div style={{ fontSize: '0.65rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                 <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)' }} /> 
                 NEURAL LINK ACTIVE
               </div>
             </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem', marginBottom: '1.5rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ 
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%', padding: '0.75rem 1rem', borderRadius: '12px',
                background: m.role === 'user' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.03)',
                color: m.role === 'user' ? 'black' : 'var(--text-primary)',
                fontSize: '0.85rem', fontWeight: m.role === 'user' ? '600' : '400',
                lineHeight: '1.5', border: m.role === 'ai' ? '1px solid var(--border-light)' : 'none'
              }}>
                {m.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
            <input 
              type="text" 
              placeholder="Ask Mercury AI..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '0.5rem', fontSize: '0.85rem', outline: 'none' }}
            />
            <button 
              onClick={handleSend}
              style={{ background: 'var(--accent-blue)', color: 'black', border: 'none', borderRadius: '6px', padding: '0.5rem', cursor: 'pointer' }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MercuryAI;
