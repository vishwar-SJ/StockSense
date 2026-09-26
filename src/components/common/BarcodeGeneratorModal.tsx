import React, { useEffect, useRef } from 'react';
import { Product } from '../../types';
import { Modal } from './Modal';
import QRCode from 'qrcode';
import { Printer, QrCode, Download } from 'lucide-react';

interface BarcodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const BarcodeGeneratorModal: React.FC<BarcodeGeneratorModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen && product && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        JSON.stringify({
          sku: product.sku,
          barcode: product.barcode,
          name: product.name,
          uom: product.uom
        }),
        { width: 180, margin: 1, color: { dark: '#000000', light: '#ffffff' } },
        (error) => {
          if (error) console.error(error);
        }
      );
    }
  }, [isOpen, product]);

  if (!product) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Barcode & QR Warehouse Label"
      subtitle={`Printable rack & package scan label for SKU: ${product.sku}`}
      maxWidth="480px"
    >
      <div 
        id="printable-label"
        style={{
          border: '2px dashed var(--border-light)',
          padding: '1.5rem',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          color: '#000000',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <div style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '0.05em' }}>
          STOCKSENSE WAREHOUSE LABEL
        </div>
        
        {/* QR Code Canvas */}
        <canvas ref={canvasRef} style={{ border: '1px solid #e2e8f0', borderRadius: '4px' }}></canvas>
        
        {/* Simulated 1D Barcode Bars */}
        <div style={{
          width: '85%',
          height: '40px',
          background: 'repeating-linear-gradient(90deg, #000 0px, #000 3px, #fff 3px, #fff 5px, #000 5px, #000 8px, #fff 8px, #fff 11px)',
          margin: '0.25rem 0'
        }}></div>

        <div className="font-mono" style={{ fontWeight: 700, fontSize: '1.125rem', letterSpacing: '0.1em' }}>
          {product.barcode}
        </div>

        <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.5rem', width: '100%' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{product.name}</div>
          <div style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '0.125rem' }}>
            SKU: {product.sku} | UOM: {product.uom.toUpperCase()} | Supplier: {product.supplier}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
        <button className="btn btn-primary" onClick={handlePrint}>
          <Printer size={16} /> Print Physical Label
        </button>
      </div>
    </Modal>
  );
};
