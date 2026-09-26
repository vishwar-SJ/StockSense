import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Product } from '../types';
import { Modal } from '../components/common/Modal';
import { BarcodeGeneratorModal } from '../components/common/BarcodeGeneratorModal';
import { RiskBadge } from '../components/common/Badge';
import { 
  Package, Plus, Search, Edit3, Trash2, QrCode, 
  MapPin, Sliders, AlertTriangle, Layers, FileText
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const { 
    products, 
    categories, 
    locations, 
    stockPolicies, 
    currentStockMap, 
    stockByLocationMap, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    openScannerModal 
  } = useInventory();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [locationModalProd, setLocationModalProd] = useState<Product | null>(null);
  const [barcodeLabelProd, setBarcodeLabelProd] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category_id: categories[0]?.id || 'cat_raw',
    uom: 'pcs' as Product['uom'],
    barcode: '',
    initial_stock: 50,
    min_qty: 20,
    max_qty: 150,
    lead_time_days: 5,
    cost_price: 25.00,
    supplier: 'Global Supply Partners'
  });

  const handleOpenCreate = () => {
    const randomSku = 'SKU-' + Math.floor(1000 + Math.random() * 9000);
    const randomBarcode = '890' + Math.floor(100000000 + Math.random() * 900000000);
    setFormData({
      sku: randomSku,
      name: '',
      category_id: categories[0]?.id || 'cat_raw',
      uom: 'pcs',
      barcode: randomBarcode,
      initial_stock: 50,
      min_qty: 20,
      max_qty: 150,
      lead_time_days: 5,
      cost_price: 25.00,
      supplier: 'Global Supply Partners'
    });
    setEditingProduct(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      sku: p.sku,
      name: p.name,
      category_id: p.category_id,
      uom: p.uom,
      barcode: p.barcode,
      initial_stock: p.initial_stock,
      min_qty: p.min_qty,
      max_qty: p.max_qty,
      lead_time_days: p.lead_time_days,
      cost_price: p.cost_price,
      supplier: p.supplier
    });
    setIsCreateModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...formData
      });
    } else {
      await createProduct(formData);
    }
    setIsCreateModalOpen(false);
  };

  // Filtered product list
  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.category_id !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || 
             p.sku.toLowerCase().includes(q) || 
             p.barcode.toLowerCase().includes(q) ||
             p.supplier.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Bar & Actions */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem' }}>Product Catalog & Inventory Policies</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Manage master products, unique barcodes, reorder rules, and location stock breakdown
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} /> Create New Product
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            className="input"
            placeholder="Search by product name, SKU code, or scanned barcode..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

        <div style={{ minWidth: '200px' }}>
          <select
            className="select"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Product Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product Name & SKU</th>
                <th>Category</th>
                <th>Barcode (Unique)</th>
                <th>UOM</th>
                <th>Unit Cost</th>
                <th>Available Stock</th>
                <th>Reorder Min/Max</th>
                <th>Forecast Alert</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No products found matching query.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const category = categories.find(c => c.id === product.category_id);
                  const currentQty = currentStockMap[product.id] ?? product.initial_stock;
                  const policy = stockPolicies.find(sp => sp.product_id === product.id);

                  return (
                    <tr key={product.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{product.name}</div>
                        <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          SKU: {product.sku} | Supplier: {product.supplier}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-draft">{category?.name || product.category_id}</span>
                      </td>
                      <td>
                        <div 
                          className="font-mono" 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.8125rem',
                            color: 'var(--accent-cyan)',
                            cursor: 'pointer'
                          }}
                          onClick={() => setBarcodeLabelProd(product)}
                          title="Click to print barcode label"
                        >
                          <QrCode size={14} /> {product.barcode}
                        </div>
                      </td>
                      <td style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>
                        {product.uom}
                      </td>
                      <td className="font-mono">${product.cost_price.toFixed(2)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline font-mono"
                          onClick={() => setLocationModalProd(product)}
                          style={{ fontWeight: 700, color: currentQty <= product.min_qty ? 'var(--accent-rose)' : 'var(--text-primary)' }}
                        >
                          <MapPin size={12} /> {currentQty.toLocaleString()} {product.uom}
                        </button>
                      </td>
                      <td className="font-mono" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        Min: {product.min_qty} | Max: {product.max_qty}
                      </td>
                      <td>
                        <RiskBadge 
                          isAtRisk={policy?.is_at_risk || false} 
                          daysRemaining={policy?.days_remaining ?? 999} 
                        />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => setBarcodeLabelProd(product)}
                            title="Generate Barcode Label"
                          >
                            <QrCode size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleOpenEdit(product)}
                            title="Edit Product"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              if (confirm(`Remove ${product.name} from catalog?`)) {
                                deleteProduct(product.id);
                              }
                            }}
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
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

      {/* Create / Edit Product Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingProduct ? "Update Product Details" : "Create Master Product Entity"}
        subtitle="Specify product attributes, unique barcode, initial stock, and supply policies"
        maxWidth="620px"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input
                type="text"
                className="input"
                required
                placeholder="e.g. Steel Rods 50mm"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">SKU / Item Code</label>
              <input
                type="text"
                className="input font-mono"
                required
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="select"
                value={formData.category_id}
                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Unit of Measure (UOM)</label>
              <select
                className="select"
                value={formData.uom}
                onChange={e => setFormData({ ...formData, uom: e.target.value as any })}
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="meters">Meters (m)</option>
                <option value="boxes">Boxes</option>
                <option value="liters">Liters (L)</option>
                <option value="rolls">Rolls / Spools</option>
                <option value="units">Units</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Barcode / QR String (Indexed)</label>
              <input
                type="text"
                className="input font-mono"
                required
                placeholder="890100010001"
                value={formData.barcode}
                onChange={e => setFormData({ ...formData, barcode: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit Cost Price ($)</label>
              <input
                type="number"
                step="0.01"
                className="input font-mono"
                required
                value={formData.cost_price}
                onChange={e => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {!editingProduct && (
            <div className="form-group">
              <label className="form-label">Initial Opening Stock (Main Warehouse)</label>
              <input
                type="number"
                className="input font-mono"
                required
                value={formData.initial_stock}
                onChange={e => setFormData({ ...formData, initial_stock: parseInt(e.target.value) || 0 })}
              />
            </div>
          )}

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Min Safety Qty</label>
              <input
                type="number"
                className="input font-mono"
                required
                value={formData.min_qty}
                onChange={e => setFormData({ ...formData, min_qty: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Target Stock</label>
              <input
                type="number"
                className="input font-mono"
                required
                value={formData.max_qty}
                onChange={e => setFormData({ ...formData, max_qty: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Supplier Lead (Days)</label>
              <input
                type="number"
                className="input font-mono"
                required
                value={formData.lead_time_days}
                onChange={e => setFormData({ ...formData, lead_time_days: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Vendor / Supplier</label>
            <input
              type="text"
              className="input"
              value={formData.supplier}
              onChange={e => setFormData({ ...formData, supplier: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingProduct ? "Save Changes" : "Create Product & Initialize Ledger"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Location Stock Breakdown Modal */}
      <Modal
        isOpen={!!locationModalProd}
        onClose={() => setLocationModalProd(null)}
        title={`Stock Location Breakdown: ${locationModalProd?.name}`}
        subtitle={`SKU: ${locationModalProd?.sku} | Total: ${currentStockMap[locationModalProd?.id || ''] || 0} ${locationModalProd?.uom}`}
        maxWidth="500px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {locations.map(loc => {
            if (!locationModalProd) return null;
            const locStock = stockByLocationMap[locationModalProd.id]?.[loc.id] || 0;

            return (
              <div
                key={loc.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg-card-hover)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{loc.name}</div>
                  <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Code: {loc.code} ({loc.type})
                  </div>
                </div>
                <div className="font-mono" style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent-cyan)' }}>
                  {locStock} {locationModalProd.uom}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* Barcode & QR Label Modal */}
      <BarcodeGeneratorModal
        isOpen={!!barcodeLabelProd}
        onClose={() => setBarcodeLabelProd(null)}
        product={barcodeLabelProd}
      />

    </div>
  );
};
