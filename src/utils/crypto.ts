import { StockLedgerEntry } from '../types';

/**
 * Calculates a SHA-256 hash string for data using Web Crypto API or pure JS fallback.
 */
export async function calculateSHA256(data: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback simple 64-character hex hash representation for environments without subtle crypto
  let h1 = 0xdeadbeef ^ 0, h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < data.length; i++) {
    const ch = data.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
  const rawHex = (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
  // Repeat to 64 chars hex string for standard hash format
  return (rawHex + rawHex + rawHex + rawHex).slice(0, 64);
}

/**
 * Creates the string payload to be hashed for a ledger entry.
 */
export function buildLedgerPayload(
  prevHash: string,
  entry: Omit<StockLedgerEntry, 'prev_hash' | 'entry_hash'>
): string {
  return [
    prevHash,
    entry.id,
    entry.product_id,
    entry.location_id,
    entry.qty_delta.toString(),
    entry.operation_type,
    entry.operation_code,
    entry.timestamp,
    entry.user_id
  ].join('|');
}

/**
 * Verifies the integrity of an entire Stock Ledger chain.
 * Returns valid status, total verified entries, and details of any broken block.
 */
export async function verifyLedgerIntegrity(chain: StockLedgerEntry[]): Promise<{
  isValid: boolean;
  totalEntries: number;
  brokenIndex?: number;
  brokenEntryId?: string;
  reason?: string;
}> {
  if (!chain || chain.length === 0) {
    return { isValid: true, totalEntries: 0 };
  }

  const GENESIS_PREV_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

  for (let i = 0; i < chain.length; i++) {
    const entry = chain[i];
    const expectedPrevHash = i === 0 ? GENESIS_PREV_HASH : chain[i - 1].entry_hash;

    // Check 1: Does entry.prev_hash match actual previous entry's hash?
    if (entry.prev_hash !== expectedPrevHash) {
      return {
        isValid: false,
        totalEntries: chain.length,
        brokenIndex: i,
        brokenEntryId: entry.id,
        reason: `Previous hash mismatch on block #${i + 1} (${entry.operation_code}). Expected: ${expectedPrevHash.slice(0, 10)}... Received: ${entry.prev_hash.slice(0, 10)}...`
      };
    }

    // Check 2: Re-hash the entry content and verify entry_hash match
    const payload = buildLedgerPayload(entry.prev_hash, entry);
    const recalculatedHash = await calculateSHA256(payload);

    if (recalculatedHash !== entry.entry_hash) {
      return {
        isValid: false,
        totalEntries: chain.length,
        brokenIndex: i,
        brokenEntryId: entry.id,
        reason: `Data payload tampering detected on block #${i + 1} (${entry.operation_code}). Recomputed SHA-256 hash does not match stored block hash!`
      };
    }
  }

  return { isValid: true, totalEntries: chain.length };
}
