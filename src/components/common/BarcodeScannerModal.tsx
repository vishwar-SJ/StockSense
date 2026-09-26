import React, { useState, useEffect, useRef } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Modal } from './Modal';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, Camera, Keyboard, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';

export const BarcodeScannerModal: React.FC = () => {
  const { 
    isScannerModalOpen, 
    closeScannerModal, 
    onBarcodeScanned, 
    scannerTargetInfo, 
    products 
  } = useInventory();

  const [activeTab, setActiveTab] = useState<'virtual' | 'camera'>('virtual');
  const [manualInput, setManualInput] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const expectedProduct = products.find(p => p.id === scannerTargetInfo?.expectedProductId);

  // Initialize camera scanner when camera tab active
  useEffect(() => {
    if (isScannerModalOpen && activeTab === 'camera') {
      const scanner = new Html5QrcodeScanner(
        'reader-element',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          handleExecuteScan(decodedText);
          scanner.clear();
        },
        (errorMessage) => {
          // ignore frame read errors
        }
      );

      scannerRef.current = scanner;

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(err => console.error(err));
        }
      };
    }
  }, [isScannerModalOpen, activeTab]);

  const handleExecuteScan = (codeToScan: string) => {
    if (!codeToScan.trim()) return;
    onBarcodeScanned(codeToScan.trim());
    setScanResult({
      success: true,
      message: `Scanned code: ${codeToScan}`
    });
    setManualInput('');
  };

  return (
    <Modal
      isOpen={isScannerModalOpen}
      onClose={closeScannerModal}
      title={scannerTargetInfo?.title || "Barcode & QR Scanner Terminal"}
      subtitle={expectedProduct ? `Target Item: ${expectedProduct.name} (Expected Code: ${expectedProduct.barcode})` : "Scan product barcode for receipt increment, picking verification, or count"}
      maxWidth="580px"
    >
      {/* Target item indicator if applicable */}
      {expectedProduct && (
        <div style={{
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          border: '1px solid rgba(14, 165, 233, 0.3)',
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700 }}>Expected Pick Item</span>
            <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{expectedProduct.name}</div>
            <div className="font-mono" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              SKU: {expectedProduct.sku} | Barcode: {expectedProduct.barcode}
            </div>
          </div>
          <QrCode size={28} style={{ color: 'var(--accent-cyan)' }} />
        </div>
      )}

      {/* Mode Toggle Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          className={`btn ${activeTab === 'virtual' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, borderRadius: '6px' }}
          onClick={() => setActiveTab('virtual')}
        >
          <Keyboard size={16} /> Virtual Barcode Simulator
        </button>
        <button
          className={`btn ${activeTab === 'camera' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, borderRadius: '6px' }}
          onClick={() => setActiveTab('camera')}
        >
          <Camera size={16} /> Web Camera Scanner
        </button>
      </div>

      {activeTab === 'virtual' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Preset selector from registered catalog */}
          <div className="form-group">
            <label className="form-label">Select Registered Catalog Product Barcode</label>
            <select
              className="select"
              value={selectedPreset}
              onChange={e => {
                setSelectedPreset(e.target.value);
                setManualInput(e.target.value);
              }}
            >
              <option value="">-- Choose registered barcode --</option>
              {products.map(p => (
                <option key={p.id} value={p.barcode}>
                  {p.barcode} - {p.name} ({p.sku})
                </option>
              ))}
              <option value="MISPICK-ERR-999">MISPICK-ERR-999 (Wrong Barcode Simulation Test)</option>
            </select>
          </div>

          {/* Direct Input */}
          <div className="form-group">
            <label className="form-label">Hardware Laser Scanner Input / Manual Entry</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="input font-mono"
                placeholder="Scan or type barcode string..."
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleExecuteScan(manualInput);
                }}
              />
              <button
                className="btn btn-success"
                onClick={() => handleExecuteScan(manualInput)}
                disabled={!manualInput.trim()}
              >
                <Zap size={16} /> Trigger Scan
              </button>
            </div>
          </div>

          {/* Quick preset buttons for instant test */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Instant Test Samples
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {expectedProduct && (
                <button
                  className="btn btn-sm btn-amber font-mono"
                  onClick={() => handleExecuteScan(expectedProduct.barcode)}
                >
                  Match: {expectedProduct.barcode}
                </button>
              )}
              {products.slice(0, 4).map(p => (
                <button
                  key={p.id}
                  className="btn btn-sm btn-secondary font-mono"
                  onClick={() => handleExecuteScan(p.barcode)}
                >
                  {p.barcode}
                </button>
              ))}
              <button
                className="btn btn-sm btn-danger font-mono"
                onClick={() => handleExecuteScan('WRONG-BARCODE-999')}
              >
                Test Mispick Error
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          <div id="reader-element" style={{ width: '100%', borderRadius: '6px', overflow: 'hidden' }}></div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Point your webcam or mobile camera at a product QR or barcode label.
          </p>
        </div>
      )}

      {scanResult && (
        <div style={{
          marginTop: '1rem',
          padding: '0.625rem',
          backgroundColor: 'var(--bg-card-hover)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.8125rem'
        }}>
          <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)' }} />
          <span>{scanResult.message}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', gap: '0.5rem' }}>
        <button className="btn btn-secondary" onClick={closeScannerModal}>
          Done / Close Terminal
        </button>
      </div>
    </Modal>
  );
};
