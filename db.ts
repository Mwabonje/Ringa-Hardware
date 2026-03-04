import { openDB, DBSchema } from 'idb';
import { InventoryItem, ActivityItem, LPO, DailyStats } from './types';
import { INVENTORY_DATA } from './constants';

interface RingaDB extends DBSchema {
  inventory: {
    key: string;
    value: InventoryItem;
  };
  activities: {
    key: string;
    value: ActivityItem;
  };
  lpos: {
    key: string;
    value: LPO;
  };
  stats: {
    key: string;
    value: DailyStats & { id: string };
  };
}

// Changed to v2 to ensure a fresh start for the user
const DB_NAME = 'ringa-hardware-v2';
const DB_VERSION = 1;

export const initDB = async () => {
  const db = await openDB<RingaDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('inventory')) {
        db.createObjectStore('inventory', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('activities')) {
        db.createObjectStore('activities', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('lpos')) {
        db.createObjectStore('lpos', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('stats')) {
        db.createObjectStore('stats', { keyPath: 'id' });
      }
    },
  });

  // Seed Data if empty
  const invCount = await db.count('inventory');
  if (invCount === 0 && INVENTORY_DATA.length > 0) {
    const tx = db.transaction('inventory', 'readwrite');
    for (const item of INVENTORY_DATA) {
      await tx.store.put(item);
    }
    await tx.done;
  }
  
  // Seed Stats if empty
  const stats = await db.get('stats', 'daily');
  if (!stats) {
    await db.put('stats', {
        id: 'daily',
        revenue: 0,
        profit: 0,
        transactionCount: 0
    });
  }

  return db;
};

// --- DATA FETCHING HELPERS ---

export const getInventory = async () => {
  const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
  return db.getAll('inventory');
};

export const getActivities = async () => {
  const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
  const acts = await db.getAll('activities');
  // Sort by ID (timestamp) descending
  return acts.sort((a, b) => Number(b.id) - Number(a.id));
};

export const getLPOs = async () => {
  const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
  const lpos = await db.getAll('lpos');
  return lpos.sort((a, b) => Number(b.id) - Number(a.id));
};

export const getStats = async () => {
  const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
  const stats = await db.get('stats', 'daily');
  return stats || { id: 'daily', revenue: 0, profit: 0, transactionCount: 0 };
};

export const getAllData = async () => {
    await initDB();
    const [inventory, activities, lpos, stats] = await Promise.all([
        getInventory(),
        getActivities(),
        getLPOs(),
        getStats()
    ]);
    return { inventory, activities, lpos, stats };
};

// --- CRUD OPERATIONS ---

export const updateInventoryItem = async (item: InventoryItem) => {
  const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
  return db.put('inventory', item);
};

export const addInventoryItem = async (item: InventoryItem) => {
  const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
  return db.put('inventory', item);
};

export const addActivity = async (activity: ActivityItem) => {
  const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
  return db.add('activities', activity);
};

export const addLPO = async (lpo: LPO) => {
  const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
  return db.add('lpos', lpo);
};

export const updateLPO = async (lpo: LPO) => {
  const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
  return db.put('lpos', lpo);
};

export const updateStats = async (stats: DailyStats) => {
  const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
  return db.put('stats', { ...stats, id: 'daily' });
};

// Batch update for inventory
export const updateInventoryBatch = async (items: InventoryItem[]) => {
    const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
    const tx = db.transaction('inventory', 'readwrite');
    await Promise.all([...items.map(item => tx.store.put(item))]);
    await tx.done;
};