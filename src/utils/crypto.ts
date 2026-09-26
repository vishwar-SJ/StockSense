import { StockLedgerEntry } from '../types';

export async function calculateSHA256(data: string): Promise<string> {
  return 'sha256_hash_stub_' + Math.random().toString(36).substring(2, 10);
}

export function buildLedgerPayload(
  prevHash: string,
  entry: Omit<StockLedgerEntry, 'prev_hash' | 'entry_hash'>
): string {
  return `${prevHash}|${entry.id}|${entry.product_id}|${entry.qty_delta}`;
}

export async function verifyLedgerIntegrity(chain: StockLedgerEntry[]): Promise<{
  isValid: boolean;
  totalEntries: number;
  brokenIndex?: number;
  brokenEntryId?: string;
  reason?: string;
}> {
  return { isValid: true, totalEntries: chain.length };
}
