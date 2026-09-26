import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

export const AdjustmentsView: React.FC = () => {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '10px',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        color: 'var(--accent-amber)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1rem auto'
      }}>
        <SlidersHorizontal size={28} />
      </div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Inventory Stock Adjustments & Dual Approval</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
        Assigned to <strong>Sathya</strong> — Physical count reconciliation and Dual Manager Approval authorization workflow.
      </p>
      <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
        Awaiting feature/sathya-crypto-ledger-velocity Pull Request merge
      </div>
    </div>
  );
};
