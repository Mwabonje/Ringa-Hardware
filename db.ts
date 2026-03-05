import { openDB, DBSchema } from 'idb';
import { InventoryItem, ActivityItem, LPO, DailyStats, User, SystemSettings, Message } from './types';
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
  users: {
    key: string;
    value: User;
    indexes: { 'by-username': string };
  };
  settings: {
    key: string;
    value: SystemSettings;
  };
  messages: {
    key: string;
    value: Message;
    indexes: { 'by-recipient': string };
  };
}

// Changed to v3 to ensure schema update for users
const DB_NAME = 'ringa-hardware-v3';
const DB_VERSION = 3;

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
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('by-username', 'username', { unique: true });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('messages')) {
        const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
        messageStore.createIndex('by-recipient', 'recipientId');
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

  // Seed Super Admin if empty
  const userCount = await db.count('users');
  if (userCount === 0) {
    await db.put('users', {
      id: '1',
      username: 'admin',
      passwordHash: 'admin', // Plain text for prototype
      role: 'SUPER_ADMIN',
      fullName: 'Super Administrator',
      createdAt: new Date().toISOString()
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

export const getUsers = async () => {
  const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
  return db.getAll('users');
};

export const getUserByUsername = async (username: string) => {
  const db = await initDB();
  return db.getFromIndex('users', 'by-username', username);
};

export const getAllData = async () => {
    await initDB();
    const [inventory, activities, lpos, stats, users] = await Promise.all([
        getInventory(),
        getActivities(),
        getLPOs(),
        getStats(),
        getUsers()
    ]);
    return { inventory, activities, lpos, stats, users };
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

export const updateActivity = async (activity: ActivityItem) => {
  const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
  return db.put('activities', activity);
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

export const addUser = async (user: User) => {
  const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
  return db.add('users', user);
};

export const updateUser = async (user: User) => {
  const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
  return db.put('users', user);
};

export const deleteUser = async (id: string) => {
  const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
  return db.delete('users', id);
};

export const getSystemSettings = async () => {
  const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
  const settings = await db.get('settings', 'global');
  return settings || { id: 'global', isSystemLocked: false };
};

export const updateSystemSettings = async (settings: SystemSettings) => {
  const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
  return db.put('settings', { ...settings, id: 'global' });
};

// Batch update for inventory
export const updateInventoryBatch = async (items: InventoryItem[]) => {
    const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
    const tx = db.transaction('inventory', 'readwrite');
    await Promise.all([...items.map(item => tx.store.put(item))]);
    await tx.done;
};

// --- MESSAGING ---

export const sendMessage = async (message: Message) => {
  const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
  return db.add('messages', message);
};

export const getMessagesForUser = async (userId: string, role: string) => {
  const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
  const allMessages = await db.getAll('messages');
  
  return allMessages.filter(msg => 
    msg.recipientId === userId || 
    (msg.recipientId === 'ADMIN' && role === 'ADMIN') ||
    (msg.recipientId === 'ALL' && role !== 'SUPER_ADMIN')
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getSentMessages = async (userId: string) => {
  const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
  const allMessages = await db.getAll('messages');
  return allMessages.filter(msg => msg.senderId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const markMessageAsRead = async (messageId: string) => {
  const db = await openDB<RingaDB>(DB_NAME, DB_VERSION);
  const message = await db.get('messages', messageId);
  if (message) {
    message.isRead = true;
    await db.put('messages', message);
  }
};