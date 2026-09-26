import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { LedgerIntegrityBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { 
  History, ShieldCheck, ShieldAlert, AlertTriangle, 
  RefreshCw, Lock, ArrowDownLeft, ArrowUpRight, 
  ArrowRightLeft, SlidersHorizontal, Search
} from 'lucide-react';

export const LedgerView: React.FC = () => {
  const { 
    ledger, 
    products, 
    locations, 
    ledgerIntegrity, 
    verifyLedger, 
    simulateTamper, 
    repairLedgerHashes 
  } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntryIndex, setSelectedEntryIndex] = useState<number | null>(null);

  const filteredLedger = ledger.filter(entry => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const prod = products.find(p => p.id === entry.product_id);
    return entry.operation_code.toLowerCase().includes(q) ||
           entry.user_name.toLowerCase().includes(q) ||
           entry.entry_hash.toLowerCase().includes(q) ||
           (prod && (prod.name.toLowerCase().includes(q) || prod.sku.toLowerCase().includes(q)));
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Bar */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={22} style={{ color: 'var(--accent-cyan)' }} /> Cryptographic Tamper-Evident Stock Ledger
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Immutable SHA-256 chained transaction log. Prevents unauthorized retroactive edits & shrinkage tampering.
          </p>
        </div>

        {/* Verification Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm font-mono" onClick={verifyLedger}>
            <ShieldCheck size={16} /> Verify SHA-256 Chain
          </button>
          
          {!ledgerIntegrity.isValid && (
            <button className="btn btn-success btn-sm font-mono" onClick={repairLedgerHashes}>
              <RefreshCw size={16} /> Re-Anchor Block Hashes
            </button>
          )}

          <button 
            className="btn btn-amber btn-sm font-mono" 
            onClick={() => simulateTamper(Math.min(1, ledger.length - 1))}
            title="Simulate retroactive quantity edit to test hash mismatch detection"
          >
            <AlertTriangle size={16} /> Simulate Data Tamper
          </button>
        </div>
      </div>

      {/* Verification Status Alert Banner */}
      <div className="card" style={{
        backgroundColor: ledgerIntegrity.isValid ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.1)',
        borderColor: ledgerIntegrity.isValid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {ledgerIntegrity.isValid ? (
            <ShieldCheck size={28} style={{ color: 'var(--accent-emerald)' }} />
          ) : (
            <ShieldAlert size={28} style={{ color: 'var(--accent-rose)' }} />
          )}
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: ledgerIntegrity.isValid ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
              {ledgerIntegrity.isValid ? "Cryptographic Blockchain Integrity: VERIFIED" : "TAMPER ALERT: SHA-256 Chain Corrupted!"}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {ledgerIntegrity.isValid ? (
                `All ${ledgerIntegrity.totalEntries} sequential entries match cryptographic SHA-256 prev_hash headers.`
              ) : (
                ledgerIntegrity.reason || "Hash payload mismatch detected!"
              )}
            </div>
          </div>
        </div>

        <LedgerIntegrityBadge isValid={ledgerIntegrity.isValid} count={ledgerIntegrity.totalEntries} />
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '0.875rem 1.25rem' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            className="input font-mono"
            placeholder="Search by doc code, product name, operator, or SHA-256 hash string..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Ledger Entries Table */}
      <div className="card">
        <div className="table-container">
          <table className="table font-mono" style={{ fontSize: '0.8125rem' }}>
            <thead>
              <tr>
                <th>Block #</th>
                <th>Operation Ref</th>
                <th>Product & SKU</th>
                <th>Location</th>
                <th>Qty Delta</th>
                <th>Operator</th>
                <th>Previous SHA-256 Hash</th>
                <th>Entry SHA-256 Hash</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No ledger entries found.
                  </td>
                </tr>
              ) : (
                filteredLedger.map((entry, index) => {
                  const prod = products.find(p => p.id === entry.product_id);
                  const loc = locations.find(l => l.id === entry.location_id);
                  
                  // Check if this block is broken in tamper check
                  const isBrokenBlock = !ledgerIntegrity.isValid && ledgerIntegrity.brokenEntryId === entry.id;

                  return (
                    <tr 
                      key={entry.id}
                      onClick={() => setSelectedEntryIndex(index)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: isBrokenBlock ? 'rgba(239, 68, 68, 0.2)' : undefined
                      }}
                    >
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{index + 1}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{entry.operation_code}</span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-sans)' }}>
                        <div style={{ fontWeight: 600 }}>{prod?.name || entry.product_id}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SKU: {prod?.sku}</div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-sans)' }}>{loc?.name || entry.location_id}</td>
                      <td>
                        <strong style={{ color: entry.qty_delta > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                          {entry.qty_delta > 0 ? `+${entry.qty_delta}` : entry.qty_delta} {prod?.uom}
                        </strong>
                      </td>
                      <td style={{ fontFamily: 'var(--font-sans)' }}>{entry.user_name}</td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} title={entry.prev_hash}>
                        {entry.prev_hash.slice(0, 10)}...
                      </td>
                      <td style={{ fontSize: '0.75rem', color: isBrokenBlock ? 'var(--accent-rose)' : 'var(--accent-emerald)' }} title={entry.entry_hash}>
                        {entry.entry_hash.slice(0, 10)}...
                      </td>
                      <td>
                        {isBrokenBlock ? (
                          <span className="badge badge-canceled"><ShieldAlert size={12} /> Broken</span>
                        ) : (
                          <span className="badge badge-done"><Lock size={12} /> Valid</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Block Details Modal */}
      <Modal
        isOpen={selectedEntryIndex !== null}
        onClose={() => setSelectedEntryIndex(null)}
        title={selectedEntryIndex !== null ? `Ledger Block #${selectedEntryIndex + 1} Inspection` : ''}
        subtitle="Full SHA-256 cryptographic chain header & payload proof"
        maxWidth="680px"
      >
        {selectedEntryIndex !== null && ledger[selectedEntryIndex] && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="font-mono">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', backgroundColor: 'var(--bg-card-muted)', padding: '0.875rem', borderRadius: '6px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Block ID</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{ledger[selectedEntryIndex].id}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Operation Ref</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{ledger[selectedEntryIndex].operation_code}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Timestamp</div>
                <div style={{ fontSize: '0.8125rem' }}>{new Date(ledger[selectedEntryIndex].timestamp).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Operator</div>
                <div style={{ fontSize: '0.8125rem' }}>{ledger[selectedEntryIndex].user_name}</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Previous Block Hash (prev_hash)</label>
              <textarea
                className="textarea font-mono"
                rows={2}
                readOnly
                value={ledger[selectedEntryIndex].prev_hash}
                style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Block SHA-256 Hash (entry_hash)</label>
              <textarea
                className="textarea font-mono"
                rows={2}
                readOnly
                value={ledger[selectedEntryIndex].entry_hash}
                style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-amber btn-sm"
                onClick={() => {
                  simulateTamper(selectedEntryIndex);
                  setSelectedEntryIndex(null);
                }}
              >
                <AlertTriangle size={14} /> Corrupt This Block
              </button>

              <button className="btn btn-secondary" onClick={() => setSelectedEntryIndex(null)}>
                Close Inspection
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
