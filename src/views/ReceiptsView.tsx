import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { StockOperation } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { 
  ArrowDownLeft, Plus, QrCode, CheckCircle2, 
  Trash2, ShieldCheck, Truck, Package, Play
} from 'lucide-react';

export const ReceiptsView: React.FC = () => {
  const { 
    operations, 
    products, 
    locations, 
    createOperation, 
    validateOperation, 
    scanMoveLineItem,
    openScannerModal 
  } = useInventory();

  const receipts = operations.filter(o => o.type === 'receipt');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOp, setSelectedOp] = useState<StockOperation | null>(null);

  // Form State
  const [partner, setPartner] = useState('Apex Metallurgy Corp');
  const [destLocationId, setDestLocationId] = useState('loc_main');
  const [notes, setNotes] = useState('Vendor shipment receiving');
  const [formLines, setFormLines] = useState<Array<{ product_id: string; qty_expected: number; unit_cost: number }>>([
    { product_id: products[0]?.id || 'prod_01', qty_expected: 50, unit_cost: products[0]?.cost_price || 18.50 }
  ]);

  const handleAddLine = () => {
    setFormLines([
      ...formLines,
      { product_id: products[0]?.id || 'prod_01', qty_expected: 10, unit_cost: products[0]?.cost_price || 20.00 }
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    setFormLines(formLines.filter((_, i) => i !== idx));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formLines.length === 0) return;

    await createOperation({
      type: 'receipt',
      partner,
      source_location_id: 'loc_vendor',
      dest_location_id: destLocationId,
      notes,
      lines: formLines
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Bar */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowDownLeft size={22} style={{ color: 'var(--accent-emerald)' }} /> Receipts (Incoming Goods)
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Process incoming vendor shipments. Scan barcodes live to increment quantities & auto-post to ledger.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} /> Create New Receipt
        </button>
      </div>

      {/* Receipts Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Receipt Ref Code</th>
                <th>Supplier / Vendor</th>
                <th>Destination Warehouse</th>
                <th>Line Items</th>
                <th>Received / Scanned</th>
                <th>Status</th>
                <th>Created At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No receipt documents registered.
                  </td>
                </tr>
              ) : (
                receipts.map(receipt => {
                  const destLoc = locations.find(l => l.id === receipt.dest_location_id);
                  const totalExpected = receipt.lines.reduce((a, l) => a + l.qty_expected, 0);
                  const totalScanned = receipt.lines.reduce((a, l) => a + l.qty_scanned, 0);

                  return (
                    <tr key={receipt.id}>
                      <td className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {receipt.code}
                      </td>
                      <td style={{ fontWeight: 600 }}>{receipt.partner}</td>
                      <td>{destLoc?.name || receipt.dest_location_id}</td>
                      <td>{receipt.lines.length} lines</td>
                      <td className="font-mono">
                        <strong style={{ color: totalScanned >= totalExpected ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                          {totalScanned} / {totalExpected}
                        </strong>
                      </td>
                      <td>
                        <StatusBadge status={receipt.status} />
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {new Date(receipt.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setSelectedOp(receipt)}
                          >
                            Inspect & Scan
                          </button>
                          {receipt.status !== 'done' && receipt.status !== 'canceled' && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleValidate(receipt.id)}
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

      {/* Inspect & Live Barcode Scan Modal */}
      <Modal
        isOpen={!!selectedOp}
        onClose={() => setSelectedOp(null)}
        title={`Receipt Document: ${selectedOp?.code}`}
        subtitle={`Supplier: ${selectedOp?.partner} | Receiving Warehouse: ${locations.find(l => l.id === selectedOp?.dest_location_id)?.name}`}
        maxWidth="720px"
      >
        {selectedOp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <StatusBadge status={selectedOp.status} />
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Created by {selectedOp.created_by} on {new Date(selectedOp.created_at).toLocaleString()}
              </div>
            </div>

            {/* Line items table with scan button */}
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product & Barcode</th>
                    <th>Expected</th>
                    <th>Scanned</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Scan Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOp.lines.map(line => {
                    const prod = products.find(p => p.id === line.product_id);
                    const isMatched = line.qty_scanned >= line.qty_expected;

                    return (
                      <tr key={line.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{prod?.name}</div>
                          <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                            SKU: {prod?.sku} | Barcode: {prod?.barcode}
                          </div>
                        </td>
                        <td className="font-mono">{line.qty_expected} {prod?.uom}</td>
                        <td className="font-mono" style={{ fontWeight: 700, color: isMatched ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                          {line.qty_scanned} {prod?.uom}
                        </td>
                        <td>
                          {isMatched ? (
                            <span className="badge badge-done"><CheckCircle2 size={12} /> Complete</span>
                          ) : (
                            <span className="badge badge-waiting">In Progress</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {selectedOp.status !== 'done' && (
                            <button
                              className="btn btn-sm btn-secondary font-mono"
                              onClick={() => {
                                openScannerModal({
                                  operationId: selectedOp.id,
                                  lineId: line.id,
                                  expectedProductId: line.product_id,
                                  title: `Scan Barcode for ${prod?.name}`
                                });
                              }}
                            >
                              <QrCode size={14} /> Scan Barcode
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {selectedOp.notes && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontStyle: 'italic', backgroundColor: 'var(--bg-card-hover)', padding: '0.55rem', borderRadius: '4px' }}>
                Note: {selectedOp.notes}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedOp(null)}>
                Close
              </button>
              {selectedOp.status !== 'done' && (
                <button className="btn btn-success" onClick={() => handleValidate(selectedOp.id)}>
                  <CheckCircle2 size={16} /> Validate Receipt (+Stock)
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create New Receipt Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Vendor Receipt"
        subtitle="Log incoming stock delivery shipment from vendor"
        maxWidth="680px"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Vendor / Supplier Name</label>
              <input
                type="text"
                className="input"
                required
                placeholder="e.g. Apex Metallurgy Corp"
                value={partner}
                onChange={e => setPartner(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Destination Warehouse / Location</label>
              <select
                className="select"
                value={destLocationId}
                onChange={e => setDestLocationId(e.target.value)}
              >
                {locations.filter(l => l.type === 'internal').map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Incoming Line Items</label>
              <button type="button" className="btn btn-sm btn-outline" onClick={handleAddLine}>
                <Plus size={14} /> Add Line
              </button>
            </div>

            {formLines.map((line, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <select
                  className="select"
                  value={line.product_id}
                  onChange={e => {
                    const p = products.find(prod => prod.id === e.target.value);
                    const updated = [...formLines];
                    updated[idx].product_id = e.target.value;
                    if (p) updated[idx].unit_cost = p.cost_price;
                    setFormLines(updated);
                  }}
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>

                <input
                  type="number"
                  className="input font-mono"
                  placeholder="Qty Expected"
                  value={line.qty_expected}
                  onChange={e => {
                    const updated = [...formLines];
                    updated[idx].qty_expected = parseInt(e.target.value) || 0;
                    setFormLines(updated);
                  }}
                />

                <input
                  type="number"
                  step="0.01"
                  className="input font-mono"
                  placeholder="Unit Cost"
                  value={line.unit_cost}
                  onChange={e => {
                    const updated = [...formLines];
                    updated[idx].unit_cost = parseFloat(e.target.value) || 0;
                    setFormLines(updated);
                  }}
                />

                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => handleRemoveLine(idx)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Receiving Notes & Delivery Reference</label>
            <input
              type="text"
              className="input"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Initialize Receipt Document
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
