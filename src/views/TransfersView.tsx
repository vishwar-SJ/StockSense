import React from 'react';
import { ArrowRightLeft } from 'lucide-react';

export const TransfersView: React.FC = () => {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '10px',
        backgroundColor: 'rgba(14, 165, 233, 0.15)',
        color: 'var(--accent-cyan)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1rem auto'
      }}>
        <ArrowRightLeft size={28} />
      </div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Internal Warehouse Transfers</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
        Assigned to <strong>Akash</strong> — Internal warehouse stock relocations (Main Store ➔ Production Floor, Rack A ➔ Rack B).
      </p>
      <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
        Awaiting feature/akash-stock-operations Pull Request merge
      </div>
    </div>
  );
};
