import { Product, Location, ProductCategory, StockOperation, StockLedgerEntry, User } from '../types';

export const INITIAL_USER: User = {
  id: 'usr_mgr_01',
  name: 'Alex Vance',
  email: 'alex.vance@stocksense.io',
  role: 'inventory_manager',
  department: 'Global Logistics & Supply Operations',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
};

export const SEED_CATEGORIES: ProductCategory[] = [
  { id: 'cat_raw', name: 'Raw Metals & Steel', code: 'RAW-MTL', description: 'Structural steel, rods, coils, and alloys' },
  { id: 'cat_comp', name: 'Mechanical Components', code: 'MECH-CMP', description: 'Precision bearings, valves, and cylinders' },
  { id: 'cat_finish', name: 'Finished Goods', code: 'FIN-GOODS', description: 'Assembled products ready for customer shipment' },
  { id: 'cat_elec', name: 'Electrical & Cabling', code: 'ELEC-CBL', description: 'Cable spools, sensors, and power distribution' },
  { id: 'cat_mro', name: 'MRO & Safety Supplies', code: 'MRO-SF', description: 'Protective gear, lubricants, and workshop consumables' }
];

export const SEED_LOCATIONS: Location[] = [
  { id: 'loc_main', name: 'Main Central Warehouse', code: 'WH-MAIN', type: 'internal', is_active: true },
  { id: 'loc_prod', name: 'Production Assembly Floor', code: 'LOC-PROD', type: 'internal', is_active: true },
  { id: 'loc_rack_a', name: 'High-Bay Storage Rack A', code: 'RACK-A', type: 'internal', is_active: true },
  { id: 'loc_rack_b', name: 'Bulk Pallet Rack B', code: 'RACK-B', type: 'internal', is_active: true },
  { id: 'loc_north', name: 'North Yard Auxiliary Store', code: 'WH-NORTH', type: 'internal', is_active: true },
  { id: 'loc_vendor', name: 'External Vendor Receiving', code: 'LOC-VENDOR', type: 'vendor', is_active: true },
  { id: 'loc_cust', name: 'Outbound Customer Transit', code: 'LOC-CUST', type: 'customer', is_active: true },
  { id: 'loc_adj', name: 'Inventory Adjustment Ledger', code: 'LOC-ADJ', type: 'adjustment', is_active: true }
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod_01',
    sku: 'STL-ROD-50',
    name: 'Industrial Grade Steel Rods 50mm',
    category_id: 'cat_raw',
    uom: 'kg',
    barcode: '890100010001',
    initial_stock: 140,
    min_qty: 50,
    max_qty: 300,
    lead_time_days: 5,
    cost_price: 18.50,
    supplier: 'Apex Metallurgy Corp'
  },
  {
    id: 'prod_02',
    sku: 'ALU-SHEET-02',
    name: 'Aluminum Sheet Coil 2mm Aircraft Grade',
    category_id: 'cat_raw',
    uom: 'kg',
    barcode: '890100010002',
    initial_stock: 35,
    min_qty: 40,
    max_qty: 200,
    lead_time_days: 7,
    cost_price: 42.00,
    supplier: 'Vanguard Alloy Works'
  }
];

export const SEED_OPERATIONS: StockOperation[] = [
  {
    id: 'op_rec_01',
    code: 'REC-2026-001',
    type: 'receipt',
    status: 'done',
    partner: 'Apex Metallurgy Corp',
    source_location_id: 'loc_vendor',
    dest_location_id: 'loc_main',
    lines: [
      {
        id: 'ln_rec_01_1',
        product_id: 'prod_01',
        location_from: 'loc_vendor',
        location_to: 'loc_main',
        qty_expected: 100,
        qty_scanned: 100,
        scan_timestamp: '2026-09-20T10:15:00Z',
        scanned_by: 'Alex Vance',
        unit_cost: 18.50
      }
    ],
    created_at: '2026-09-20T09:30:00Z',
    created_by: 'Alex Vance',
    validated_at: '2026-09-20T10:15:00Z',
    validated_by: 'Alex Vance'
  }
];

export async function createSeedLedger(): Promise<StockLedgerEntry[]> {
  return [
    {
      id: 'ledg_001',
      product_id: 'prod_01',
      location_id: 'loc_main',
      qty_delta: 100,
      operation_type: 'Receipt',
      operation_code: 'REC-2026-001',
      timestamp: '2026-09-20T10:15:00Z',
      user_id: 'usr_mgr_01',
      user_name: 'Alex Vance',
      prev_hash: '0000000000000000000000000000000000000000000000000000000000000000',
      entry_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    }
  ];
}
