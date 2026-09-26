import { Product, StockLedgerEntry, ProductStockPolicy } from '../types';

export function calculateStockPolicies(
  products: Product[],
  ledger: StockLedgerEntry[],
  currentStockMap: Record<string, number>
): ProductStockPolicy[] {
  return products.map(p => ({
    product_id: p.id,
    min_qty: p.min_qty,
    max_qty: p.max_qty,
    avg_daily_consumption: 1.0,
    lead_time_days: p.lead_time_days,
    predicted_stockout_date: null,
    days_remaining: 30,
    is_at_risk: (currentStockMap[p.id] ?? p.initial_stock) <= p.min_qty,
    suggested_reorder_qty: Math.max(0, p.max_qty - (currentStockMap[p.id] ?? p.initial_stock))
  }));
}
