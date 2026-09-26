import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { StockOperation } from '../types';
import { StatusBadge, ApprovalBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { 
  SlidersHorizontal, Plus, QrCode, CheckCircle2, 
  AlertTriangle, ShieldCheck, XCircle, Search
} from 'lucide-react';

export const AdjustmentsView: React.FC = () => {
  const { 
    operations, 
    products, 
    locations, 
    currentStockMap, 
    activeRole,
    createOperation, 
    validateOperation, 
    approveAdjustment,
    openScannerModal 
  } = useInventory();

  const adjustments = operations.filter(o => o.type === 'adjustment');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOp, setSelectedOp] = useState<StockOperation | null>(null);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || 'prod_01');
  const [targetLocationId, setTargetLocationId] = useState('loc_main');
  const [physicalCount, setPhysicalCount] = useState<number>(35);
  const [reason, setReason] = useState('Monthly physical audit count mismatch');

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const recordedStock = selectedProduct ? (currentStockMap[selectedProduct.id] ?? selectedProduct.initial_stock) : 0;
  const stockDelta = physicalCount - recordedStock;
  const deltaCost = Math.abs(stockDelta * (selectedProduct?.cost_price || 0));
  const isHighValue = deltaCost > 200 || Math.abs(stockDelta) >= 10;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    await createOperation({
      type: 'adjustment',
      partner: `Physical Count Mismatch Audit`,
      source_location_id: targetLocationId,
      dest_location_id: 'loc_adj',
      notes: `${reason} | Physical Count: ${physicalCount} (Recorded: ${recordedStock} | Delta: ${stockDelta > 0 ? '+' : ''}${stockDelta})`,
      lines: [
        {
          product_id: selectedProductId,
          qty_expected: stockDelta,
          unit_cost: selectedProduct.cost_price
        }
      ]
    });

    setIsCreateModalOpen(false);
  };

  const handleValidate = async (opId: string) => {
    const success = await validateOperation(opId);
    if (success && selectedOp && selectedOp.id === opId) {
      const updated = operations.find(o => o.id === opId);
      if (updated) setSelectedOp(updated);
    }
  };

  const handleApprove = async (opId: string, isApproved: boolean) => {
    await approveAdjustment(opId, isApproved);
    if (selectedOp && selectedOp.id === opId) {
      const updated = operations.find(o => o.id === opId);
      if (updated) setSelectedOp(updated);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Bar */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SlidersHorizontal size={22} style={{ color: 'var(--accent-amber)' }} /> Inventory Stock Adjustments
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Reconcile physical inventory counts against recorded system stock. High-value discrepancies require Dual Manager Approval.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} /> New Physical Count Adjustment
        </button>
      </div>

      {/* Adjustments Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Adjustment Ref Code</th>
                <th>Target Product</th>
                <th>Location</th>
                <th>Stock Discrepancy</th>
                <th>Dual Approval</th>
                <th>Status</th>
                <th>Audit Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No stock adjustments logged.
                  </td>
                </tr>
              ) : (
                adjustments.map(adj => {
                  const line = adj.lines[0];
                  const prod = products.find(p => p.id === line?.product_id);
                  const loc = locations.find(l => l.id === adj.source_location_id);
                  const delta = line ? line.qty_expected : 0;

                  return (
                    <tr key={adj.id}>
                      <td className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {adj.code}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{prod?.name || 'Multiple items'}</div>
                        <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          SKU: {prod?.sku}
                        </div>
                      </td>
                      <td>{loc?.name || adj.source_location_id}</td>
                      <td className="font-mono">
                        <strong style={{ color: delta < 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                          {delta > 0 ? `+${delta}` : delta} {prod?.uom}
                        </strong>
                      </td>
                      <td>
                        <ApprovalBadge status={adj.approval_status} />
                      </td>
                      <td>
                        <StatusBadge status={adj.status} />
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {new Date(adj.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setSelectedOp(adj)}
                          >
                            Inspect Audit
                          </button>
                          {adj.status !== 'done' && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleValidate(adj.id)}
                              disabled={adj.requires_dual_approval && adj.approval_status !== 'approved'}
                            >
                              <CheckCircle2 size={14} /> Validate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect & Dual Approval Modal */}
      <Modal
        isOpen={!!selectedOp}
        onClose={() => setSelectedOp(null)}
        title={`Stock Adjustment Audit: ${selectedOp?.code}`}
        subtitle={`Logged by ${selectedOp?.created_by} on ${new Date(selectedOp?.created_at || '').toLocaleString()}`}
        maxWidth="680px"
      >
        {selectedOp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <StatusBadge status={selectedOp.status} />
                <ApprovalBadge status={selectedOp.approval_status} />
              </div>
            </div>

            {/* High Value Dual Approval Alert Box */}
            {selectedOp.requires_dual_approval && selectedOp.approval_status === 'pending' && (
              <div style={{
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '0.875rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <AlertTriangle size={16} /> Dual Approval Required
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
                    Discrepancy exceeds standard threshold. Requires Manager authorization before updating ledger.
                  </div>
                </div>

                {activeRole === 'inventory_manager' ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleApprove(selectedOp.id, false)}
                    >
                      <XCircle size={14} /> Reject
                    </button>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleApprove(selectedOp.id, true)}
                    >
                      <ShieldCheck size={14} /> Authorize & Approve
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    (Switch persona to Inventory Manager to authorize)
                  </span>
                )}
              </div>
            )}

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product Item</th>
                    <th>Adjustment Delta</th>
                    <th>Unit Cost</th>
                    <th>Total Valuation Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOp.lines.map(line => {
                    const prod = products.find(p => p.id === line.product_id);
                    const cost = line.unit_cost || prod?.cost_price || 0;
                    const impact = Math.abs(line.qty_expected * cost);

                    return (
                      <tr key={line.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{prod?.name}</div>
                          <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            SKU: {prod?.sku}
                          </div>
                        </td>
                        <td className="font-mono" style={{ fontWeight: 700, color: line.qty_expected < 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                          {line.qty_expected > 0 ? `+${line.qty_expected}` : line.qty_expected} {prod?.uom}
                        </td>
                        <td className="font-mono">${cost.toFixed(2)}</td>
                        <td className="font-mono" style={{ fontWeight: 700 }}>
                          ${impact.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {selectedOp.notes && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-card-hover)', padding: '0.625rem', borderRadius: '4px' }}>
                Audit Details: {selectedOp.notes}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedOp(null)}>
                Close
              </button>
              {selectedOp.status !== 'done' && (
                <button
                  className="btn btn-success"
                  onClick={() => handleValidate(selectedOp.id)}
                  disabled={selectedOp.requires_dual_approval && selectedOp.approval_status !== 'approved'}
                >
                  <CheckCircle2 size={16} /> Finalize & Update Stock Ledger
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create New Physical Count Adjustment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Perform Physical Count Stock Adjustment"
        subtitle="Select item, scan/input counted quantity, and auto-compute stock discrepancy"
        maxWidth="600px"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Target Product Item</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                className="select"
                style={{ flex: 1 }}
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Recorded Stock: {currentStockMap[p.id] ?? p.initial_stock} {p.uom})
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="btn btn-secondary font-mono"
                onClick={() => {
                  openScannerModal({}, (scannedBarcode) => {
                    const match = products.find(p => p.barcode.toLowerCase() === scannedBarcode.toLowerCase());
                    if (match) setSelectedProductId(match.id);
                  });
                }}
              >
                <QrCode size={16} /> Scan
              </button>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Audit Warehouse Location</label>
              <select
                className="select"
                value={targetLocationId}
                onChange={e => setTargetLocationId(e.target.value)}
              >
                {locations.filter(l => l.type === 'internal').map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Physical Count Quantity</label>
              <input
                type="number"
                className="input font-mono"
                required
                value={physicalCount}
                onChange={e => setPhysicalCount(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Discrepancy Live Summary Panel */}
          {selectedProduct && (
            <div style={{
              backgroundColor: 'var(--bg-card-muted)',
              border: `1px solid ${isHighValue ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-color)'}`,
              padding: '0.875rem',
              borderRadius: '6px',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span>Recorded System Stock: <strong>{recordedStock} {selectedProduct.uom}</strong></span>
                <span>Physical Count: <strong>{physicalCount} {selectedProduct.uom}</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem', fontWeight: 700, marginTop: '0.5rem' }}>
                <span>Calculated Discrepancy (Delta):</span>
                <span className="font-mono" style={{ color: stockDelta < 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                  {stockDelta > 0 ? `+${stockDelta}` : stockDelta} {selectedProduct.uom} (${deltaCost.toFixed(2)})
                </span>
              </div>

              {isHighValue && (
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertTriangle size={14} /> High-value adjustment detected ($200+ / 10+ units). Will trigger Dual Approval rule.
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Adjustment Reason / Notes</label>
            <input
              type="text"
              className="input"
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Post Adjustment Entry
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
