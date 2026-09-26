import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, subtitle, children }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '500px', width: '90%', padding: '1.5rem' }}>
        <div className="card-header">
          <h3>{title}</h3>
          <button className="btn btn-sm btn-outline" onClick={onClose}>×</button>
        </div>
        {subtitle && <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
};
