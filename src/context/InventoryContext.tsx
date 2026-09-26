import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  User, UserRole, Product, ProductCategory, Location, 
  StockOperation, StockLedgerEntry, ProductStockPolicy, 
  StockMoveLine, OperationType, OperationStatus 
} from '../types';
import { loadInitialData, saveStorageData, STORAGE_KEYS } from '../services/storage';
import { calculateSHA256, buildLedgerPayload, verifyLedgerIntegrity } from '../utils/crypto';
import { calculateStockPolicies } from '../utils/velocity';

export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

interface InventoryContextType {
  user: User | null;
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;
  loginUser: (user: User) => void;
  logoutUser: () => void;
  
  products: Product[];
  categories: ProductCategory[];
  locations: Location[];
  operations: StockOperation[];
  ledger: StockLedgerEntry[];
  stockPolicies: ProductStockPolicy[];
  
  currentStockMap: Record<string, number>;
  stockByLocationMap: Record<string, Record<string, number>>;
  
  ledgerIntegrity: {
    isValid: boolean;
    totalEntries: number;
    brokenIndex?: number;
    brokenEntryId?: string;
    reason?: string;
  };
  
  verifyLedger: () => Promise<void>;
  simulateTamper: (entryIndex: number) => Promise<void>;
  repairLedgerHashes: () => Promise<void>;
  
