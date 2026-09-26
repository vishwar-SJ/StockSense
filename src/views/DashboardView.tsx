import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { StatusBadge, RiskBadge, LedgerIntegrityBadge } from '../components/common/Badge';
import { 
  Package, AlertTriangle, ArrowDownLeft, ArrowUpRight, 
  ArrowRightLeft, SlidersHorizontal, DollarSign, Filter, 
  Search, ShieldCheck, Zap, Plus, ExternalLink, RefreshCw
} from 'lucide-react';
import { OperationType, OperationStatus } from '../types';

interface DashboardViewProps {
  setActiveView: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveView }) => {
  const { 
    products, 
    operations, 
    locations, 
    categories, 
    stockPolicies, 
    currentStockMap, 
    ledgerIntegrity, 
    autoDraftReorderReceipt,
    openScannerModal
  } = useInventory();

  // Dynamic Filters State
  const [filterDocType, setFilterDocType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Compute Dashboard KPIs
  const totalProductsCount = products.length;
  const totalStockUnits = Object.values(currentStockMap).reduce((a, b) => a + b, 0);
  
  const atRiskPolicies = stockPolicies.filter(sp => sp.is_at_risk);
  const atRiskCount = atRiskPolicies.length;

  const pendingReceiptsCount = operations.filter(o => o.type === 'receipt' && o.status !== 'done' && o.status !== 'canceled').length;
  const pendingDeliveriesCount = operations.filter(o => o.type === 'delivery' && o.status !== 'done' && o.status !== 'canceled').length;
  const scheduledTransfersCount = operations.filter(o => o.type === 'internal' && o.status !== 'done' && o.status !== 'canceled').length;

  const totalStockValue = products.reduce((acc, p) => {
    const qty = currentStockMap[p.id] ?? p.initial_stock;
    return acc + (qty * p.cost_price);
  }, 0);

  // Filtered Operations List
  const filteredOperations = operations.filter(op => {
    if (filterDocType !== 'all' && op.type !== filterDocType) return false;
    if (filterStatus !== 'all' && op.status !== filterStatus) return false;
    if (filterLocation !== 'all' && op.source_location_id !== filterLocation && op.dest_location_id !== filterLocation) return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const codeMatch = op.code.toLowerCase().includes(q);
      const partnerMatch = op.partner.toLowerCase().includes(q);
      return codeMatch || partnerMatch;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* KPI Cards Row */}
      <div className="grid-4">
        
        {/* KPI 1: Total Products in Stock */}
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

        {/* KPI 2: Velocity Low Stock Alert ("At Risk in next X days") */}
        <div className="card" style={{ borderColor: atRiskCount > 0 ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-color)' }}>
          <div className="card-header" style={{ border: 'none', padding: 0, marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-rose)', textTransform: 'uppercase' }}>
              Predictive Low Stock (At Risk)
            </span>
            <div style={{ padding: '0.35rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-rose)' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: atRiskCount > 0 ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
            {atRiskCount} <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-secondary)' }}>SKUs At Risk</span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Depleting faster than supplier lead time
          </div>
        </div>

        {/* KPI 3: Pending Receipts */}
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
            {pendingReceiptsCount} <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-secondary)' }}>incoming</span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Vendor stock orders queued
          </div>
        </div>

        {/* KPI 4: Pending Deliveries & Scheduled Transfers */}
        <div className="card">
          <div className="card-header" style={{ border: 'none', padding: 0, marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Deliveries & Transfers
            </span>
            <div style={{ padding: '0.35rem', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {pendingDeliveriesCount + scheduledTransfersCount} <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-secondary)' }}>active</span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {pendingDeliveriesCount} Deliveries | {scheduledTransfersCount} Internal Moves
          </div>
        </div>

      </div>

      {/* Valuation & Ledger Integrity Banner */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            padding: '0.75rem',
            borderRadius: '6px',
            backgroundColor: 'rgba(37, 99, 235, 0.15)',
            color: 'var(--accent-blue)'
          }}>
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

        {/* SHA-256 Ledger Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LedgerIntegrityBadge isValid={ledgerIntegrity.isValid} count={ledgerIntegrity.totalEntries} />
          <button
            className="btn btn-outline btn-sm font-mono"
            onClick={() => setActiveView('ledger')}
          >
            Ledger Audit Trail <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Velocity-Based Predictive Stockout Alert Drawer */}
      {atRiskCount > 0 && (
        <div className="card" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} style={{ color: 'var(--accent-rose)' }} />
              <h3 style={{ fontSize: '1rem', color: 'var(--accent-rose)' }}>
                Predictive Replenishment Alerts ({atRiskCount} SKUs Depleting Soon)
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Rolling 30-day velocity algorithm comparing stockout vs lead time
            </span>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product Name & SKU</th>
                  <th>Current Stock</th>
                  <th>30-Day Velocity</th>
                  <th>Lead Time</th>
                  <th>Est. Stockout</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Smart Action</th>
                </tr>
              </thead>
              <tbody>
                {atRiskPolicies.map(sp => {
                  const prod = products.find(p => p.id === sp.product_id);
                  if (!prod) return null;
                  const currentQty = currentStockMap[prod.id] ?? prod.initial_stock;

                  return (
                    <tr key={sp.product_id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{prod.name}</div>
                        <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {prod.sku} | Barcode: {prod.barcode}
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: currentQty <= prod.min_qty ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
                          {currentQty} {prod.uom}
                        </strong>
                      </td>
                      <td>{sp.avg_daily_consumption} {prod.uom}/day</td>
                      <td>{sp.lead_time_days} days</td>
                      <td className="font-mono" style={{ color: 'var(--accent-amber)' }}>
                        {sp.predicted_stockout_date || 'Imminent'}
                      </td>
                      <td>
                        <RiskBadge isAtRisk={sp.is_at_risk} daysRemaining={sp.days_remaining} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-sm btn-amber"
                          onClick={() => autoDraftReorderReceipt(prod.id)}
                        >
                          <Zap size={14} /> Auto-Draft Receipt (+{sp.suggested_reorder_qty} {prod.uom})
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Operations Ledger Control View with Dynamic Filters */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem' }}>Inventory Document Operations Ledger</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Filter, track, pick, scan, and validate real-time stock movements
            </p>
          </div>

          {/* Quick Create Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" onClick={() => setActiveView('receipts')}>
              <ArrowDownLeft size={14} /> New Receipt
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveView('deliveries')}>
              <ArrowUpRight size={14} /> New Delivery
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setActiveView('transfers')}>
              <ArrowRightLeft size={14} /> Transfer
            </button>
          </div>
        </div>

        {/* Dynamic Filters Bar */}
        <div style={{
          backgroundColor: 'var(--bg-card-muted)',
          padding: '1rem',
          borderRadius: '6px',
          marginBottom: '1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          alignItems: 'end'
        }}>
          {/* Document Type Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Doc Type</label>
            <select
              className="select"
              value={filterDocType}
              onChange={e => setFilterDocType(e.target.value)}
            >
              <option value="all">All Documents</option>
              <option value="receipt">Receipts (Incoming)</option>
              <option value="delivery">Delivery Orders (Outgoing)</option>
              <option value="internal">Internal Transfers</option>
              <option value="adjustment">Stock Adjustments</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Status</label>
            <select
              className="select"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="waiting">Waiting</option>
              <option value="ready">Ready</option>
              <option value="done">Done</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>

          {/* Location Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Warehouse / Location</label>
            <select
              className="select"
              value={filterLocation}
              onChange={e => setFilterLocation(e.target.value)}
            >
              <option value="all">All Warehouses</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
              ))}
            </select>
          </div>

          {/* Search Query */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Reference Search</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input"
                placeholder="Search reference code or partner..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.25rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        {/* Operations Data Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Reference Code</th>
                <th>Operation Type</th>
                <th>Partner / Description</th>
                <th>Source Location</th>
                <th>Destination Location</th>
                <th>Items Count</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOperations.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No operations matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOperations.map(op => {
                  const srcLoc = locations.find(l => l.id === op.source_location_id);
                  const destLoc = locations.find(l => l.id === op.dest_location_id);

                  return (
                    <tr key={op.id}>
                      <td className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {op.code}
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{op.type}</span>
                      </td>
                      <td>{op.partner}</td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {srcLoc?.name || op.source_location_id}
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {destLoc?.name || op.dest_location_id}
                      </td>
                      <td>{op.lines.length} lines</td>
                      <td>
                        <StatusBadge status={op.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            if (op.type === 'receipt') setActiveView('receipts');
                            else if (op.type === 'delivery') setActiveView('deliveries');
                            else if (op.type === 'internal') setActiveView('transfers');
                            else setActiveView('adjustments');
                          }}
                        >
                          Open Document
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
