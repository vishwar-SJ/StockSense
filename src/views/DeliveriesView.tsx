import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { StockOperation } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { 
  ArrowUpRight, Plus, QrCode, CheckCircle2, 
  Trash2, ShieldCheck, AlertTriangle, Truck
} from 'lucide-react';

export const DeliveriesView: React.FC = () => {
  const { 
    operations, 
    products, 
    locations, 
    createOperation, 
    validateOperation, 
    openScannerModal 
  } = useInventory();

  const deliveries = operations.filter(o => o.type === 'delivery');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOp, setSelectedOp] = useState<StockOperation | null>(null);

  // Form State
  const [partner, setPartner] = useState('Titan Heavy Machinery Sales');
  const [sourceLocationId, setSourceLocationId] = useState('loc_main');
  const [notes, setNotes] = useState('Customer sales order dispatch');
  const [formLines, setFormLines] = useState<Array<{ product_id: string; qty_expected: number }>>([
    { product_id: products[3]?.id || 'prod_04', qty_expected: 5 }
  ]);

  const handleAddLine = () => {
    setFormLines([
      ...formLines,
      { product_id: products[0]?.id || 'prod_01', qty_expected: 5 }
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    setFormLines(formLines.filter((_, i) => i !== idx));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formLines.length === 0) return;

    await createOperation({
      type: 'delivery',
      partner,
      source_location_id: sourceLocationId,
      dest_location_id: 'loc_cust',
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
            <ArrowUpRight size={22} style={{ color: 'var(--accent-amber)' }} /> Delivery Orders (Outgoing Shipment)
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Pick, pack, and verify customer orders. Barcode picking validation prevents mispick shipping errors.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} /> Create Delivery Order
        </button>
      </div>

      {/* Deliveries Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Delivery Ref Code</th>
                <th>Customer / Partner</th>
                <th>Source Warehouse</th>
                <th>Line Items</th>
                <th>Picked / Verified</th>
                <th>Status</th>
                <th>Dispatch Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No delivery documents registered.
                  </td>
                </tr>
              ) : (
                deliveries.map(del => {
                  const srcLoc = locations.find(l => l.id === del.source_location_id);
                  const totalExpected = del.lines.reduce((a, l) => a + l.qty_expected, 0);
                  const totalScanned = del.lines.reduce((a, l) => a + l.qty_scanned, 0);

                  return (
                    <tr key={del.id}>
                      <td className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {del.code}
                      </td>
                      <td style={{ fontWeight: 600 }}>{del.partner}</td>
                      <td>{srcLoc?.name || del.source_location_id}</td>
                      <td>{del.lines.length} lines</td>
                      <td className="font-mono">
                        <strong style={{ color: totalScanned >= totalExpected ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                          {totalScanned} / {totalExpected}
                        </strong>
                      </td>
                      <td>
                        <StatusBadge status={del.status} />
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {new Date(del.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setSelectedOp(del)}
                          >
                            Pick & Verify Barcode
                          </button>
                          {del.status !== 'done' && del.status !== 'canceled' && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleValidate(del.id)}
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

      {/* Inspect & Pick Verification Modal */}
      <Modal
        isOpen={!!selectedOp}
        onClose={() => setSelectedOp(null)}
        title={`Delivery Shipment Document: ${selectedOp?.code}`}
        subtitle={`Customer: ${selectedOp?.partner} | Source Warehouse: ${locations.find(l => l.id === selectedOp?.source_location_id)?.name}`}
        maxWidth="720px"
      >
        {selectedOp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <StatusBadge status={selectedOp.status} />
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Order initialized by {selectedOp.created_by}
              </div>
            </div>

            {/* Mispick Prevention Banner */}
            <div style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '0.75rem',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              color: 'var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertTriangle size={16} />
              <span>
                <strong>Smart Mispick Guard Active:</strong> Scanning a non-matching barcode will instantly block entry & raise a visual chime warning!
              </span>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product & Barcode</th>
                    <th>Ordered Qty</th>
                    <th>Picked / Verified</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Picking Scan</th>
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
                            <span className="badge badge-done"><CheckCircle2 size={12} /> Picked</span>
                          ) : (
                            <span className="badge badge-waiting">To Pick</span>
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
                                  title: `Scan Barcode to Verify Pick for ${prod?.name}`
                                });
                              }}
                            >
                              <QrCode size={14} /> Scan Pick Item
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedOp(null)}>
                Close
              </button>
              {selectedOp.status !== 'done' && (
                <button className="btn btn-success" onClick={() => handleValidate(selectedOp.id)}>
                  <CheckCircle2 size={16} /> Validate Delivery (-Stock)
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Delivery Order Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Delivery Order"
        subtitle="Log customer sales order shipment for warehouse picking"
        maxWidth="680px"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Customer / Partner Name</label>
              <input
                type="text"
                className="input"
                required
                placeholder="e.g. Titan Heavy Machinery Sales"
                value={partner}
                onChange={e => setPartner(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Source Picking Warehouse</label>
              <select
                className="select"
                value={sourceLocationId}
                onChange={e => setSourceLocationId(e.target.value)}
              >
                {locations.filter(l => l.type === 'internal').map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Outgoing Order Lines</label>
              <button type="button" className="btn btn-sm btn-outline" onClick={handleAddLine}>
                <Plus size={14} /> Add Line
              </button>
            </div>

            {formLines.map((line, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <select
                  className="select"
                  value={line.product_id}
                  onChange={e => {
                    const updated = [...formLines];
                    updated[idx].product_id = e.target.value;
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
                  placeholder="Qty Ordered"
                  value={line.qty_expected}
                  onChange={e => {
                    const updated = [...formLines];
                    updated[idx].qty_expected = parseInt(e.target.value) || 0;
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
            <label className="form-label">Shipping & Dispatch Notes</label>
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
              Initialize Delivery Order
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
