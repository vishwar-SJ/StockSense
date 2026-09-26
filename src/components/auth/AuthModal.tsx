import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { UserRole } from '../../types';
import { Shield, User as UserIcon, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginUser } = useInventory();
  const [mode, setMode] = useState<'login' | 'signup' | 'otp_reset'>('login');
  
  const [email, setEmail] = useState('alex.vance@stocksense.io');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('inventory_manager');
  
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetDone, setResetDone] = useState(false);

  if (!isOpen) return null;

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
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }} onClick={onClose}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.125rem' }}>
              {mode === 'login' ? "Account Sign In" : mode === 'signup' ? "Create StockSense Account" : "OTP Password Reset"}
            </h3>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose} style={{ padding: '0.35rem' }}>
            <X size={18} />
          </button>
        </div>

        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div style={{ backgroundColor: 'var(--bg-card-muted)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
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
              <input type="email" className="input" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="input" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <button type="button" style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.8125rem', cursor: 'pointer' }} onClick={() => setMode('otp_reset')}>
                Forgot Password? (OTP Reset)
              </button>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Sign In & Launch Dashboard <ArrowRight size={16} />
            </button>
          </form>
        )}

        {mode === 'otp_reset' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOTP}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="input" required value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Send Dynamic OTP Code
                </button>
              </form>
            ) : !resetDone ? (
              <form onSubmit={handleVerifyOTP}>
                <div className="form-group">
                  <label className="form-label">Enter 6-Digit OTP (Demo: 884920)</label>
                  <input type="text" className="input font-mono" required maxLength={6} value={otpCode} onChange={e => setOtpCode(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-success" style={{ width: '100%' }}>
                  Verify OTP & Reset Password
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <CheckCircle2 size={48} style={{ color: 'var(--accent-emerald)', marginBottom: '0.5rem' }} />
                <h4>Password Reset Successfully!</h4>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
