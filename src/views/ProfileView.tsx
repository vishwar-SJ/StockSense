import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { User, UserRole } from '../types';
import { 
  User as UserIcon, Shield, Mail, Building, KeyRound, 
  LogOut, CheckCircle2, Sliders, RefreshCw
} from 'lucide-react';

interface ProfileViewProps {
  onOpenAuth: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenAuth }) => {
  const { user, activeRole, switchRole, logoutUser } = useInventory();

  if (!user) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <UserIcon size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
        <h3>No Active User Session</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Sign in or create an account to access operator profile and role configurations.
        </p>
        <button className="btn btn-primary" onClick={onOpenAuth}>
          Sign In / Create Account
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Profile Header Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '12px',
            backgroundColor: 'var(--accent-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#ffffff'
          }}>
            {user.name.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.375rem', fontWeight: 800 }}>{user.name}</h3>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.125rem' }}>
              <Mail size={14} /> {user.email}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <Building size={14} /> {user.department}
            </div>
          </div>

          <button className="btn btn-danger" onClick={logoutUser}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Role Persona Switcher Card */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h4 style={{ fontSize: '1rem' }}>Active Workspace Persona & Access Control</h4>
          </div>
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Switch between operational personas to test distinct permission scopes (e.g. Dual Approval authorization for Managers vs Picking/Scanning for Staff).
        </p>

        <div className="grid-2">
          <div 
            onClick={() => switchRole('inventory_manager')}
            style={{
              padding: '1.25rem',
              borderRadius: '8px',
              border: `2px solid ${activeRole === 'inventory_manager' ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
              backgroundColor: activeRole === 'inventory_manager' ? 'rgba(14, 165, 233, 0.08)' : 'var(--bg-card-hover)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                Inventory Manager
              </span>
              {activeRole === 'inventory_manager' && (
                <span className="badge badge-ready"><CheckCircle2 size={12} /> Active Persona</span>
              )}
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Full authorization: manage catalog, configure reordering policies, approve high-value adjustments, and inspect cryptographic ledger chain.
            </p>
          </div>

          <div 
            onClick={() => switchRole('warehouse_staff')}
            style={{
              padding: '1.25rem',
              borderRadius: '8px',
              border: `2px solid ${activeRole === 'warehouse_staff' ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
              backgroundColor: activeRole === 'warehouse_staff' ? 'rgba(14, 165, 233, 0.08)' : 'var(--bg-card-hover)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                Warehouse Staff
              </span>
              {activeRole === 'warehouse_staff' && (
                <span className="badge badge-ready"><CheckCircle2 size={12} /> Active Persona</span>
              )}
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Operations floor focus: perform stock transfers, barcode scan picking, verify incoming receipts, and perform physical counts.
            </p>
          </div>
        </div>
      </div>

      {/* Security & Password Reset */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <KeyRound size={18} style={{ color: 'var(--accent-emerald)' }} />
            <h4 style={{ fontSize: '1rem' }}>Account Security & Credentials</h4>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>OTP-Based Password Reset</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Trigger One-Time Password verification flow to update account security key.
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onOpenAuth}>
            <RefreshCw size={14} /> Reset via OTP
          </button>
        </div>
      </div>

    </div>
  );
};
