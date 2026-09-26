import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Package, AlertTriangle, ArrowDownLeft, ArrowUpRight, DollarSign, Search } from 'lucide-react';

interface DashboardViewProps {
  setActiveView: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveView }) => {
  const { 
    products, 
    operations, 
    locations, 
    stockPolicies, 
    currentStockMap 
  } = useInventory();

  const [filterDocType, setFilterDocType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const totalProductsCount = products.length;
  const totalStockUnits = Object.values(currentStockMap).reduce((a, b) => a + b, 0);
  const atRiskCount = stockPolicies.filter(sp => sp.is_at_risk).length;

  const pendingReceiptsCount = operations.filter(o => o.type === 'receipt' && o.status !== 'done').length;
  const pendingDeliveriesCount = operations.filter(o => o.type === 'delivery' && o.status !== 'done').length;

  const totalStockValue = products.reduce((acc, p) => {
    const qty = currentStockMap[p.id] ?? p.initial_stock;
    return acc + (qty * p.cost_price);
  }, 0);

  const filteredOperations = operations.filter(op => {
    if (filterDocType !== 'all' && op.type !== filterDocType) return false;
    if (filterStatus !== 'all' && op.status !== filterStatus) return false;
    if (filterLocation !== 'all' && op.source_location_id !== filterLocation && op.dest_location_id !== filterLocation) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return op.code.toLowerCase().includes(q) || op.partner.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="grid-4">
        <div className="card">
          <div className="card-header" style={{ border: 'none', padding: 0, marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Products in Stock
            </span>
            <div style={{ padding: '0.35rem', borderRadius: '6px', background: 'rgba(14, 165, 233, 0.15)', color: 'var(--accent-cyan)' }}>
              <Package size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {totalProductsCount} <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-secondary)' }}>items</span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Total Inventory Volume: <strong style={{ color: 'var(--text-primary)' }}>{totalStockUnits.toLocaleString()} units</strong>
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ border: 'none', padding: 0, marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-rose)', textTransform: 'uppercase' }}>
              Low Stock (At Risk)
            </span>
            <div style={{ padding: '0.35rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-rose)' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-rose)' }}>
            {atRiskCount} <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-secondary)' }}>SKUs</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ border: 'none', padding: 0, marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Pending Receipts
            </span>
            <div style={{ padding: '0.35rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
              <ArrowDownLeft size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {pendingReceiptsCount}
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ border: 'none', padding: 0, marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Pending Deliveries
            </span>
            <div style={{ padding: '0.35rem', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {pendingDeliveriesCount}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '6px', backgroundColor: 'rgba(37, 99, 235, 0.15)', color: 'var(--accent-blue)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Inventory Valuation
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              ${totalStockValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Inventory Document Ledger</h3>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card-muted)', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select className="select" value={filterDocType} onChange={e => setFilterDocType(e.target.value)} style={{ width: '180px' }}>
            <option value="all">All Documents</option>
            <option value="receipt">Receipts</option>
            <option value="delivery">Deliveries</option>
          </select>

          <select className="select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '180px' }}>
            <option value="all">All Statuses</option>
            <option value="ready">Ready</option>
            <option value="done">Done</option>
          </select>

          <div style={{ position: 'relative', flex: 1 }}>
            <input type="text" className="input" placeholder="Search reference..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ paddingLeft: '2.25rem' }} />
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>Partner</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOperations.map(op => (
                <tr key={op.id}>
                  <td className="font-mono">{op.code}</td>
                  <td style={{ textTransform: 'capitalize' }}>{op.type}</td>
                  <td>{op.partner}</td>
                  <td><span className="badge badge-done">{op.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
