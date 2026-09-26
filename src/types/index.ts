export type UserRole = 'inventory_manager' | 'warehouse_staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department: string;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  type: 'internal' | 'vendor' | 'customer' | 'adjustment';
  is_active: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category_id: string;
  uom: 'pcs' | 'kg' | 'meters' | 'boxes' | 'liters' | 'units' | 'rolls';
  barcode: string; // Unique, indexed
  initial_stock: number;
  min_qty: number;
  max_qty: number;
  lead_time_days: number;
  cost_price: number;
  supplier: string;
  image_url?: string;
}

export interface ProductStockPolicy {
  product_id: string;
  location_id?: string;
  min_qty: number;
  max_qty: number;
  avg_daily_consumption: number; // Rolling 30-day average
  lead_time_days: number;
  predicted_stockout_date: string | null; // Derived ISO date
  days_remaining: number; // Derived days until depletion
  is_at_risk: boolean; // True if days_remaining <= lead_time_days
  suggested_reorder_qty: number;
}

export interface StockMoveLine {
  id: string;
  product_id: string;
  location_from: string;
  location_to: string;
  qty_expected: number;
  qty_scanned: number;
  scan_timestamp: string | null;
  scanned_by: string | null;
  unit_cost?: number;
}

export type OperationType = 'receipt' | 'delivery' | 'internal' | 'adjustment';
export type OperationStatus = 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';
export type DualApprovalStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface StockOperation {
  id: string;
  code: string; // e.g. REC-2026-001, DEL-2026-042
  type: OperationType;
  status: OperationStatus;
  partner: string; // Vendor name for Receipts, Customer for Delivery
  source_location_id: string;
  dest_location_id: string;
  lines: StockMoveLine[];
  created_at: string;
  created_by: string;
  validated_at?: string;
  validated_by?: string;
  notes?: string;
  // High-value adjustment approval
  requires_dual_approval?: boolean;
  approval_status?: DualApprovalStatus;
  approved_by?: string;
}

export interface StockLedgerEntry {
  id: string;
  product_id: string;
  location_id: string;
  qty_delta: number;
  operation_type: 'Receipt' | 'Delivery' | 'Transfer' | 'Adjustment';
  operation_code: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  prev_hash: string;
  entry_hash: string;
}

export interface DashboardKPIs {
  totalProductsCount: number;
  totalStockQuantity: number;
  atRiskProductsCount: number;
  pendingReceiptsCount: number;
  pendingDeliveriesCount: number;
  scheduledTransfersCount: number;
  totalStockValue: number;
}

export interface OperationsFilter {
  type: 'all' | OperationType;
  status: 'all' | OperationStatus;
  location_id: string;
  category_id: string;
  search_query: string;
}
