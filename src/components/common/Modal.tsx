import React, { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '640px'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div 
        className="card animate-fade-in"
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-lg)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.125rem', color: 'var(--text-primary)' }}>{title}</h3>
            {subtitle && <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>{subtitle}</p>}
          </div>
          <button 
            className="btn btn-outline btn-sm" 
            onClick={onClose} 
            style={{ padding: '0.35rem', borderRadius: '4px' }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ paddingTop: '0.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
