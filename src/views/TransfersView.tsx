import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { StockOperation } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { 
  ArrowRightLeft, Plus, CheckCircle2, Trash2, 
  Building2, MapPin
} from 'lucide-react';

export const TransfersView: React.FC = () => {
  const { 
    operations, 
    products, 
    locations, 
    createOperation, 
    validateOperation 
  } = useInventory();

  const transfers = operations.filter(o => o.type === 'internal');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOp, setSelectedOp] = useState<StockOperation | null>(null);

  // Form State
  const [sourceLocId, setSourceLocId] = useState('loc_main');
  const [destLocId, setDestLocId] = useState('loc_prod');
  const [notes, setNotes] = useState('Internal production line replenishment');
  const [formLines, setFormLines] = useState<Array<{ product_id: string; qty_expected: number }>>([
    { product_id: products[0]?.id || 'prod_01', qty_expected: 25 }
  ]);

  const handleAddLine = () => {
    setFormLines([
      ...formLines,
      { product_id: products[0]?.id || 'prod_01', qty_expected: 10 }
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    setFormLines(formLines.filter((_, i) => i !== idx));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formLines.length === 0 || sourceLocId === destLocId) return;

    const srcName = locations.find(l => l.id === sourceLocId)?.name;
    const destName = locations.find(l => l.id === destLocId)?.name;

    await createOperation({
      type: 'internal',
      partner: `${srcName} ➔ ${destName}`,
      source_location_id: sourceLocId,
      dest_location_id: destLocId,
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
            <ArrowRightLeft size={22} style={{ color: 'var(--accent-cyan)' }} /> Internal Warehouse Stock Transfers
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Move stock between internal locations (Main Store ➔ Production Floor, Rack A ➔ Rack B, WH 1 ➔ WH 2). Total stock stays constant.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} /> Schedule Transfer
        </button>
      </div>

      {/* Transfers Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Transfer Ref Code</th>
                <th>Source Location</th>
                <th>Destination Location</th>
                <th>Line Items</th>
                <th>Status</th>
                <th>Scheduled Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No internal stock transfers logged.
                  </td>
                </tr>
              ) : (
                transfers.map(tr => {
                  const srcLoc = locations.find(l => l.id === tr.source_location_id);
                  const destLoc = locations.find(l => l.id === tr.dest_location_id);

                  return (
                    <tr key={tr.id}>
                      <td className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {tr.code}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{srcLoc?.name || tr.source_location_id}</strong>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--accent-cyan)' }}>{destLoc?.name || tr.dest_location_id}</strong>
                      </td>
                      <td>{tr.lines.length} lines</td>
                      <td>
                        <StatusBadge status={tr.status} />
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {new Date(tr.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setSelectedOp(tr)}
                          >
                            Inspect Line Items
                          </button>
                          {tr.status !== 'done' && tr.status !== 'canceled' && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleValidate(tr.id)}
                            >
                              <CheckCircle2 size={14} /> Execute Move
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

      {/* Inspect Transfer Modal */}
      <Modal
        isOpen={!!selectedOp}
        onClose={() => setSelectedOp(null)}
        title={`Internal Transfer: ${selectedOp?.code}`}
        subtitle={`Route: ${locations.find(l => l.id === selectedOp?.source_location_id)?.name} ➔ ${locations.find(l => l.id === selectedOp?.dest_location_id)?.name}`}
        maxWidth="680px"
      >
        {selectedOp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <StatusBadge status={selectedOp.status} />
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Scheduled by {selectedOp.created_by}
              </div>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product & SKU</th>
                    <th>Transfer Quantity</th>
                    <th>Source ➔ Destination</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOp.lines.map(line => {
                    const prod = products.find(p => p.id === line.product_id);
                    return (
                      <tr key={line.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{prod?.name}</div>
                          <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            SKU: {prod?.sku}
                          </div>
                        </td>
                        <td className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                          {line.qty_expected} {prod?.uom}
                        </td>
                        <td style={{ fontSize: '0.8125rem' }}>
                          {locations.find(l => l.id === line.location_from)?.name} ➔ {locations.find(l => l.id === line.location_to)?.name}
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
                  <CheckCircle2 size={16} /> Execute Transfer (+ Ledger)
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Internal Transfer Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule Internal Stock Transfer"
        subtitle="Move inventory items between internal racks, zones, or warehouses"
        maxWidth="680px"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Source Location (From)</label>
              <select
                className="select"
                value={sourceLocId}
                onChange={e => setSourceLocId(e.target.value)}
              >
                {locations.filter(l => l.type === 'internal').map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Destination Location (To)</label>
              <select
                className="select"
                value={destLocId}
                onChange={e => setDestLocId(e.target.value)}
              >
                {locations.filter(l => l.type === 'internal').map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Transfer Line Items</label>
              <button type="button" className="btn btn-sm btn-outline" onClick={handleAddLine}>
                <Plus size={14} /> Add Item
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
                  placeholder="Qty"
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
            <label className="form-label">Transfer Purpose / Reason</label>
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
            <button type="submit" className="btn btn-primary" disabled={sourceLocId === destLocId}>
              Create Transfer Schedule
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
