import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Settings, Building2, Layers, Plus, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { locations, categories, addLocation, addCategory } = useInventory();
  const [locName, setLocName] = useState('');
  const [locCode, setLocCode] = useState('');
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');

  const handleCreateLoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName || !locCode) return;
    addLocation({ name: locName, code: locCode, type: 'internal', is_active: true });
    setLocName(''); setLocCode('');
  };

  const handleCreateCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catCode) return;
    addCategory({ name: catName, code: catCode });
    setCatName(''); setCatCode('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card">
        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={22} style={{ color: 'var(--accent-blue)' }} /> Warehouse & System Configuration
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Manage physical warehouse locations and product categories.
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h4 style={{ fontSize: '1rem' }}>Registered Warehouses & Locations</h4>
          </div>
        </div>

        <form onSubmit={handleCreateLoc} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input type="text" className="input" placeholder="Location Name" value={locName} onChange={e => setLocName(e.target.value)} required />
          <input type="text" className="input font-mono" placeholder="Code (e.g. WH-SOUTH)" value={locCode} onChange={e => setLocCode(e.target.value)} required />
          <button type="submit" className="btn btn-primary"><Plus size={14} /> Add Location</button>
        </form>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Location Name</th><th>Code</th><th>Type</th><th>Status</th></tr>
            </thead>
            <tbody>
              {locations.map(loc => (
                <tr key={loc.id}>
                  <td style={{ fontWeight: 600 }}>{loc.name}</td>
                  <td className="font-mono">{loc.code}</td>
                  <td>{loc.type}</td>
                  <td><span className="badge badge-done"><CheckCircle2 size={12} /> Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} style={{ color: 'var(--accent-emerald)' }} />
            <h4 style={{ fontSize: '1rem' }}>Product Categories</h4>
          </div>
        </div>

        <form onSubmit={handleCreateCat} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input type="text" className="input" placeholder="Category Name" value={catName} onChange={e => setCatName(e.target.value)} required />
          <input type="text" className="input font-mono" placeholder="Code (e.g. CAT-MECH)" value={catCode} onChange={e => setCatCode(e.target.value)} required />
          <button type="submit" className="btn btn-primary"><Plus size={14} /> Add Category</button>
        </form>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Category Name</th><th>Code</th></tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td style={{ fontWeight: 600 }}>{cat.name}</td>
                  <td className="font-mono">{cat.code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
