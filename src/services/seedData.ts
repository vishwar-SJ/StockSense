import { Product, Location, ProductCategory, StockOperation, StockLedgerEntry, User } from '../types';
import { calculateSHA256, buildLedgerPayload } from '../utils/crypto';

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
    initial_stock: 35, // Low stock / at risk (min 40, lead 7 days)
    min_qty: 40,
    max_qty: 200,
    lead_time_days: 7,
    cost_price: 42.00,
    supplier: 'Vanguard Alloy Works'
  },
  {
    id: 'prod_03',
    sku: 'PNEU-CYL-100',
    name: 'Heavy Duty Pneumatic Cylinder 100mm',
    category_id: 'cat_comp',
    uom: 'pcs',
    barcode: '890100010003',
    initial_stock: 85,
    min_qty: 25,
    max_qty: 150,
    lead_time_days: 4,
    cost_price: 125.00,
    supplier: 'FluidTech Automation'
  },
  {
    id: 'prod_04',
    sku: 'CHR-ERG-EVO',
    name: 'Ergonomic Task Chair Mesh Frame',
    category_id: 'cat_finish',
    uom: 'pcs',
    barcode: '890100010004',
    initial_stock: 18, // At risk (min 20, lead 6 days)
    min_qty: 20,
    max_qty: 80,
    lead_time_days: 6,
    cost_price: 210.00,
    supplier: 'Matrix Office Systems'
  },
  {
    id: 'prod_05',
    sku: 'CBL-CAT6A-500',
    name: 'Shielded Copper Cable Spool 500m',
    category_id: 'cat_elec',
    uom: 'rolls',
    barcode: '890100010005',
    initial_stock: 62,
    min_qty: 15,
    max_qty: 100,
    lead_time_days: 3,
    cost_price: 145.00,
    supplier: 'NexWave Fiber & Cable'
  },
  {
    id: 'prod_06',
    sku: 'HYD-FLUID-46',
    name: 'ISO VG 46 Anti-Wear Hydraulic Oil',
    category_id: 'cat_mro',
    uom: 'liters',
    barcode: '890100010006',
    initial_stock: 420,
    min_qty: 100,
    max_qty: 800,
    lead_time_days: 4,
    cost_price: 8.75,
    supplier: 'PetroShield Lubricants'
  },
  {
    id: 'prod_07',
    sku: 'BRG-SKF-6208',
    name: 'SKF 6208 Deep Groove Ball Bearing',
    category_id: 'cat_comp',
    uom: 'pcs',
    barcode: '890100010007',
    initial_stock: 12, // Critical low stock (min 30, lead 8 days)
    min_qty: 30,
    max_qty: 250,
    lead_time_days: 8,
    cost_price: 34.00,
    supplier: 'Precision Motion Bearings'
  },
  {
    id: 'prod_08',
    sku: 'SF-HELMET-PRO',
    name: 'Vented Safety Hard Hat with Visor',
    category_id: 'cat_mro',
    uom: 'pcs',
    barcode: '890100010008',
    initial_stock: 110,
    min_qty: 35,
    max_qty: 200,
    lead_time_days: 3,
    cost_price: 28.50,
    supplier: 'Guardian Safety Armor'
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
    validated_by: 'Alex Vance',
    notes: 'Bulk stock delivery received cleanly via Truck 4.'
  },
  {
    id: 'op_del_01',
    code: 'DEL-2026-001',
    type: 'delivery',
    status: 'done',
    partner: 'Titan Heavy Machinery Sales',
    source_location_id: 'loc_main',
    dest_location_id: 'loc_cust',
    lines: [
      {
        id: 'ln_del_01_1',
        product_id: 'prod_04',
        location_from: 'loc_main',
        location_to: 'loc_cust',
        qty_expected: 10,
        qty_scanned: 10,
        scan_timestamp: '2026-09-22T14:20:00Z',
        scanned_by: 'Marcus Wright',
        unit_cost: 210.00
      }
    ],
    created_at: '2026-09-22T11:00:00Z',
    created_by: 'Marcus Wright',
    validated_at: '2026-09-22T14:20:00Z',
    validated_by: 'Marcus Wright',
    notes: 'Dispatched 10 task chairs for commercial order #8841.'
  },
  {
    id: 'op_int_01',
    code: 'INT-2026-001',
    type: 'internal',
    status: 'done',
    partner: 'Internal Transfer',
    source_location_id: 'loc_main',
    dest_location_id: 'loc_prod',
    lines: [
      {
        id: 'ln_int_01_1',
        product_id: 'prod_01',
        location_from: 'loc_main',
        location_to: 'loc_prod',
        qty_expected: 40,
        qty_scanned: 40,
        scan_timestamp: '2026-09-23T08:45:00Z',
        scanned_by: 'Marcus Wright'
      }
    ],
    created_at: '2026-09-23T08:00:00Z',
    created_by: 'Marcus Wright',
    validated_at: '2026-09-23T08:45:00Z',
    validated_by: 'Marcus Wright',
    notes: 'Moved 40kg steel rods to production floor rack.'
  },
  {
    id: 'op_adj_01',
    code: 'ADJ-2026-001',
    type: 'adjustment',
    status: 'done',
    partner: 'Internal Inventory Audit',
    source_location_id: 'loc_main',
    dest_location_id: 'loc_adj',
    lines: [
      {
        id: 'ln_adj_01_1',
        product_id: 'prod_02',
        location_from: 'loc_main',
        location_to: 'loc_adj',
        qty_expected: 38,
        qty_scanned: 35, // -3 damage adjustment
        scan_timestamp: '2026-09-24T16:00:00Z',
        scanned_by: 'Alex Vance'
      }
    ],
    created_at: '2026-09-24T15:30:00Z',
    created_by: 'Alex Vance',
    validated_at: '2026-09-24T16:00:00Z',
    validated_by: 'Alex Vance',
    notes: 'Damaged 3kg aluminum coils discarded during monthly physical count.',
    requires_dual_approval: false,
    approval_status: 'approved',
    approved_by: 'Alex Vance'
  },
  {
    id: 'op_rec_pending',
    code: 'REC-2026-002',
    type: 'receipt',
    status: 'ready',
    partner: 'Precision Motion Bearings',
    source_location_id: 'loc_vendor',
    dest_location_id: 'loc_main',
    lines: [
      {
        id: 'ln_rec_02_1',
        product_id: 'prod_07',
        location_from: 'loc_vendor',
        location_to: 'loc_main',
        qty_expected: 50,
        qty_scanned: 0,
        scan_timestamp: null,
        scanned_by: null,
        unit_cost: 34.00
      }
    ],
    created_at: '2026-09-25T11:00:00Z',
    created_by: 'Alex Vance',
    notes: 'Urgent restocking order for ball bearings arriving today.'
  },
  {
    id: 'op_del_pending',
    code: 'DEL-2026-002',
    type: 'delivery',
    status: 'ready',
    partner: 'Apex Industrial Solutions',
    source_location_id: 'loc_main',
    dest_location_id: 'loc_cust',
    lines: [
      {
        id: 'ln_del_02_1',
        product_id: 'prod_03',
        location_from: 'loc_main',
        location_to: 'loc_cust',
        qty_expected: 15,
        qty_scanned: 0,
        scan_timestamp: null,
        scanned_by: null
      }
    ],
    created_at: '2026-09-26T09:00:00Z',
    created_by: 'Alex Vance',
    notes: 'Pneumatic cylinder shipment waiting for picking verification.'
  },
  {
    id: 'op_int_pending',
    code: 'INT-2026-002',
    type: 'internal',
    status: 'waiting',
    partner: 'Internal Transfer',
    source_location_id: 'loc_main',
    dest_location_id: 'loc_rack_a',
    lines: [
      {
        id: 'ln_int_02_1',
        product_id: 'prod_06',
        location_from: 'loc_main',
        location_to: 'loc_rack_a',
        qty_expected: 150,
        qty_scanned: 0,
        scan_timestamp: null,
        scanned_by: null
      }
    ],
    created_at: '2026-09-26T10:30:00Z',
    created_by: 'Marcus Wright',
    notes: 'Scheduled transfer of hydraulic fluid to Rack A.'
  }
];

