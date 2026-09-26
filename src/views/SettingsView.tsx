import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Modal } from '../components/common/Modal';
import { 
  Settings, Building2, Layers, Plus, ShieldCheck, 
  RefreshCw, CheckCircle2, Lock
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    locations, 
    categories, 
    addLocation, 
    addCategory, 
    repairLedgerHashes, 
    verifyLedger 
  } = useInventory();

  // Modals State
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  // Form State
  const [locName, setLocName] = useState('');
  const [locCode, setLocCode] = useState('');
  const [locType, setLocType] = useState<'internal' | 'vendor' | 'customer'>('internal');

  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const handleCreateLoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName || !locCode) return;
    addLocation({
      name: locName,
      code: locCode,
      type: locType,
      is_active: true
    });
    setLocName('');
    setLocCode('');
    setIsLocModalOpen(false);
  };

  const handleCreateCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catCode) return;
    addCategory({
      name: catName,
      code: catCode,
      description: catDesc
    });
    setCatName('');
    setCatCode('');
    setCatDesc('');
    setIsCatModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Bar */}
      <div className="card">
        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={22} style={{ color: 'var(--accent-blue)' }} /> Warehouse & System Configuration
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Manage physical warehouse locations, storage racks, product categories, and SHA-256 security rules.
        </p>
      </div>

      {/* Warehouses & Locations Manager */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h4 style={{ fontSize: '1rem' }}>Registered Warehouses & Locations</h4>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setIsLocModalOpen(true)}>
            <Plus size={14} /> Add Warehouse Location
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Location Name</th>
                <th>Location Code</th>
                <th>Location Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {locations.map(loc => (
                <tr key={loc.id}>
                  <td style={{ fontWeight: 600 }}>{loc.name}</td>
                  <td className="font-mono" style={{ color: 'var(--accent-cyan)' }}>{loc.code}</td>
                  <td style={{ textTransform: 'capitalize' }}>{loc.type}</td>
                  <td>
                    <span className="badge badge-done"><CheckCircle2 size={12} /> Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Categories Manager */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} style={{ color: 'var(--accent-emerald)' }} />
            <h4 style={{ fontSize: '1rem' }}>Product Categories Catalog</h4>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setIsCatModalOpen(true)}>
            <Plus size={14} /> Add Product Category
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Code</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td style={{ fontWeight: 600 }}>{cat.name}</td>
                  <td className="font-mono">{cat.code}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{cat.description || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security & Ledger Maintenance */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} style={{ color: 'var(--accent-amber)' }} />
            <h4 style={{ fontSize: '1rem' }}>Cryptographic SHA-256 Ledger Maintenance</h4>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={verifyLedger}>
            <ShieldCheck size={16} /> Run Integrity Audit
          </button>
          <button className="btn btn-success" onClick={repairLedgerHashes}>
            <RefreshCw size={16} /> Re-Anchor SHA-256 Chain
          </button>
        </div>
      </div>

      {/* Add Location Modal */}
      <Modal
        isOpen={isLocModalOpen}
        onClose={() => setIsLocModalOpen(false)}
        title="Register New Warehouse Location"
        subtitle="Add internal storage zone, pallet rack, or auxiliary storehouse"
        maxWidth="500px"
      >
        <form onSubmit={handleCreateLoc}>
          <div className="form-group">
            <label className="form-label">Location Name</label>
            <input
              type="text"
              className="input"
              required
              placeholder="e.g. Storage Rack C - Row 4"
              value={locName}
              onChange={e => setLocName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location Code</label>
            <input
              type="text"
              className="input font-mono"
              required
              placeholder="RACK-C4"
              value={locCode}
              onChange={e => setLocCode(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              className="select"
              value={locType}
              onChange={e => setLocType(e.target.value as any)}
            >
              <option value="internal">Internal Warehouse Zone</option>
              <option value="vendor">External Vendor Store</option>
              <option value="customer">Customer Shipping Transit</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsLocModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Location
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title="Add Product Category"
        subtitle="Group products into catalog taxonomies"
        maxWidth="500px"
      >
        <form onSubmit={handleCreateCat}>
          <div className="form-group">
            <label className="form-label">Category Name</label>
            <input
              type="text"
              className="input"
              required
              placeholder="e.g. Hydraulics & Pneumatics"
              value={catName}
              onChange={e => setCatName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category Code</label>
            <input
              type="text"
              className="input font-mono"
              required
              placeholder="HYD-PN"
              value={catCode}
              onChange={e => setCatCode(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="input"
              placeholder="Fluid power valves, pumps, and hoses"
              value={catDesc}
              onChange={e => setCatDesc(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCatModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Category
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
