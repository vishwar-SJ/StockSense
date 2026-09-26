import React from 'react';
import { useInventory } from '../../context/InventoryContext';
import { 
  LayoutDashboard, Package, ArrowDownLeft, ArrowUpRight, 
  ArrowRightLeft, SlidersHorizontal, History, Settings, 
  User as UserIcon, LogOut, ShieldCheck, AlertTriangle, Layers,
  ChevronRight, Box
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenAuth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onOpenAuth }) => {
  const { 
    user, 
    logoutUser, 
    operations, 
    stockPolicies, 
    activeRole,
    ledgerIntegrity 
  } = useInventory();

  // Compute live pending counts
  const pendingReceiptsCount = operations.filter(o => o.type === 'receipt' && (o.status === 'ready' || o.status === 'waiting')).length;
  const pendingDeliveriesCount = operations.filter(o => o.type === 'delivery' && (o.status === 'ready' || o.status === 'waiting')).length;
  const atRiskCount = stockPolicies.filter(sp => sp.is_at_risk).length;
  const pendingAdjustmentsCount = operations.filter(o => o.type === 'adjustment' && o.requires_dual_approval && o.approval_status === 'pending').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'products',
      label: 'Products & Catalog',
      icon: Package,
      badge: atRiskCount > 0 ? { text: `${atRiskCount} risk`, type: 'risk' } : null
    },
    {
      header: 'Operations'
    },
    {
      id: 'receipts',
      label: 'Receipts (Incoming)',
      icon: ArrowDownLeft,
      badge: pendingReceiptsCount > 0 ? { text: String(pendingReceiptsCount), type: 'info' } : null
    },
    {
      id: 'deliveries',
      label: 'Delivery Orders',
      icon: ArrowUpRight,
      badge: pendingDeliveriesCount > 0 ? { text: String(pendingDeliveriesCount), type: 'info' } : null
    },
    {
      id: 'transfers',
      label: 'Internal Transfers',
      icon: ArrowRightLeft,
      badge: null
    },
    {
      id: 'adjustments',
      label: 'Stock Adjustments',
      icon: SlidersHorizontal,
      badge: pendingAdjustmentsCount > 0 ? { text: `${pendingAdjustmentsCount} review`, type: 'amber' } : null
    },
    {
      id: 'ledger',
      label: 'Move History & Ledger',
      icon: History,
      badge: !ledgerIntegrity.isValid ? { text: 'Alert', type: 'risk' } : null
    },
    {
      header: 'System & Profile'
    },
    {
      id: 'settings',
      label: 'Settings & Warehouses',
      icon: Settings,
      badge: null
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: UserIcon,
      badge: null
    }
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      userSelect: 'none',
      flexShrink: 0
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '6px',
          backgroundColor: 'var(--accent-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff'
        }}>
          <Box size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
            StockSense
          </h1>
          <div className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            v2.4 Enterprise IMS
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem'
      }}>
        {navItems.map((item, index) => {
          if ('header' in item) {
            return (
              <div 
                key={`hdr_${index}`}
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '1rem 0.75rem 0.375rem 0.75rem'
                }}
              >
                {item.header}
              </div>
            );
          }

          const IconComponent = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.625rem 0.875rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: isActive ? 'var(--bg-card-hover)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <IconComponent 
                  size={18} 
                  style={{ 
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)' 
                  }} 
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span 
                  className={`badge ${
                    item.badge.type === 'risk' ? 'badge-risk' : 
                    item.badge.type === 'amber' ? 'badge-waiting' : 
                    'badge-ready'
                  }`}
                  style={{ fontSize: '0.6875rem', padding: '0.15rem 0.4rem' }}
                >
                  {item.badge.text}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Profile & Footer Menu */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-card-muted)'
      }}>
        {user ? (
          <div>
            <div 
              onClick={() => setActiveView('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                marginBottom: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--accent-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                    {activeRole === 'inventory_manager' ? 'Inventory Manager' : 'Warehouse Staff'}
                  </div>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-outline btn-sm"
                style={{ flex: 1, borderRadius: '6px', fontSize: '0.75rem' }}
                onClick={() => setActiveView('profile')}
              >
                <UserIcon size={14} /> Profile
              </button>
              <button
                className="btn btn-danger btn-sm"
                style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}
                onClick={logoutUser}
                title="Logout of session"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        ) : (
          <button 
            className="btn btn-primary btn-sm" 
            style={{ width: '100%', borderRadius: '6px' }}
            onClick={onOpenAuth}
          >
            <UserIcon size={14} /> Sign In / Switch Role
          </button>
        )}
      </div>
    </aside>
  );
};