  createProduct: (productData: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  
  createOperation: (opData: {
    type: OperationType;
    partner: string;
    source_location_id: string;
    dest_location_id: string;
    notes?: string;
    lines: Array<{
      product_id: string;
      qty_expected: number;
      unit_cost?: number;
    }>;
  }) => Promise<StockOperation>;
  
  validateOperation: (operationId: string) => Promise<boolean>;
  cancelOperation: (operationId: string) => void;
  scanMoveLineItem: (operationId: string, lineId: string, barcode: string) => { success: boolean; message: string; isComplete: boolean };
  approveAdjustment: (operationId: string, isApproved: boolean) => Promise<boolean>;
  autoDraftReorderReceipt: (productId: string) => Promise<StockOperation>;
  
  addCategory: (cat: Omit<ProductCategory, 'id'>) => void;
  addLocation: (loc: Omit<Location, 'id'>) => void;

  notifications: NotificationItem[];
  addNotification: (n: Omit<NotificationItem, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  
  // Scanner Modal Controller
  isScannerModalOpen: boolean;
  scannerTargetInfo: {
    operationId?: string;
    lineId?: string;
    expectedProductId?: string;
    title?: string;
  } | null;
  openScannerModal: (targetInfo?: { operationId?: string; lineId?: string; expectedProductId?: string; title?: string }, callback?: (barcode: string) => void) => void;
  closeScannerModal: () => void;
  onBarcodeScanned: (barcode: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('inventory_manager');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [operations, setOperations] = useState<StockOperation[]>([]);
  const [ledger, setLedger] = useState<StockLedgerEntry[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Scanner modal state
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [scannerTargetInfo, setScannerTargetInfo] = useState<{
    operationId?: string;
    lineId?: string;
    expectedProductId?: string;
    title?: string;
  } | null>(null);
  const [scanCallback, setScanCallback] = useState<((barcode: string) => void) | null>(null);

  // Ledger verification state
  const [ledgerIntegrity, setLedgerIntegrity] = useState<{
    isValid: boolean;
    totalEntries: number;
    brokenIndex?: number;
    brokenEntryId?: string;
    reason?: string;
  }>({ isValid: true, totalEntries: 0 });

  // Initial Load
  useEffect(() => {
    async function init() {
      const data = await loadInitialData();
      setUser(data.user);
      if (data.user) setActiveRole(data.user.role);
      setCategories(data.categories);
      setLocations(data.locations);
      setProducts(data.products);
      setOperations(data.operations);
      setLedger(data.ledger);
      
      const verification = await verifyLedgerIntegrity(data.ledger);
      setLedgerIntegrity(verification);
      setIsLoading(false);
    }
    init();
  }, []);

  // Compute live current stock per product and per location
  const { currentStockMap, stockByLocationMap } = useMemo(() => {
    const stockMap: Record<string, number> = {};
    const locMap: Record<string, Record<string, number>> = {};

    // Initialize with product base initial stocks
    products.forEach(p => {
      stockMap[p.id] = p.initial_stock;
      locMap[p.id] = { loc_main: p.initial_stock };
    });

    // Process all ledger transactions
    ledger.forEach(entry => {
      const pId = entry.product_id;
      if (!stockMap[pId]) stockMap[pId] = 0;
      if (!locMap[pId]) locMap[pId] = {};

      stockMap[pId] += entry.qty_delta;

      const locId = entry.location_id;
      locMap[pId][locId] = (locMap[pId][locId] || 0) + entry.qty_delta;
    });

    return { currentStockMap: stockMap, stockByLocationMap: locMap };
  }, [products, ledger]);

  // Compute predictive stock policies dynamically
  const stockPolicies = useMemo(() => {
    return calculateStockPolicies(products, ledger, currentStockMap);
  }, [products, ledger, currentStockMap]);

  // Notification helper
  const addNotification = (n: Omit<NotificationItem, 'id' | 'timestamp'>) => {
    const item: NotificationItem = {
      ...n,
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications(prev => [item, ...prev].slice(0, 10));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(item => item.id !== id));
  };

  // Auth actions
  const loginUser = (newUser: User) => {
    setUser(newUser);
    setActiveRole(newUser.role);
    saveStorageData(STORAGE_KEYS.USER, newUser);
    addNotification({ type: 'success', title: 'Welcome Back', message: `Logged in as ${newUser.name} (${newUser.role.replace('_', ' ').toUpperCase()})` });
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    addNotification({ type: 'info', title: 'Logged Out', message: 'You have been safely logged out.' });
  };

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      saveStorageData(STORAGE_KEYS.USER, updatedUser);
    }
    addNotification({ type: 'info', title: 'Role Switched', message: `Active workspace mode set to ${role.replace('_', ' ').toUpperCase()}` });
  };

  // Ledger verification & tamper actions
  const verifyLedger = async () => {
    const verification = await verifyLedgerIntegrity(ledger);
    setLedgerIntegrity(verification);
    if (verification.isValid) {
      addNotification({
        type: 'success',
        title: 'Cryptographic Ledger Verified',
        message: `All ${verification.totalEntries} block hashes are valid & tamper-free.`
      });
    } else {
      addNotification({
        type: 'error',
        title: 'Ledger Tamper Alert!',
        message: verification.reason || 'Cryptographic hash mismatch detected in ledger chain!'
      });
    }
  };

  const simulateTamper = async (entryIndex: number) => {
    if (entryIndex < 0 || entryIndex >= ledger.length) return;
    const modifiedLedger = [...ledger];
    const target = { ...modifiedLedger[entryIndex] };
    target.qty_delta = target.qty_delta + 999; // Alter quantity without updating hash chain
    modifiedLedger[entryIndex] = target;

    setLedger(modifiedLedger);
    saveStorageData(STORAGE_KEYS.LEDGER, modifiedLedger);

    const verification = await verifyLedgerIntegrity(modifiedLedger);
    setLedgerIntegrity(verification);
    addNotification({
      type: 'warning',
      title: 'Tampering Simulated',
      message: `Modified Entry #${entryIndex + 1} (${target.operation_code}) quantity by +999. Verification status updated!`
    });
  };

  const repairLedgerHashes = async () => {
    const GENESIS_PREV_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
    const repairedLedger: StockLedgerEntry[] = [];
    let prevHash = GENESIS_PREV_HASH;

    for (const entry of ledger) {
      const payload = buildLedgerPayload(prevHash, entry);
      const newHash = await calculateSHA256(payload);
      repairedLedger.push({
        ...entry,
        prev_hash: prevHash,
        entry_hash: newHash
      });
      prevHash = newHash;
    }

    setLedger(repairedLedger);
    saveStorageData(STORAGE_KEYS.LEDGER, repairedLedger);
    const verification = await verifyLedgerIntegrity(repairedLedger);
    setLedgerIntegrity(verification);
    addNotification({
      type: 'success',
      title: 'Ledger Hash Chain Repaired',
      message: 'Cryptographic hashes re-anchored successfully.'
    });
  };

  // Product Management
  const createProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const newProduct: Product = {
      ...productData,
      id: 'prod_' + Math.random().toString(36).substring(2, 9)
    };

    const updated = [newProduct, ...products];
    setProducts(updated);
    saveStorageData(STORAGE_KEYS.PRODUCTS, updated);

    // Write initial stock ledger entry if > 0
    if (newProduct.initial_stock > 0) {
      const GENESIS_PREV_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
      const prevHash = ledger.length > 0 ? ledger[ledger.length - 1].entry_hash : GENESIS_PREV_HASH;
      
      const rawLedger: Omit<StockLedgerEntry, 'prev_hash' | 'entry_hash'> = {
        id: 'ledg_' + Math.random().toString(36).substring(2, 9),
        product_id: newProduct.id,
        location_id: 'loc_main',
        qty_delta: newProduct.initial_stock,
        operation_type: 'Receipt',
        operation_code: `INIT-${newProduct.sku}`,
        timestamp: new Date().toISOString(),
        user_id: user?.id || 'usr_sys',
        user_name: user?.name || 'System Initializer'
      };

      const payload = buildLedgerPayload(prevHash, rawLedger);
      const entryHash = await calculateSHA256(payload);
      const newLedgerEntry: StockLedgerEntry = { ...rawLedger, prev_hash: prevHash, entry_hash: entryHash };

      const updatedLedger = [...ledger, newLedgerEntry];
      setLedger(updatedLedger);
      saveStorageData(STORAGE_KEYS.LEDGER, updatedLedger);
      const ver = await verifyLedgerIntegrity(updatedLedger);
      setLedgerIntegrity(ver);
    }

    addNotification({
      type: 'success',
      title: 'Product Created',
      message: `${newProduct.name} (${newProduct.sku}) added to catalog.`
    });

    return newProduct;
  };

  const updateProduct = (updatedProd: Product) => {
    const updated = products.map(p => p.id === updatedProd.id ? updatedProd : p);
    setProducts(updated);
    saveStorageData(STORAGE_KEYS.PRODUCTS, updated);
    addNotification({ type: 'info', title: 'Product Updated', message: `${updatedProd.name} details saved.` });
  };

  const deleteProduct = (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    setProducts(updated);
    saveStorageData(STORAGE_KEYS.PRODUCTS, updated);
    addNotification({ type: 'warning', title: 'Product Removed', message: 'Product removed from system catalog.' });
  };

  const addCategory = (catData: Omit<ProductCategory, 'id'>) => {
    const newCat = { ...catData, id: 'cat_' + Math.random().toString(36).substring(2, 9) };
    const updated = [...categories, newCat];
    setCategories(updated);
    saveStorageData(STORAGE_KEYS.CATEGORIES, updated);
    addNotification({ type: 'success', title: 'Category Added', message: `Category ${newCat.name} created.` });
  };

  const addLocation = (locData: Omit<Location, 'id'>) => {
    const newLoc = { ...locData, id: 'loc_' + Math.random().toString(36).substring(2, 9) };
    const updated = [...locations, newLoc];
    setLocations(updated);
    saveStorageData(STORAGE_KEYS.LOCATIONS, updated);
    addNotification({ type: 'success', title: 'Location Added', message: `Location ${newLoc.name} (${newLoc.code}) registered.` });
  };

  // Operations Workflows
  const createOperation = async (opData: {
    type: OperationType;
    partner: string;
    source_location_id: string;
    dest_location_id: string;
    notes?: string;
    lines: Array<{
      product_id: string;
      qty_expected: number;
      unit_cost?: number;
    }>;
  }): Promise<StockOperation> => {
    const prefixMap: Record<OperationType, string> = {
      receipt: 'REC',
      delivery: 'DEL',
      internal: 'INT',
      adjustment: 'ADJ'
    };
    const seq = String(operations.length + 1).padStart(3, '0');
    const code = `${prefixMap[opData.type]}-2026-${seq}`;

    // Check if high-value adjustment
    let requiresDualApproval = false;
    if (opData.type === 'adjustment') {
      let totalCost = 0;
      opData.lines.forEach(l => {
        const prod = products.find(p => p.id === l.product_id);
        totalCost += (prod?.cost_price || 0) * Math.abs(l.qty_expected);
      });
      if (totalCost > 200 || opData.lines.some(l => Math.abs(l.qty_expected) >= 10)) {
        requiresDualApproval = true;
      }
    }

    const lines: StockMoveLine[] = opData.lines.map((l, i) => ({
      id: `ln_${code}_${i + 1}`,
      product_id: l.product_id,
      location_from: opData.source_location_id,
      location_to: opData.dest_location_id,
      qty_expected: l.qty_expected,
      qty_scanned: 0,
      scan_timestamp: null,
      scanned_by: null,
      unit_cost: l.unit_cost
    }));

    const newOp: StockOperation = {
      id: 'op_' + Math.random().toString(36).substring(2, 9),
      code,
      type: opData.type,
      status: 'ready',
      partner: opData.partner,
      source_location_id: opData.source_location_id,
      dest_location_id: opData.dest_location_id,
      lines,
      created_at: new Date().toISOString(),
      created_by: user?.name || 'System Operator',
      notes: opData.notes,
      requires_dual_approval: requiresDualApproval,
      approval_status: requiresDualApproval ? 'pending' : 'none'
    };

    const updated = [newOp, ...operations];
    setOperations(updated);
    saveStorageData(STORAGE_KEYS.OPERATIONS, updated);

    addNotification({
      type: 'success',
      title: `${opData.type.toUpperCase()} Created`,
      message: `Document ${code} initialized in Ready status.`
    });

    return newOp;
  };

  // Barcode scanning line validation
  const scanMoveLineItem = (operationId: string, lineId: string, scannedBarcode: string) => {
    const op = operations.find(o => o.id === operationId);
    if (!op) return { success: false, message: 'Operation not found', isComplete: false };

    const line = op.lines.find(l => l.id === lineId);
    if (!line) return { success: false, message: 'Line item not found', isComplete: false };

    const targetProduct = products.find(p => p.id === line.product_id);
    if (!targetProduct) return { success: false, message: 'Product not found', isComplete: false };

    // Strict Barcode Mispick Prevention for Delivery Orders & Receipts
    if (targetProduct.barcode.trim().toLowerCase() !== scannedBarcode.trim().toLowerCase()) {
      addNotification({
        type: 'error',
        title: 'MISPICK ALERT! Barcode Mismatch',
        message: `Scanned code "${scannedBarcode}" does NOT match expected product ${targetProduct.name} (${targetProduct.sku}). Pick blocked!`
      });
      return {
        success: false,
        message: `BARCODE MISMATCH! Scanned: ${scannedBarcode} | Expected: ${targetProduct.barcode} (${targetProduct.name})`,
        isComplete: false
      };
    }

    // Barcode matched correctly!
    const newQtyScanned = Math.min(line.qty_expected, line.qty_scanned + 1);
    const isLineDone = newQtyScanned >= line.qty_expected;

    const updatedOperations = operations.map(o => {
      if (o.id !== operationId) return o;
      const updatedLines = o.lines.map(l => {
        if (l.id !== lineId) return l;
        return {
          ...l,
          qty_scanned: newQtyScanned,
          scan_timestamp: new Date().toISOString(),
          scanned_by: user?.name || 'Warehouse Staff'
        };
      });
      return { ...o, lines: updatedLines };
    });

    setOperations(updatedOperations);
    saveStorageData(STORAGE_KEYS.OPERATIONS, updatedOperations);

    addNotification({
      type: 'success',
      title: 'Barcode Scanned',
      message: `Verified 1 unit of ${targetProduct.name}. Scanned: ${newQtyScanned}/${line.qty_expected}`
    });

    return {
      success: true,
      message: `Verified 1x ${targetProduct.name}. (${newQtyScanned}/${line.qty_expected})`,
      isComplete: isLineDone
    };
  };

  // Validate Operation (Applies stock changes & generates Tamper-Evident Ledger Entries)
  const validateOperation = async (operationId: string): Promise<boolean> => {
    const op = operations.find(o => o.id === operationId);
    if (!op) return false;

    if (op.status === 'done') {
      addNotification({ type: 'warning', title: 'Already Processed', message: 'This document has already been validated.' });
      return false;
    }

    if (op.requires_dual_approval && op.approval_status !== 'approved') {
      addNotification({
        type: 'error',
        title: 'Dual Approval Required',
        message: `Adjustment ${op.code} requires Inventory Manager approval before validation.`
      });
      return false;
    }

    const GENESIS_PREV_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
    let currentPrevHash = ledger.length > 0 ? ledger[ledger.length - 1].entry_hash : GENESIS_PREV_HASH;
    const newLedgerEntries: StockLedgerEntry[] = [];

    // For each line, compute stock delta and generate chained ledger entries
    for (const line of op.lines) {
      const qtyToApply = line.qty_scanned > 0 ? line.qty_scanned : line.qty_expected;
      let sourceDelta = 0;
      let destDelta = 0;

      if (op.type === 'receipt') {
        destDelta = qtyToApply;
      } else if (op.type === 'delivery') {
        sourceDelta = -qtyToApply;
      } else if (op.type === 'internal') {
        sourceDelta = -qtyToApply;
        destDelta = qtyToApply;
      } else if (op.type === 'adjustment') {
        // Source delta is the adjustment difference
        destDelta = qtyToApply;
      }

      // Entry 1 for source location if delta != 0
      if (sourceDelta !== 0) {
        const rawEntry: Omit<StockLedgerEntry, 'prev_hash' | 'entry_hash'> = {
          id: 'ledg_' + Math.random().toString(36).substring(2, 9),
          product_id: line.product_id,
          location_id: op.source_location_id,
          qty_delta: sourceDelta,
          operation_type: (op.type.charAt(0).toUpperCase() + op.type.slice(1)) as any,
          operation_code: op.code,
          timestamp: new Date().toISOString(),
          user_id: user?.id || 'usr_sys',
          user_name: user?.name || 'Warehouse Staff'
        };
        const payload = buildLedgerPayload(currentPrevHash, rawEntry);
        const entryHash = await calculateSHA256(payload);
        const fullEntry = { ...rawEntry, prev_hash: currentPrevHash, entry_hash: entryHash };
        newLedgerEntries.push(fullEntry);
        currentPrevHash = entryHash;
      }

      // Entry 2 for dest location if delta != 0
      if (destDelta !== 0) {
        const rawEntry: Omit<StockLedgerEntry, 'prev_hash' | 'entry_hash'> = {
          id: 'ledg_' + Math.random().toString(36).substring(2, 9),
          product_id: line.product_id,
          location_id: op.dest_location_id,
          qty_delta: destDelta,
          operation_type: (op.type.charAt(0).toUpperCase() + op.type.slice(1)) as any,
          operation_code: op.code,
          timestamp: new Date().toISOString(),
          user_id: user?.id || 'usr_sys',
          user_name: user?.name || 'Warehouse Staff'
        };
        const payload = buildLedgerPayload(currentPrevHash, rawEntry);
        const entryHash = await calculateSHA256(payload);
        const fullEntry = { ...rawEntry, prev_hash: currentPrevHash, entry_hash: entryHash };
        newLedgerEntries.push(fullEntry);
        currentPrevHash = entryHash;
      }
    }

    const updatedLedger = [...ledger, ...newLedgerEntries];
    setLedger(updatedLedger);
    saveStorageData(STORAGE_KEYS.LEDGER, updatedLedger);

    const ver = await verifyLedgerIntegrity(updatedLedger);
    setLedgerIntegrity(ver);

    // Update Operation status to Done
    const updatedOps = operations.map(o => {
      if (o.id === operationId) {
        return {
          ...o,
          status: 'done' as OperationStatus,
          validated_at: new Date().toISOString(),
          validated_by: user?.name || 'Warehouse Staff'
        };
      }
      return o;
    });

    setOperations(updatedOps);
    saveStorageData(STORAGE_KEYS.OPERATIONS, updatedOps);

    addNotification({
      type: 'success',
      title: 'Document Validated!',
      message: `${op.code} validated. Stock updated live and cryptographic ledger entry appended.`
    });

    return true;
  };

  const cancelOperation = (operationId: string) => {
    const updated = operations.map(o => o.id === operationId ? { ...o, status: 'canceled' as OperationStatus } : o);
    setOperations(updated);
    saveStorageData(STORAGE_KEYS.OPERATIONS, updated);
    addNotification({ type: 'info', title: 'Document Canceled', message: 'Stock movement canceled.' });
  };

  const approveAdjustment = async (operationId: string, isApproved: boolean): Promise<boolean> => {
    const updatedOps = operations.map(o => {
      if (o.id === operationId) {
        return {
          ...o,
          approval_status: (isApproved ? 'approved' : 'rejected') as any,
          approved_by: user?.name || 'Inventory Manager'
        };
      }
      return o;
    });

    setOperations(updatedOps);
    saveStorageData(STORAGE_KEYS.OPERATIONS, updatedOps);

    addNotification({
      type: isApproved ? 'success' : 'warning',
      title: isApproved ? 'Adjustment Approved' : 'Adjustment Rejected',
      message: `Adjustment ${isApproved ? 'approved for stock ledger posting' : 'rejected by manager'}.`
    });

    return true;
  };

  // Predictive Auto-Draft Receipt for At-Risk Products
  const autoDraftReorderReceipt = async (productId: string): Promise<StockOperation> => {
    const prod = products.find(p => p.id === productId);
    const policy = stockPolicies.find(sp => sp.product_id === productId);
    const reorderQty = policy ? policy.suggested_reorder_qty : (prod ? prod.max_qty - prod.initial_stock : 50);

    const newOp = await createOperation({
      type: 'receipt',
      partner: prod?.supplier || 'Primary Vendor',
      source_location_id: 'loc_vendor',
      dest_location_id: 'loc_main',
      notes: `Auto-drafted by Predictive Low-Stock Engine based on rolling 30-day consumption velocity (Lead time: ${prod?.lead_time_days || 5} days).`,
      lines: [
        {
          product_id: productId,
          qty_expected: Math.max(reorderQty, 10),
          unit_cost: prod?.cost_price
        }
      ]
    });

    addNotification({
      type: 'success',
      title: 'Reorder Draft Created',
      message: `Receipt draft ${newOp.code} generated for ${prod?.name} (${reorderQty} ${prod?.uom}).`
    });

    return newOp;
  };

  // Scanner modal methods
  const openScannerModal = (
    targetInfo?: { operationId?: string; lineId?: string; expectedProductId?: string; title?: string },
    callback?: (barcode: string) => void
  ) => {
    setScannerTargetInfo(targetInfo || null);
    if (callback) setScanCallback(() => callback);
    else setScanCallback(null);
    setIsScannerModalOpen(true);
  };

  const closeScannerModal = () => {
    setIsScannerModalOpen(false);
    setScannerTargetInfo(null);
    setScanCallback(null);
  };

  const onBarcodeScanned = (barcode: string) => {
    if (scanCallback) {
      scanCallback(barcode);
    } else if (scannerTargetInfo?.operationId && scannerTargetInfo?.lineId) {
      scanMoveLineItem(scannerTargetInfo.operationId, scannerTargetInfo.lineId, barcode);
    } else {
      // General barcode lookup notification
      const matched = products.find(p => p.barcode.toLowerCase() === barcode.toLowerCase() || p.sku.toLowerCase() === barcode.toLowerCase());
      if (matched) {
        addNotification({
          type: 'info',
          title: 'Product Scanned',
          message: `Found: ${matched.name} | SKU: ${matched.sku} | In Stock: ${currentStockMap[matched.id] || 0} ${matched.uom}`
        });
      } else {
        addNotification({
          type: 'warning',
          title: 'Unknown Barcode Scanned',
          message: `Barcode "${barcode}" is not registered in the system.`
        });
      }
    }
  };

  return (
    <InventoryContext.Provider value={{
      user,
      activeRole,
      switchRole,
      loginUser,
      logoutUser,
      products,
      categories,
      locations,
      operations,
      ledger,
      stockPolicies,
      currentStockMap,
      stockByLocationMap,
      ledgerIntegrity,
      verifyLedger,
      simulateTamper,
      repairLedgerHashes,
      createProduct,
      updateProduct,
      deleteProduct,
      createOperation,
      validateOperation,
      cancelOperation,
      scanMoveLineItem,
      approveAdjustment,
      autoDraftReorderReceipt,
      addCategory,
      addLocation,
      notifications,
      addNotification,
      removeNotification,
      isScannerModalOpen,
      scannerTargetInfo,
      openScannerModal,
      closeScannerModal,
      onBarcodeScanned
    }}>
      {!isLoading && children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within an InventoryProvider');
  return ctx;
};
