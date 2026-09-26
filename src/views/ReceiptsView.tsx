import React from 'react';
import { ArrowDownLeft } from 'lucide-react';

export const ReceiptsView: React.FC = () => {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '10px',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        color: 'var(--accent-emerald)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1rem auto'
      }}>
        <ArrowDownLeft size={28} />
      </div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Receipts (Incoming Stock Operations)</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
        Assigned to <strong>Akash</strong> — Vendor receiving shipments, quantity input/scanned live counter, and stock validation posting.
      </p>
      <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
        Awaiting feature/akash-stock-operations Pull Request merge
      </div>
    </div>
  );
};
