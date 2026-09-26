import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { QrCode, Search, ShieldCheck, ShieldAlert, Bell, Moon, Sun, User as UserIcon, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onOpenAuth: () => void;
  activeView: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth, activeView }) => {
  const { 
    user, 
    activeRole, 
    switchRole, 
    ledgerIntegrity, 
    verifyLedger, 
    openScannerModal,
    notifications,
    removeNotification
  } = useInventory();

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showNotifs, setShowNotifs] = useState(false);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const getPageTitle = (view: string) => {
    switch (view) {
      case 'dashboard': return 'Inventory Operations Control Center';
      case 'products': return 'Product Catalog & Stock Availability';
      case 'receipts': return 'Receipts (Incoming Stock Operations)';
      case 'deliveries': return 'Delivery Orders (Outgoing Picking & Packing)';
      case 'transfers': return 'Internal Warehouse Transfers';
      case 'adjustments': return 'Inventory Stock Audit & Adjustments';
      case 'ledger': return 'Tamper-Evident Stock Ledger & Blockchain Audit';
      case 'settings': return 'Warehouse & System Configuration';
      case 'profile': return 'User Profile & Security Settings';
      default: return 'StockSense Operations';
    }
  };

  return (
    <header style={{
      height: '64px',
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(8px)'
    }}>
      {/* Title & Path */}
      <div>
        <h2 style={{ fontSize: '1.125rem', color: 'var(--text-primary)', fontWeight: 700 }}>
          {getPageTitle(activeView)}
        </h2>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span>StockSense</span>
          <span>/</span>
          <span style={{ textTransform: 'capitalize', color: 'var(--accent-cyan)' }}>{activeView}</span>
        </div>
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        
        {/* Quick Barcode Scanner Trigger Button */}
        <button
          className="btn btn-secondary btn-sm font-mono"
          onClick={() => openScannerModal()}
          title="Open Barcode & QR Terminal"
          style={{ borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)', borderRadius: '6px' }}
        >
          <QrCode size={16} /> Scan Terminal
        </button>

        {/* Ledger Integrity Indicator */}
        <button
          className={`btn btn-sm ${ledgerIntegrity.isValid ? 'btn-outline' : 'btn-danger'}`}
          onClick={verifyLedger}
          title="Verify Cryptographic SHA-256 Ledger Integrity"
          style={{ borderRadius: '6px', fontSize: '0.75rem' }}
        >
          {ledgerIntegrity.isValid ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-emerald)' }}>
              <ShieldCheck size={14} /> SHA-256 Ledger OK
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldAlert size={14} /> Ledger Tamper Alert!
            </span>
          )}
        </button>

        {/* Persona Switcher Quick Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          padding: '0.2rem'
        }}>
          <button
            className={`btn btn-sm ${activeRole === 'inventory_manager' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', border: 'none' }}
            onClick={() => switchRole('inventory_manager')}
          >
            Manager
          </button>
          <button
            className={`btn btn-sm ${activeRole === 'warehouse_staff' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', border: 'none' }}
            onClick={() => switchRole('warehouse_staff')}
          >
            Staff
          </button>
        </div>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-outline btn-sm"
            style={{ padding: '0.4rem', position: 'relative', borderRadius: '6px' }}
            onClick={() => setShowNotifs(!showNotifs)}
          >
            <Bell size={16} />
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--accent-cyan)',
                color: '#000',
                fontSize: '0.65rem',
                fontWeight: 800,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="card animate-fade-in" style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '320px',
              zIndex: 200,
              padding: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>System Alerts</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{notifications.length} unread</span>
              </div>
              {notifications.length === 0 ? (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                  No active system alerts.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'var(--bg-card-hover)',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        borderLeft: `3px solid ${n.type === 'error' ? 'var(--accent-rose)' : n.type === 'warning' ? 'var(--accent-amber)' : 'var(--accent-emerald)'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                        <span>{n.title}</span>
                        <button onClick={() => removeNotification(n.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '0.125rem' }}>{n.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          className="btn btn-outline btn-sm"
          style={{ padding: '0.4rem', borderRadius: '6px' }}
          onClick={toggleTheme}
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* User Account / Login Button */}
        {user ? (
          <div 
            onClick={onOpenAuth}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-card-hover)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              backgroundColor: 'var(--accent-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: '#fff',
              fontSize: '0.8125rem'
            }}>
              {user.name.charAt(0)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                {activeRole.replace('_', ' ')}
              </span>
            </div>
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onOpenAuth}>
            <UserIcon size={14} /> Sign In
          </button>
        )}

      </div>
    </header>
  );
};
