import React from 'react';
import { OperationStatus, DualApprovalStatus } from '../../types';
import { CheckCircle2, AlertTriangle, Clock, XCircle, ShieldCheck, ShieldAlert } from 'lucide-react';

export const StatusBadge: React.FC<{ status: OperationStatus }> = ({ status }) => {
  switch (status) {
    case 'draft':
      return <span className="badge badge-draft"><Clock size={12} /> Draft</span>;
    case 'waiting':
      return <span className="badge badge-waiting"><Clock size={12} /> Waiting</span>;
    case 'ready':
      return <span className="badge badge-ready"><Clock size={12} /> Ready</span>;
    case 'done':
      return <span className="badge badge-done"><CheckCircle2 size={12} /> Done</span>;
    case 'canceled':
      return <span className="badge badge-canceled"><XCircle size={12} /> Canceled</span>;
    default:
      return <span className="badge badge-draft">{status}</span>;
  }
};

export const ApprovalBadge: React.FC<{ status?: DualApprovalStatus }> = ({ status }) => {
  if (!status || status === 'none') return null;
  switch (status) {
    case 'pending':
      return <span className="badge badge-waiting"><AlertTriangle size={12} /> Approval Pending</span>;
    case 'approved':
      return <span className="badge badge-done"><ShieldCheck size={12} /> Approved</span>;
    case 'rejected':
      return <span className="badge badge-canceled"><XCircle size={12} /> Rejected</span>;
  }
};

export const RiskBadge: React.FC<{ isAtRisk: boolean; daysRemaining: number }> = ({ isAtRisk, daysRemaining }) => {
  if (isAtRisk) {
    return (
      <span className="badge badge-risk">
        <AlertTriangle size={12} /> At Risk ({daysRemaining <= 0 ? 'Out of Stock' : `${daysRemaining}d left`})
      </span>
    );
  }
  return (
    <span className="badge badge-safe">
      <CheckCircle2 size={12} /> Optimal ({daysRemaining > 300 ? '300+ d' : `${daysRemaining}d stock`})
    </span>
  );
};

export const LedgerIntegrityBadge: React.FC<{ isValid: boolean; count: number }> = ({ isValid, count }) => {
  if (isValid) {
    return (
      <span className="badge badge-done" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.3rem 0.6rem' }}>
        <ShieldCheck size={14} /> SHA-256 Verified ({count} Blocks)
      </span>
    );
  }
  return (
    <span className="badge badge-canceled" style={{ background: 'rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '0.3rem 0.6rem' }}>
      <ShieldAlert size={14} /> Chain Tampering Detected!
    </span>
  );
};
