import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, ScanLine, Package, CalendarDays, Tag, DollarSign, FileText, Edit3 } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { db } from '../lib/db';
import type { Item } from '../lib/db';
import MilkCarton from '../components/MilkCarton';

type ScanState = 'idle' | 'scanning' | 'loading' | 'found' | 'not_found';

export default function BarcodeScanner() {
  const navigate = useNavigate();
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [foundItem, setFoundItem] = useState<Item | null>(null);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

  const getDaysRemaining = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const stopScanner = () => {
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      html5QrcodeRef.current.stop().catch(console.error);
    }
  };

  const handleBarcodeDetected = async (barcode: string) => {
    stopScanner();
    setScannedBarcode(barcode);
    setScanState('loading');

    try {
      const item = await db.getItemByBarcode(barcode);
      if (item) {
        setFoundItem(item);
        setScanState('found');
      } else {
        setFoundItem(null);
        setScanState('not_found');
      }
    } catch (e) {
      console.error('Barcode lookup error:', e);
      setScanState('not_found');
    }
  };

  useEffect(() => {
    if (scanState !== 'scanning') return;

    const timer = setTimeout(() => {
      try {
        const scanner = new Html5Qrcode('barcode-reader');
        html5QrcodeRef.current = scanner;
        scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 160 } },
          (decodedText: string) => {
            handleBarcodeDetected(decodedText);
          },
          () => { /* ignore scan errors */ }
        ).catch((err) => {
          console.error('Camera start failed:', err);
          setScanState('idle');
        });
      } catch (e) {
        console.error('Scanner init error:', e);
        setScanState('idle');
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanState]);

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  const reset = () => {
    setScannedBarcode('');
    setFoundItem(null);
    setScanState('idle');
  };

  const daysRemaining = foundItem ? getDaysRemaining(foundItem.expiration_date) : 0;
  const isExpired = daysRemaining < 0;
  const isExpiringSoon = !isExpired && daysRemaining <= 30;

  const statusColor = isExpired
    ? '#E63946'
    : isExpiringSoon
    ? '#F59E0B'
    : '#10B981';

  const statusLabel = isExpired
    ? `Expired ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''} ago`
    : daysRemaining === 0
    ? 'Expires today!'
    : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`;

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <ScanLine size={28} color="var(--color-primary)" />
          Scan Product
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Scan a barcode to instantly look up a product
        </p>
      </header>

      {/* ── IDLE / READY STATE ── */}
      {scanState === 'idle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="panel" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%',
              background: 'rgba(230, 57, 70, 0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <ScanLine size={44} color="var(--color-primary)" />
            </div>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem' }}>Ready to Scan</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
              Point your camera at a product barcode to instantly look up its details from your inventory.
            </p>
            <button
              id="start-scan-btn"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', borderRadius: '16px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              onClick={() => setScanState('scanning')}
            >
              <Camera size={20} />
              Start Scanning
            </button>
          </div>
        </div>
      )}

      {/* ── SCANNING STATE ── */}
      {scanState === 'scanning' && (
        <div className="panel" style={{ padding: '1rem' }}>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            {/* Scanner viewfinder overlay */}
            <div id="barcode-reader" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }} />
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{
                width: '260px', height: '100px',
                border: '2px solid var(--color-primary)',
                borderRadius: '10px',
                boxShadow: '0 0 0 2000px rgba(0,0,0,0.35)',
                position: 'relative'
              }}>
                {/* Corner accents */}
                {[['top','left'], ['top','right'], ['bottom','left'], ['bottom','right']].map(([v, h]) => (
                  <div key={`${v}-${h}`} style={{
                    position: 'absolute',
                    [v]: '-3px', [h]: '-3px',
                    width: '18px', height: '18px',
                    borderTop: v === 'top' ? '3px solid var(--color-primary)' : 'none',
                    borderBottom: v === 'bottom' ? '3px solid var(--color-primary)' : 'none',
                    borderLeft: h === 'left' ? '3px solid var(--color-primary)' : 'none',
                    borderRight: h === 'right' ? '3px solid var(--color-primary)' : 'none',
                  }} />
                ))}
                {/* Scan line animation */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: '2px', background: 'var(--color-primary)',
                  animation: 'scanLine 1.5s ease-in-out infinite',
                  boxShadow: '0 0 6px var(--color-primary)'
                }} />
              </div>
            </div>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
            Align the barcode within the frame
          </p>
          <button
            className="btn btn-outline"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            onClick={() => { stopScanner(); setScanState('idle'); }}
          >
            <X size={16} /> Cancel
          </button>
        </div>
      )}

      {/* ── LOADING STATE ── */}
      {scanState === 'loading' && (
        <div className="panel" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            border: '3px solid rgba(230, 57, 70, 0.15)',
            borderTop: '3px solid var(--color-primary)',
            animation: 'spin 0.9s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Looking up product...</p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem', fontFamily: 'monospace' }}>{scannedBarcode}</p>
        </div>
      )}

      {/* ── FOUND STATE ── */}
      {scanState === 'found' && foundItem && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Success banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '16px',
            padding: '0.75rem 1rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: '#10B981', fontWeight: 600, fontSize: '0.9rem'
          }}>
            ✅ Product found!
            <span style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: '0.75rem', opacity: 0.7 }}>{scannedBarcode}</span>
          </div>

          {/* Product card */}
          <div className="panel" style={{ padding: '1.5rem' }}>
            {/* Top section */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{
                width: '80px', height: '80px', flexShrink: 0,
                borderRadius: '20px', background: 'var(--color-bg-light)',
                border: '1.5px dashed rgba(230, 57, 70, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <MilkCarton daysRemaining={daysRemaining} size={58} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.2rem', lineHeight: 1.2 }}>{foundItem.name}</h2>
                <div style={{
                  display: 'inline-block',
                  background: statusColor + '20',
                  color: statusColor,
                  border: `1px solid ${statusColor}40`,
                  borderRadius: '20px',
                  padding: '0.2rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}>
                  {statusLabel}
                </div>
              </div>
            </div>

            {/* Details list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                {
                  icon: <Tag size={16} />,
                  label: 'Category',
                  value: foundItem.category
                },
                {
                  icon: <CalendarDays size={16} />,
                  label: 'Expiry Date',
                  value: new Date(foundItem.expiration_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                },
                ...(foundItem.warning_date ? [{
                  icon: <CalendarDays size={16} />,
                  label: 'Warning Date',
                  value: new Date(foundItem.warning_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                }] : []),
                {
                  icon: <Package size={16} />,
                  label: 'Quantity',
                  value: `${foundItem.quantity} unit${foundItem.quantity !== 1 ? 's' : ''}`
                },
                ...(foundItem.price !== undefined && foundItem.price !== null ? [{
                  icon: <DollarSign size={16} />,
                  label: 'Price',
                  value: `₹${foundItem.price.toFixed(2)}`
                }] : []),
                ...(foundItem.notes ? [{
                  icon: <FileText size={16} />,
                  label: 'Notes',
                  value: foundItem.notes
                }] : [])
              ].map(({ icon, label, value }) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  paddingBottom: '0.85rem',
                  borderBottom: '1px solid rgba(230, 57, 70, 0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                    {icon} {label}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', textAlign: 'right', maxWidth: '55%' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={reset}
            >
              <ScanLine size={16} /> Scan Again
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              onClick={() => navigate(`/add-item?edit=${foundItem.id}`)}
            >
              <Edit3 size={16} /> Edit Item
            </button>
          </div>
        </div>
      )}

      {/* ── NOT FOUND STATE ── */}
      {scanState === 'not_found' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Error banner */}
          <div style={{
            background: 'rgba(230, 57, 70, 0.08)',
            border: '1px solid rgba(230, 57, 70, 0.25)',
            borderRadius: '16px',
            padding: '0.75rem 1rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem'
          }}>
            ❌ Product not found
            <span style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: '0.75rem', opacity: 0.7 }}>{scannedBarcode}</span>
          </div>

          <div className="panel" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <div style={{
              width: '80px', height: '80px',
              background: 'rgba(230, 57, 70, 0.08)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <Package size={36} color="var(--color-primary)" strokeWidth={1.5} />
            </div>
            <h2 style={{ margin: '0 0 0.5rem', color: 'var(--color-text-primary)' }}>No product found</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              This barcode isn't linked to any item in your inventory yet.
            </p>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '1.75rem' }}>
              {scannedBarcode}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={() => navigate(`/add-item?barcode=${encodeURIComponent(scannedBarcode)}`)}
              >
                <Package size={18} /> Add This Product
              </button>
              <button
                className="btn btn-outline"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={reset}
              >
                <ScanLine size={16} /> Scan Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scan line animation keyframes */}
      <style>{`
        @keyframes scanLine {
          0% { top: 0; opacity: 1; }
          50% { top: calc(100% - 2px); opacity: 1; }
          100% { top: 0; opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
