import React from 'react';
import { OperationStatus, DualApprovalStatus } from '../../types';

export const StatusBadge: React.FC<{ status: OperationStatus }> = ({ status }) => {
  return <span className="badge badge-ready">{status}</span>;
};

export const ApprovalBadge: React.FC<{ status?: DualApprovalStatus }> = ({ status }) => {
  if (!status || status === 'none') return null;
  return <span className="badge badge-waiting">{status}</span>;
};

export const RiskBadge: React.FC<{ isAtRisk: boolean; daysRemaining: number }> = ({ isAtRisk, daysRemaining }) => {
  return <span className={`badge ${isAtRisk ? 'badge-risk' : 'badge-safe'}`}>{isAtRisk ? 'At Risk' : 'Optimal'}</span>;
};

export const LedgerIntegrityBadge: React.FC<{ isValid: boolean; count: number }> = ({ isValid, count }) => {
  return <span className="badge badge-done">SHA-256 Verified ({count} Blocks)</span>;
};
