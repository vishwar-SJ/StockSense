import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { UserRole } from '../../types';
import { Modal } from '../common/Modal';
import { Lock, Mail, User as UserIcon, Shield, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginUser } = useInventory();
  const [mode, setMode] = useState<'login' | 'signup' | 'otp_reset'>('login');
  
  // Form fields
  const [email, setEmail] = useState('alex.vance@stocksense.io');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('inventory_manager');
  
  // OTP flow fields
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetDone, setResetDone] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser({
      id: 'usr_' + Math.random().toString(36).substring(2, 7),
      name: email.includes('alex') ? 'Alex Vance' : (name || email.split('@')[0]),
      email,
      role,
      department: role === 'inventory_manager' ? 'Inventory Strategy & Planning' : 'Warehouse Logistics & Picking'
    });
    onClose();
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setOtpSent(true);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) return;
    setResetDone(true);
    setTimeout(() => {
      setMode('login');
      setOtpSent(false);
      setResetDone(false);
      setOtpCode('');
    }, 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'login' ? "Account Sign In" : 
        mode === 'signup' ? "Create StockSense Account" : 
        "OTP Password Reset"
      }
      subtitle={
        mode === 'login' ? "Access real-time multi-warehouse operations & cryptographic ledger" :
        mode === 'signup' ? "Register new operator or manager credentials" :
        "Verify 6-digit dynamic OTP sent to your registered email"
      }
      maxWidth="480px"
    >
      {mode === 'login' && (
        <form onSubmit={handleLogin}>
          {/* Quick Preset Selector for instant demoing */}
          <div style={{
            backgroundColor: 'var(--bg-card-muted)',
            padding: '0.75rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Quick Demo Persona Switcher
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${role === 'inventory_manager' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => {
                  setRole('inventory_manager');
                  setEmail('alex.vance@stocksense.io');
                  setName('Alex Vance');
                }}
              >
                <Shield size={14} /> Inventory Manager
              </button>
              <button
                type="button"
                className={`btn btn-sm ${role === 'warehouse_staff' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => {
                  setRole('warehouse_staff');
                  setEmail('marcus.wright@stocksense.io');
                  setName('Marcus Wright');
                }}
              >
                <UserIcon size={14} /> Warehouse Staff
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Corporate Email</label>
            <input
              type="email"
              className="input"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="input"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.8125rem', cursor: 'pointer' }}
              onClick={() => setMode('otp_reset')}
            >
              Forgot Password? (OTP Reset)
            </button>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8125rem', cursor: 'pointer' }}
              onClick={() => setMode('signup')}
            >
              Need an account? Sign Up
            </button>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Sign In & Launch Dashboard <ArrowRight size={16} />
          </button>
        </form>
      )}

      {mode === 'signup' && (
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Full Operator Name</label>
            <input
              type="text"
              className="input"
              required
              placeholder="e.g. Sarah Connor"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Work Email</label>
            <input
              type="email"
              className="input"
              required
              placeholder="sarah@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Primary Role</label>
            <select
              className="select"
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
            >
              <option value="inventory_manager">Inventory Manager (Stock approval & rules)</option>
              <option value="warehouse_staff">Warehouse Staff (Transfers, picking & counting)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="input"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.8125rem', cursor: 'pointer' }}
              onClick={() => setMode('login')}
            >
              Already have an account? Sign In
            </button>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Complete Registration <ArrowRight size={16} />
          </button>
        </form>
      )}

      {mode === 'otp_reset' && (
        <div>
          {!otpSent ? (
            <form onSubmit={handleSendOTP}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Enter your work email address to receive a secure 6-digit dynamic One-Time Password (OTP).
              </p>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="input"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Send Dynamic OTP Code
              </button>
            </form>
          ) : !resetDone ? (
            <form onSubmit={handleVerifyOTP}>
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '0.75rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.8125rem',
                color: 'var(--accent-emerald)'
              }}>
                OTP code sent to {email}. (Simulation Code: <strong>884920</strong>)
              </div>

              <div className="form-group">
                <label className="form-label">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  className="input font-mono"
                  required
                  maxLength={6}
                  placeholder="884920"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="input"
                  required
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-success" style={{ width: '100%' }}>
                Verify OTP & Reset Password
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <CheckCircle2 size={48} style={{ color: 'var(--accent-emerald)', marginBottom: '0.5rem' }} />
              <h4>Password Reset Successfully!</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Redirecting to sign-in...</p>
            </div>
          )}

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8125rem', cursor: 'pointer' }}
              onClick={() => setMode('login')}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
