import React, { useState } from 'react';
import { X, Camera, Scan, ShieldCheck, RefreshCw } from 'lucide-react';

const QRScanner = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      const mockResult = "MERCURY-1715580000000"; // Example ID
      setResult(mockResult);
      if (onScan) onScan(mockResult);
    }, 2000);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-card fade-in" style={{ 
        maxWidth: '450px', 
        width: '100%', 
        padding: '2rem', 
        position: 'relative',
        textAlign: 'center',
        border: '1px solid var(--accent-blue)',
        boxShadow: '0 0 30px rgba(0, 242, 255, 0.1)'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
          <X size={24} />
        </button>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '1rem', 
            background: 'rgba(0, 242, 255, 0.1)', 
            borderRadius: '50%', 
            marginBottom: '1rem',
            color: 'var(--accent-blue)' 
          }}>
            <Scan size={32} />
          </div>
          <h2 className="font-poppins" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Asset Scanner</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Scan product QR codes for instant lookup</p>
        </div>

        <div style={{ 
          width: '100%', 
          aspectRatio: '1', 
          background: '#000', 
          borderRadius: '16px', 
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '2rem',
          border: '2px solid var(--border-light)'
        }}>
          {/* Futuristic Viewfinder Overlay */}
          <div style={{ 
            position: 'absolute', 
            top: '20%', 
            left: '20%', 
            right: '20%', 
            bottom: '20%', 
            border: '2px solid var(--accent-blue)', 
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(0, 242, 255, 0.3)'
          }}>
            <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '20px', height: '20px', borderTop: '4px solid var(--accent-blue)', borderLeft: '4px solid var(--accent-blue)' }} />
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '20px', height: '20px', borderTop: '4px solid var(--accent-blue)', borderRight: '4px solid var(--accent-blue)' }} />
            <div style={{ position: 'absolute', bottom: '-10px', left: '-10px', width: '20px', height: '20px', borderBottom: '4px solid var(--accent-blue)', borderLeft: '4px solid var(--accent-blue)' }} />
            <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '20px', height: '20px', borderBottom: '4px solid var(--accent-blue)', borderRight: '4px solid var(--accent-blue)' }} />
          </div>

          {scanning && (
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: '4px', 
              background: 'var(--accent-blue)', 
              boxShadow: '0 0 15px var(--accent-blue)',
              animation: 'scanLine 2s infinite ease-in-out' 
            }} />
          )}

          {result ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 255, 136, 0.05)' }}>
              <ShieldCheck size={64} color="var(--accent-green)" />
              <div style={{ marginTop: '1rem', color: 'var(--accent-green)', fontWeight: '700' }}>ASSET IDENTIFIED</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{result}</div>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
               <Camera size={48} color="white" />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {!result ? (
            <button 
              className="btn btn-primary" 
              style={{ flex: 1, height: '52px' }} 
              onClick={simulateScan}
              disabled={scanning}
            >
              {scanning ? <RefreshCw size={18} className="spin" /> : <><Camera size={18} /> Initialize Camera</>}
            </button>
          ) : (
            <button 
              className="btn btn-primary" 
              style={{ flex: 1, height: '52px' }} 
              onClick={() => { setResult(null); simulateScan(); }}
            >
              <Scan size={18} /> Rescan Asset
            </button>
          )}
        </div>

        <style>{`
          @keyframes scanLine {
            0% { top: 10%; }
            50% { top: 90%; }
            100% { top: 10%; }
          }
          .spin { animation: rotate 2s linear infinite; }
          @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
};

export default QRScanner;
