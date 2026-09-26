import { Product, Location, ProductCategory, StockOperation, StockLedgerEntry, User } from '../types';
import { INITIAL_USER, SEED_CATEGORIES, SEED_LOCATIONS, SEED_PRODUCTS, SEED_OPERATIONS, createSeedLedger } from './seedData';

const STORAGE_KEYS = {
  PRODUCTS: 'stocksense_products_v1',
  CATEGORIES: 'stocksense_categories_v1',
  LOCATIONS: 'stocksense_locations_v1',
  OPERATIONS: 'stocksense_operations_v1',
  LEDGER: 'stocksense_ledger_v1',
  USER: 'stocksense_user_v1'
};

export async function loadInitialData() {
  let user: User = INITIAL_USER;
  let categories: ProductCategory[] = SEED_CATEGORIES;
  let locations: Location[] = SEED_LOCATIONS;
  let products: Product[] = SEED_PRODUCTS;
  let operations: StockOperation[] = SEED_OPERATIONS;
  let ledger: StockLedgerEntry[] = [];

  try {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (storedUser) user = JSON.parse(storedUser);

    const storedCats = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (storedCats) categories = JSON.parse(storedCats);

    const storedLocs = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    if (storedLocs) locations = JSON.parse(storedLocs);

    const storedProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (storedProds) products = JSON.parse(storedProds);

    const storedOps = localStorage.getItem(STORAGE_KEYS.OPERATIONS);
    if (storedOps) operations = JSON.parse(storedOps);

    const storedLedger = localStorage.getItem(STORAGE_KEYS.LEDGER);
    if (storedLedger) {
      ledger = JSON.parse(storedLedger);
    } else {
      ledger = await createSeedLedger();
      localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(ledger));
    }
  } catch (err) {
    console.warn('Error loading localStorage, resetting to seed data', err);
    ledger = await createSeedLedger();
  }

  return { user, categories, locations, products, operations, ledger };
}

export function saveStorageData(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export { STORAGE_KEYS };
