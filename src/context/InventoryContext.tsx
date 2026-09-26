import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  User, UserRole, Product, ProductCategory, Location, 
  StockOperation, StockLedgerEntry, ProductStockPolicy, 
  StockMoveLine, OperationType, OperationStatus 
} from '../types';
import { loadInitialData, saveStorageData, STORAGE_KEYS } from '../services/storage';

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
  
  createOperation: (opData: any) => Promise<StockOperation>;
  validateOperation: (operationId: string) => Promise<boolean>;
  cancelOperation: (operationId: string) => void;
  scanMoveLineItem: (operationId: string, lineId: string, barcode: string) => any;
  approveAdjustment: (operationId: string, isApproved: boolean) => Promise<boolean>;
  autoDraftReorderReceipt: (productId: string) => Promise<StockOperation>;
  
  addCategory: (cat: Omit<ProductCategory, 'id'>) => void;
  addLocation: (loc: Omit<Location, 'id'>) => void;

  notifications: NotificationItem[];
  addNotification: (n: Omit<NotificationItem, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  
  isScannerModalOpen: boolean;
  scannerTargetInfo: any;
  openScannerModal: (targetInfo?: any, callback?: any) => void;
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
      setIsLoading(false);
    }
    init();
  }, []);

  const { currentStockMap, stockByLocationMap } = useMemo(() => {
    const stockMap: Record<string, number> = {};
    const locMap: Record<string, Record<string, number>> = {};
    products.forEach(p => {
      stockMap[p.id] = p.initial_stock;
      locMap[p.id] = { loc_main: p.initial_stock };
    });
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

  const stockPolicies = useMemo(() => {
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
  }, [products, currentStockMap]);

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

  const loginUser = (newUser: User) => {
    setUser(newUser);
    setActiveRole(newUser.role);
    saveStorageData(STORAGE_KEYS.USER, newUser);
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      saveStorageData(STORAGE_KEYS.USER, updatedUser);
    }
  };

  const verifyLedger = async () => {};
  const simulateTamper = async () => {};
  const repairLedgerHashes = async () => {};

  const createProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const newProduct: Product = { ...productData, id: 'prod_' + Math.random().toString(36).substring(2, 9) };
    const updated = [newProduct, ...products];
    setProducts(updated);
    saveStorageData(STORAGE_KEYS.PRODUCTS, updated);
    return newProduct;
  };

  const updateProduct = (updatedProd: Product) => {
    const updated = products.map(p => p.id === updatedProd.id ? updatedProd : p);
    setProducts(updated);
    saveStorageData(STORAGE_KEYS.PRODUCTS, updated);
  };

  const deleteProduct = (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    setProducts(updated);
    saveStorageData(STORAGE_KEYS.PRODUCTS, updated);
  };

  const addCategory = (catData: Omit<ProductCategory, 'id'>) => {
    const newCat = { ...catData, id: 'cat_' + Math.random().toString(36).substring(2, 9) };
    setCategories([...categories, newCat]);
  };

  const addLocation = (locData: Omit<Location, 'id'>) => {
    const newLoc = { ...locData, id: 'loc_' + Math.random().toString(36).substring(2, 9) };
    setLocations([...locations, newLoc]);
  };

  const createOperation = async (opData: any): Promise<StockOperation> => {
    const newOp: StockOperation = {
      id: 'op_' + Math.random().toString(36).substring(2, 9),
      code: 'OP-2026-001',
      type: opData.type,
      status: 'ready',
      partner: opData.partner,
      source_location_id: opData.source_location_id,
      dest_location_id: opData.dest_location_id,
      lines: [],
      created_at: new Date().toISOString(),
      created_by: user?.name || 'System Operator'
    };
    setOperations([newOp, ...operations]);
    return newOp;
  };

  const validateOperation = async () => true;
  const cancelOperation = () => {};
  const scanMoveLineItem = () => ({ success: true, message: 'Scanned', isComplete: true });
  const approveAdjustment = async () => true;
  const autoDraftReorderReceipt = async (productId: string) => createOperation({ type: 'receipt', partner: 'Vendor' });

  return (
    <InventoryContext.Provider value={{
      user, activeRole, switchRole, loginUser, logoutUser,
      products, categories, locations, operations, ledger, stockPolicies,
      currentStockMap, stockByLocationMap,
      ledgerIntegrity: { isValid: true, totalEntries: ledger.length },
      verifyLedger, simulateTamper, repairLedgerHashes,
      createProduct, updateProduct, deleteProduct, createOperation, validateOperation,
      cancelOperation, scanMoveLineItem, approveAdjustment, autoDraftReorderReceipt,
      addCategory, addLocation, notifications, addNotification, removeNotification,
      isScannerModalOpen: false, scannerTargetInfo: null,
      openScannerModal: () => {}, closeScannerModal: () => {}, onBarcodeScanned: () => {}
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