export async function createSeedLedger(): Promise<StockLedgerEntry[]> {
  const GENESIS_PREV_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

  const rawEntries: Omit<StockLedgerEntry, 'prev_hash' | 'entry_hash'>[] = [
    {
      id: 'ledg_001',
      product_id: 'prod_01',
      location_id: 'loc_main',
      qty_delta: 100,
      operation_type: 'Receipt',
      operation_code: 'REC-2026-001',
      timestamp: '2026-09-20T10:15:00Z',
      user_id: 'usr_mgr_01',
      user_name: 'Alex Vance'
    },
    {
      id: 'ledg_002',
      product_id: 'prod_04',
      location_id: 'loc_main',
      qty_delta: -10,
      operation_type: 'Delivery',
      operation_code: 'DEL-2026-001',
      timestamp: '2026-09-22T14:20:00Z',
      user_id: 'usr_staff_01',
      user_name: 'Marcus Wright'
    },
    {
      id: 'ledg_003',
      product_id: 'prod_01',
      location_id: 'loc_prod',
      qty_delta: 40,
      operation_type: 'Transfer',
      operation_code: 'INT-2026-001',
      timestamp: '2026-09-23T08:45:00Z',
      user_id: 'usr_staff_01',
      user_name: 'Marcus Wright'
    },
    {
      id: 'ledg_004',
      product_id: 'prod_02',
      location_id: 'loc_main',
      qty_delta: -3,
      operation_type: 'Adjustment',
      operation_code: 'ADJ-2026-001',
      timestamp: '2026-09-24T16:00:00Z',
      user_id: 'usr_mgr_01',
      user_name: 'Alex Vance'
    }
  ];

  const ledger: StockLedgerEntry[] = [];
  let prevHash = GENESIS_PREV_HASH;

  for (const raw of rawEntries) {
    const payload = buildLedgerPayload(prevHash, raw);
    const entryHash = await calculateSHA256(payload);
    const fullEntry: StockLedgerEntry = {
      ...raw,
      prev_hash: prevHash,
      entry_hash: entryHash
    };
    ledger.push(fullEntry);
    prevHash = entryHash;
  }

  return ledger;
}
