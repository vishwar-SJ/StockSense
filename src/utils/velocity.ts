import { Product, StockLedgerEntry, ProductStockPolicy } from '../types';

/**
 * Calculates velocity-based stock policy metrics for products using ledger outgoing data.
 */
export function calculateStockPolicies(
  products: Product[],
  ledger: StockLedgerEntry[],
  currentStockMap: Record<string, number> // product_id -> current total quantity
): ProductStockPolicy[] {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

  // Map product_id -> total outgoing quantity in last 30 days
  const outgoingQtyMap: Record<string, number> = {};

  ledger.forEach(entry => {
    // Outgoing operations are Delivery or Transfer (negative delta) or negative Adjustments
    if (entry.qty_delta < 0 && entry.timestamp >= thirtyDaysAgoIso) {
      const absQty = Math.abs(entry.qty_delta);
      outgoingQtyMap[entry.product_id] = (outgoingQtyMap[entry.product_id] || 0) + absQty;
    }
  });

  return products.map(product => {
    const totalCurrentStock = currentStockMap[product.id] ?? product.initial_stock;
    const total30DayOutgoing = outgoingQtyMap[product.id] || 0;
    
    // Average daily consumption over 30 days (default to baseline estimation if no recent sales)
    let avgDailyConsumption = parseFloat((total30DayOutgoing / 30).toFixed(2));
    
    // If ledger has minimal recent history, fallback to a sensible default consumption rate based on min_qty
    if (avgDailyConsumption === 0) {
      avgDailyConsumption = parseFloat((product.min_qty / 15).toFixed(2)) || 1.0;
    }

    const daysRemaining = avgDailyConsumption > 0 
      ? Math.floor(totalCurrentStock / avgDailyConsumption)
      : 999;

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysRemaining);
    const predictedStockoutDate = daysRemaining < 365 ? targetDate.toISOString().split('T')[0] : null;

    // At risk if days until stockout is less than or equal to supplier fulfillment lead time in days
    const isAtRisk = daysRemaining <= product.lead_time_days || totalCurrentStock <= product.min_qty;
    const suggestedReorderQty = Math.max(0, product.max_qty - totalCurrentStock);

    return {
      product_id: product.id,
      min_qty: product.min_qty,
      max_qty: product.max_qty,
      avg_daily_consumption: avgDailyConsumption,
      lead_time_days: product.lead_time_days,
      predicted_stockout_date: predictedStockoutDate,
      days_remaining: daysRemaining,
      is_at_risk: isAtRisk,
      suggested_reorder_qty: suggestedReorderQty
    };
  });
}
